import { Request, Response } from 'express';
import { Icon } from '../../model/base-entity/Icon';
import { Menu } from '../../model/base-entity/Menu';
import { MenuDetail } from '../../model/custom-entity/MenuDetail';
import { MenuRole } from '../../model/custom-entity/MenuRole';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { Condition } from '../../model/others/ConditionQuery';
import { JoinQuery } from '../../model/others/JoinQuery';
import { Order } from '../../model/others/OrderQuery';
import db from '../config/client';
import { DateUtils } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

const genericRepository = new GenericRepository();

export class MenuController {
    static async getAllMenu(req: Request, res: Response) {
        const menuList: Menu[] = await genericRepository.select<Menu>('tm_menus');
        if (menuList?.length > 0) {
            const menuDetailList: MenuDetail[] = menuList.map((menu) => ({
                idMenu: menu.idMenu,
                nameMenu: menu.nameMenu,
                pathMenu: menu.pathMenu,
                iconMenu: menu.iconMenu,
                deleted: menu.deleted,
            }));
            return ResponseHelper.success(res, menuDetailList);
        }
        ResponseHelper.success(res);
    }

    static async getAllMenuRole(req: Request, res: Response) {
        const tempJoinQuery: JoinQuery[] = [
            { table: 'tm_menu_role', first: 'tm_menu_role.idMenu', operator: '=', second: 'tm_menus.idMenu', type: 'left' },
            { table: 'tm_role', first: 'tm_role.idRole', operator: '=', second: 'tm_menu_role.idRole', type: 'left' },
        ];

        const columnOrdering: Order<any>[] = [{ column: 'tm_menus.nameMenu', direction: 'asc' }];
        const resultQueryList: any[] = await genericRepository.select<Record<string, any>>('tm_menus', tempJoinQuery, [], columnOrdering);

        if (resultQueryList?.length > 0) {
            // ✅ Use Map to preserve order
            const menuRoleMap = new Map<number | string, MenuRole>();

            for (const record of resultQueryList) {
                const idMenu = record.tm_menus_idMenu;
                if (!menuRoleMap.has(idMenu)) {
                    menuRoleMap.set(idMenu, {
                        idMenu,
                        nameMenu: record.tm_menus_nameMenu,
                        pathMenu: record.tm_menus_pathMenu,
                        iconMenu: record.tm_menus_iconMenu,
                        deleted: record.tm_menus_deleted,
                        roleList: [],
                    });
                }

                if (record.tm_role_idRole && record.tm_role_rolename) {
                    const current = menuRoleMap.get(idMenu)!;
                    current.roleList.push({
                        idRole: record.tm_role_idRole,
                        rolename: record.tm_role_rolename,
                        roledescription: record.tm_role_roledescription,
                        deleted: record.tm_role_deleted,
                    });
                }
            }

            // ✅ Preserve insertion order
            const menuRoleList = Array.from(menuRoleMap.values());

            return ResponseHelper.success(res, menuRoleList);
        }

        ResponseHelper.success(res);
    }

    static async getAllMenuIcons(req: Request, res: Response) {
        const iconList: Icon[] = await genericRepository.select<Icon>('tm_icons');
        ResponseHelper.success(res, iconList);
    }

    static async addMenu(req: Request, res: Response) {
        try {
            const requestBodyMenu: MenuRole = req.body;
            const userInfo: UserSession = (req.session as any).user;

            const existingMenu: Menu | null = await genericRepository.findOne<Menu>('tm_menus', [
                { column: 'nameMenu', operator: '=', value: requestBodyMenu.nameMenu },
            ]);
            if (existingMenu) {
                return ResponseHelper.error(res, 'Menu name Already taken!, please use anything else');
            }

            const payloadInsert: Partial<Menu> = {
                nameMenu: requestBodyMenu.nameMenu,
                pathMenu: requestBodyMenu.pathMenu || requestBodyMenu.pathMenu !== '' ? requestBodyMenu.pathMenu : null,
                iconMenu: requestBodyMenu.iconMenu,
                created_by: userInfo?.iduser,
                created_date: DateUtils.nowJSDate(),
                deleted: true,
            };
            await db.transaction(async (trx) => {
                // Insert into Menu
                const insertMenuList: Menu[] = await genericRepository.insert<Menu>('tm_menus', payloadInsert, trx);
                if (insertMenuList.length === 0) {
                    return ResponseHelper.error(res, 'Unable to add data!');
                }

                // Insert into menu-role
                if (requestBodyMenu.roleList && requestBodyMenu.roleList.length > 0) {
                    const tempMenuRole = requestBodyMenu.roleList.map((role: RoleDetail) => ({
                        idMenu: insertMenuList[0].idMenu,
                        idRole: role.idRole,
                    }));
                    await genericRepository.insert('tm_menu_role', tempMenuRole, trx);
                }
            });

            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async editMenu(req: Request, res: Response) {
        try {
            const requestBodyMenu: MenuRole = req.body;
            const userInfo: UserSession = (req.session as any).user;

            const payloadUpdate: Partial<Menu> = {
                idMenu: requestBodyMenu.idMenu,
                nameMenu: requestBodyMenu.nameMenu,
                pathMenu: requestBodyMenu.pathMenu || requestBodyMenu.pathMenu !== '' ? requestBodyMenu.pathMenu : null,
                iconMenu: requestBodyMenu.iconMenu,
                created_by: userInfo?.iduser,
                created_date: DateUtils.nowJSDate(),
                deleted: true,
            };
            const tempCondition: Condition<Menu>[] = [{ column: 'idMenu', operator: '=', value: requestBodyMenu.idMenu }];
            await db.transaction(async (trx) => {
                // Insert into Menu
                const updateMenuList: Menu[] = await genericRepository.update<Menu>('tm_menus', payloadUpdate, tempCondition, trx);
                if (updateMenuList.length === 0) {
                    return ResponseHelper.error(res, 'Unable to update data!');
                }
                await genericRepository.delete<Menu>('tm_menu_role', tempCondition, trx);
                // Insert into menu-role
                if (requestBodyMenu.roleList && requestBodyMenu.roleList.length > 0) {
                    const tempMenuRole = requestBodyMenu.roleList.map((role: RoleDetail) => ({
                        idMenu: requestBodyMenu.idMenu,
                        idRole: role.idRole,
                    }));
                    await genericRepository.insert('tm_menu_role', tempMenuRole, trx);
                }
            });
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async deleteMenu(req: Request, res: Response) {
        try {
            const requestBody = req.body;
            if (Array.isArray(requestBody)) {
                for (const detail of requestBody) {
                    if (await MenuController.checkMenuExistInGroup(detail.idMenu)) {
                        return ResponseHelper.error(res, `Menu ${detail.nameMenu} is still assigned to a group, cannot be deleted!`);
                    }
                    await MenuController.deleteMenuByIdMenu(detail.idMenu);
                }
            } else {
                if (await MenuController.checkMenuExistInGroup(requestBody.idMenu)) {
                    return ResponseHelper.error(res, `Menu ${requestBody.nameMenu} is still assigned to a group, cannot be deleted!`);
                }
                await MenuController.deleteMenuByIdMenu(requestBody.idMenu);
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    private static async checkMenuExistInGroup(idMenu: any): Promise<boolean> {
        const existingMenu: any[] = await genericRepository.select<Record<string, any>>('tm_group_menu_role', [], [
            { column: 'idMenu', operator: '=', value: idMenu },
        ]);
        return existingMenu.length > 0;
    }

    private static async deleteMenuByIdMenu(idMenu: any): Promise<void> {
        await genericRepository.delete<Menu>('tm_menu_role', [{ column: 'idMenu', operator: '=', value: idMenu }]);
    }
}
