import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Group } from '../../model/base-entity/Group';
import { GroupMenuRole } from '../../model/base-entity/group.menu.role';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { JoinQuery } from '../../model/others/JoinQuery';
import { RouterItem } from '../../model/others/RouterItem';
import db from '../config/client';
import { DateUtils } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

const genericRepository = new GenericRepository();

export class GroupController {
    public static async getAllGroup(req: Request, res: Response) {
        const groupList: Group[] = await genericRepository.select<Group>('tm_group');
        if (groupList?.length > 0) {
            const groupDetailList: GroupDetail[] = groupList.map((group) => ({
                idgroup: group.idgroup,
                groupname: group.groupname,
                description: group.description,
                menublob: [],
                deleted: group.deleted,
            }));
            return ResponseHelper.success(res, groupDetailList);
        }
        ResponseHelper.success(res);
    }

    public static async getAllGroupMenuRole(req: Request, res: Response) {
        try {
            const tempJoinQuery: JoinQuery[] = [
                {
                    table: 'tm_group_menu_role',
                    first: 'tm_group_menu_role.idgroup',
                    operator: '=',
                    second: 'tm_group.idgroup',
                    type: 'left',
                },
                {
                    table: 'tm_menus',
                    first: 'tm_menus.idMenu',
                    operator: '=',
                    second: 'tm_group_menu_role.idMenu',
                    type: 'left',
                },
                {
                    table: 'tm_role',
                    first: 'tm_role.idRole',
                    operator: '=',
                    second: 'tm_group_menu_role.idRole',
                    type: 'left',
                },
            ];

            const resultQueryList = await genericRepository.select<Record<string, any>>('tm_group', tempJoinQuery);
            const result = GroupController.getGroupMenuRoleList(resultQueryList);

            return ResponseHelper.success(res, result);
        } catch (error) {
            return ResponseHelper.error(res, error);
        }
    }

    public static getGroupMenuRoleList(resultQueryList: any[]): GroupDetail[] {
        if (!resultQueryList?.length) return [];

        const groupMap = new Map<string, any[]>();
        const groupInfoMap = new Map<string, { groupname: string; description: string; deleted: boolean }>();

        // Single pass to group data
        for (const item of resultQueryList) {
            const groupId = item['tm_group_idgroup'];
            if (!groupId) {
                continue;
            }

            if (!groupMap.has(groupId)) {
                groupMap.set(groupId, []);
                groupInfoMap.set(groupId, {
                    groupname: item['tm_group_groupname'],
                    description: item['tm_group_description'],
                    deleted: item['tm_group_deleted'],
                });
            }

            // Only push if we have menu data to avoid empty records
            if (item['tm_menus_idMenu']) {
                groupMap.get(groupId)!.push(item);
            }
        }

        const result = Array.from(groupMap.entries()).map(([idGroup, menuList]) => {
            const menublob = GroupController.buildNestedRouterItems(menuList);

            return {
                idgroup: idGroup,
                groupname: groupInfoMap.get(idGroup)!.groupname,
                description: groupInfoMap.get(idGroup)!.description,
                deleted: groupInfoMap.get(idGroup)!.deleted,
                menublob: menublob,
            };
        });

        return result;
    }

    private static buildNestedRouterItems(flatItems: any[]): RouterItem[] {
        if (!flatItems?.length) {
            return [];
        }

        const tempFlatItems = GroupController.buildMenuRole(flatItems);

        if (tempFlatItems.length === 0) {
            return [];
        }

        const { menuMap, rootItems } = GroupController.createMenuMap(tempFlatItems);
        GroupController.buildMenuHierarchy(tempFlatItems, menuMap);
        GroupController.sortMenuItems(menuMap, rootItems);

        return rootItems;
    }

    private static createMenuMap(menuItems: RouterItem[]): {
        menuMap: Map<string | number, RouterItem>;
        rootItems: RouterItem[];
    } {
        const menuMap = new Map<string | number, RouterItem>();
        const rootItems: RouterItem[] = [];

        for (const item of menuItems) {
            if (!item.key) {
                continue;
            }

            const clonedItem = GroupController.cloneRouterItem(item);
            menuMap.set(clonedItem.key, clonedItem);

            const parentId = clonedItem.data?.parentIdMenu;
            if (!parentId) {
                rootItems.push(clonedItem);
            }
        }

        return { menuMap, rootItems };
    }

    private static cloneRouterItem(item: RouterItem): RouterItem {
        return {
            key: item.key,
            label: item.label,
            icon: item.icon,
            data: {
                ...item.data,
                permission: item.data.permission ? [...item.data.permission] : [],
            },
            children: [],
        };
    }

    private static buildMenuHierarchy(menuItems: RouterItem[], menuMap: Map<string | number, RouterItem>): void {
        for (const item of menuItems) {
            const parentId = item.data?.parentIdMenu;
            if (!parentId) {
                continue;
            }

            const parent = menuMap.get(parentId);
            const childItem = menuMap.get(item.key);

            if (parent && childItem) {
                GroupController.addChildToParent(parent, childItem);
            }
        }
    }

    private static addChildToParent(parent: RouterItem, child: RouterItem): void {
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(child);
    }

    private static sortMenuItems(menuMap: Map<string | number, RouterItem>, rootItems: RouterItem[]): void {
        // Sort children for each menu item
        for (const item of menuMap.values()) {
            GroupController.sortMenuChildren(item);
        }

        // Sort root items
        GroupController.sortMenuList(rootItems);
    }

    private static sortMenuChildren(menuItem: RouterItem): void {
        if (!menuItem.children?.length) {
            return;
        }

        menuItem.children.sort(GroupController.compareMenuSequence);
    }

    private static sortMenuList(menuList: RouterItem[]): void {
        if (menuList.length === 0) {
            return;
        }

        menuList.sort(GroupController.compareMenuSequence);
    }

    private static compareMenuSequence(a: RouterItem, b: RouterItem): number {
        const aSequence = a.data?.menuSequence ?? Number.MAX_SAFE_INTEGER;
        const bSequence = b.data?.menuSequence ?? Number.MAX_SAFE_INTEGER;
        return aSequence - bSequence;
    }

    private static buildMenuRole(flatItems: any[]): RouterItem[] {
        const menuRoleMap = new Map<string, RouterItem>();

        for (const record of flatItems) {
            const idMenu = record.tm_menus_idMenu;
            const parentIdMenu = record.tm_group_menu_role_parentIdMenu;

            if (!idMenu || !record.tm_menus_nameMenu) {
                continue;
            }

            if (!menuRoleMap.has(idMenu)) {
                const menuData: any = {
                    routerLink: record.tm_menus_pathMenu,
                    roleList: [],
                    deleted: record.tm_menus_deleted,
                    permission: [],
                    menuSequence: record.tm_group_menu_role_menuSequence,
                    parentIdMenu: parentIdMenu ?? null,
                };

                menuRoleMap.set(idMenu, {
                    key: idMenu,
                    label: record.tm_menus_nameMenu,
                    icon: record.tm_menus_iconMenu,
                    children: [],
                    data: menuData,
                });
            }

            // Add role permission if exists
            if (record.tm_role_idRole && record.tm_role_rolename) {
                const currentMenu = menuRoleMap.get(idMenu);
                if (currentMenu?.data?.permission) {
                    currentMenu.data.permission.push({
                        idRole: record.tm_role_idRole,
                        rolename: record.tm_role_rolename,
                        roledescription: record.tm_role_roledescription,
                        deleted: record.tm_role_deleted,
                    });
                }
            }
        }

        const result = Array.from(menuRoleMap.values()).sort((a, b) => {
            const aIsRoot = a.data?.parentIdMenu == null;
            const bIsRoot = b.data?.parentIdMenu == null;

            if (aIsRoot !== bIsRoot) {
                return aIsRoot ? -1 : 1;
            }

            const aSequence = a.data?.menuSequence ?? Number.MAX_SAFE_INTEGER;
            const bSequence = b.data?.menuSequence ?? Number.MAX_SAFE_INTEGER;

            return aSequence - bSequence;
        });

        return result;
    }

    public static async getGroup(req: Request, res: Response) {
        try {
            const requestParam = req.params['id'];
            const existingGroup: Group | null = await genericRepository.findOne<Group>('tm_group', [
                { column: 'idgroup', operator: '=', value: requestParam },
            ]);
            if (!existingGroup) {
                return ResponseHelper.error(res, 'Group does not exist');
            }

            const groupDetail: GroupDetail = {
                idgroup: existingGroup.idgroup,
                groupname: existingGroup.groupname,
                description: existingGroup.description,
                menublob: [],
                deleted: existingGroup.deleted,
            };
            return ResponseHelper.success(res, groupDetail);
        } catch (error) {
            return ResponseHelper.error(res, error);
        }
    }

    public static async addGroup(req: Request, res: Response) {
        try {
            const requestBodyGroup: GroupDetail = req.body;
            const userInfo: UserSession = (req.session as any).user;
            const existingGroup: Group | null = await genericRepository.findOne<Group>('tm_group', [
                { column: 'groupname', operator: '=', value: requestBodyGroup.groupname },
            ]);
            if (existingGroup) {
                return ResponseHelper.error(res, 'Group name Already taken!, please use anything else');
            }

            const payloadGroup: Partial<Group> = {
                groupname: requestBodyGroup.groupname,
                description: requestBodyGroup.description,
                status: true,
                idgroup: uuidv4(),
                created_by: userInfo.iduser,
                created_date: DateUtils.nowJSDate(),
                deleted: true,
            };
            const tempGroupMenuRoleList: GroupMenuRole[] = GroupController.buildGroupMenuRole(payloadGroup, requestBodyGroup.menublob);
            GroupController.groupTransaction(payloadGroup, tempGroupMenuRoleList, 'create');
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    public static async editGroup(req: Request, res: Response) {
        try {
            const requestBodyGroup: GroupDetail = req.body;
            const userInfo: UserSession = (req.session as any).user;

            const payloadGroup: Partial<Group> = {
                idgroup: requestBodyGroup.idgroup,
                groupname: requestBodyGroup.groupname,
                description: requestBodyGroup.description,
                status: true,
                updated_by: userInfo?.iduser,
                updated_date: DateUtils.nowJSDate(),
                deleted: requestBodyGroup.deleted,
            };
            const tempGroupMenuRoleList: GroupMenuRole[] = GroupController.buildGroupMenuRole(payloadGroup, requestBodyGroup.menublob);
            GroupController.groupTransaction(payloadGroup, tempGroupMenuRoleList, 'edit');
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    private static buildGroupMenuRole(
        payloadGroup: Partial<Group>,
        routerItemList: RouterItem[],
        parentIdMenu: number | null = null
    ): GroupMenuRole[] {
        if (!routerItemList?.length) return [];

        const resultGroupDetail: GroupMenuRole[] = [];

        for (const [index, routerItem] of routerItemList.entries()) {
            const { key, data, children } = routerItem;
            const idMenu = Number(key);

            // Process permissions if they exist
            if (data?.permission && data?.permission.length > 0) {
                for (const role of data.permission) {
                    const groupMenuRole: GroupMenuRole = {
                        idgroup: payloadGroup.idgroup ?? '',
                        idMenu,
                        idRole: role.idRole,
                        menuSequence: index + 1,
                        parentIdMenu: parentIdMenu,
                    };
                    resultGroupDetail.push(groupMenuRole);
                }
            } else {
                // Add entry without role
                resultGroupDetail.push({
                    idgroup: payloadGroup.idgroup ?? '',
                    idMenu,
                    menuSequence: index + 1,
                    parentIdMenu: parentIdMenu,
                });
            }

            // Recursively process children
            if (children && children.length > 0) {
                const childItems = this.buildGroupMenuRole(payloadGroup, children, idMenu);
                resultGroupDetail.push(...childItems);
            }
        }

        return resultGroupDetail;
    }

    private static async groupTransaction(group: Partial<Group>, groupMenuRole: GroupMenuRole[], transactionMode: 'create' | 'edit') {
        try {
            return await db.transaction(async (trx) => {
                // Insert into group
                const [resultGroup] =
                    transactionMode === 'create'
                        ? await genericRepository.insert('tm_group', group, trx)
                        : await genericRepository.update('tm_group', group, [{ column: 'idgroup', operator: '=', value: group.idgroup ?? '' }], trx);
                const tempIdGroup = resultGroup.idgroup;

                if (transactionMode === 'edit') {
                    await genericRepository.delete('tm_group_menu_role', [{ column: 'idgroup', operator: '=', value: tempIdGroup }], trx);
                }
                if (groupMenuRole.length > 0) {
                    await genericRepository.insert('tm_group_menu_role', groupMenuRole, trx);
                }
            });
        } catch (error) {
            throw error;
        }
    }

    public static async deleteGroup(req: Request, res: Response) {
        try {
            const requestBody = req.body;
            await db.transaction(async (trx) => {
                if (Array.isArray(requestBody)) {
                    for (const detail of requestBody) {
                        await genericRepository.delete<GroupMenuRole>('tm_group_menu_role', [{ column: 'idgroup', operator: '=', value: detail.idgroup }], trx);
                        await genericRepository.delete<Group>('tm_group', [{ column: 'idgroup', operator: '=', value: detail.idgroup }], trx);
                    }
                } else {
                    await genericRepository.delete<GroupMenuRole>('tm_group_menu_role', [{ column: 'idgroup', operator: '=', value: requestBody.idgroup }], trx);
                    await genericRepository.delete<Group>('tm_group', [{ column: 'idgroup', operator: '=', value: requestBody.idgroup }], trx);
                }
            });
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }
}
