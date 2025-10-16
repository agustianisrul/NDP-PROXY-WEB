import { Request, Response } from 'express';
import { Icon } from '../../model/base-entity/Icon';
import { Menu } from '../../model/base-entity/Menu';
import { MenuDetail } from '../../model/custom-entity/MenuDetail';
import { MenuRole } from '../../model/custom-entity/MenuRole';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { Condition } from '../../model/others/ConditionQuery';
import db from '../config/client';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { getAllMenuRolesQuery } from '../repositories/menu.repository';
import { ResponseHelper } from '../utils/ResponseHelper';
import { ApiResponse } from '../utils/apiResponse';

const genericRepository = new GenericRepository();

export async function getAllMenu(req: Request, res: Response) {
    const menuList: Menu[] = await genericRepository.select<Menu>('tm_menus');
    if (menuList?.length > 0) {
        const menuDetailList: MenuDetail[] = menuList.map((menu) => ({
            idMenu: menu.idMenu,
            nameMenu: menu.nameMenu,
            pathMenu: menu.pathMenu,
            iconMenu: menu.iconMenu,
            deleteable: menu.deleteable === 1,
        }));
        return await ResponseHelper.send(res, ApiResponse.success(menuDetailList));
    }
    await ResponseHelper.send(res, ApiResponse.success(menuList));
}

export async function getAllMenuIcons(req: Request, res: Response) {
    const iconList: Icon[] = await genericRepository.select<Icon>('tm_icons');
    await ResponseHelper.send(res, ApiResponse.success(iconList));
}

export async function addMenu(req: Request, res: Response) {
    try {
        const requestBodyMenu: MenuRole = req.body;
        const userInfo: UserSession = (req.session as any).user;

        const existingMenu: Menu | null = await genericRepository.findOne<Menu>('tm_menus', [
            { column: 'nameMenu', operator: '=', value: requestBodyMenu.nameMenu },
        ]);
        if (existingMenu) {
            return await ResponseHelper.send(res, ApiResponse.successNoData([], 'Menu name Already taken!, please use anything else'));
        }

        const payloadInsert: Partial<Menu> = {
            nameMenu: requestBodyMenu.nameMenu,
            pathMenu: requestBodyMenu.pathMenu,
            iconMenu: requestBodyMenu.iconMenu,
            created_by: userInfo?.iduser,
            created_date: nowJSDate(),
            deleteable: 1,
        };
        await db.transaction(async (trx) => {
            // Insert into Menu
            const insertMenuList: Menu[] = await genericRepository.insert<Menu>('tm_menus', payloadInsert, trx);
            if (insertMenuList.length === 0) {
                return await ResponseHelper.send(res, ApiResponse.successNoData(null, 'Unable to add data!'));
            }

            // Insert into menu-role
            const tempMenuRole = requestBodyMenu.roleList.map((role: RoleDetail) => ({
                idMenu: insertMenuList[0].idMenu,
                idRole: role.idRole,
            }));
            await genericRepository.insert('tm_menu_role', tempMenuRole, trx);
        });

        await ResponseHelper.send(res, ApiResponse.success());
    } catch (error) {
        console.error('Error menu.controller : ', error);
        await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}

export async function editMenu(req: Request, res: Response) {
    try {
        const requestBodyMenu: MenuRole = req.body;
        const userInfo: UserSession = (req.session as any).user;

        const payloadUpdate: Partial<Menu> = {
            idMenu: requestBodyMenu.idMenu,
            nameMenu: requestBodyMenu.nameMenu,
            pathMenu: requestBodyMenu.pathMenu,
            iconMenu: requestBodyMenu.iconMenu,
            created_by: userInfo?.iduser,
            created_date: nowJSDate(),
            deleteable: 1,
        };
        const tempCondition: Condition<Menu>[] = [{ column: 'idMenu', operator: '=', value: requestBodyMenu.idMenu }];
        await db.transaction(async (trx) => {
            // Insert into Menu
            const updateMenuList: Menu[] = await genericRepository.update<Menu>('tm_menus', payloadUpdate, tempCondition, trx);
            if (updateMenuList.length === 0) {
                return await ResponseHelper.send(res, ApiResponse.successNoData(null, 'Unable to update data!'));
            }
            await genericRepository.delete<Menu>('tm_menu_role', tempCondition, trx);
            // Insert into menu-role
            const tempMenuRole = requestBodyMenu.roleList.map((role: RoleDetail) => ({
                idMenu: requestBodyMenu.idMenu,
                idRole: role.idRole,
            }));
            await genericRepository.insert('tm_menu_role', tempMenuRole, trx);
        });
        await ResponseHelper.send(res, ApiResponse.success());
    } catch (error) {
        console.error('Error menu.controller : ', error);
        await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}

export async function deleteMenu(req: Request, res: Response) {
    try {
        const requestBodyMenu: MenuRole = req.body;
        const menuList: Menu[] = await genericRepository.delete<Menu>('tm_menus', [
            { column: 'idMenu', operator: '=', value: requestBodyMenu.idMenu },
        ]);
        if (menuList.length === 0) {
            return await ResponseHelper.send(res, ApiResponse.successNoData(null, 'Unable to delete data!'));
        }
        await ResponseHelper.send(res, ApiResponse.success());
    } catch (error) {
        console.error('Error menu.controller : ', error);
        await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}

export async function getMenuRole(req: Request, res: Response) {
    try {
        interface QueryResultItem {
            idMenu: number;
            nameMenu: string;
            pathMenu: string;
            iconMenu: string;
            deleteableMenu: number;
            idRole: string;
            rolename: string;
            roledescription: string;
            deleteableRole: number;
        }
        const queryResult: QueryResultItem[] = await getAllMenuRolesQuery();
        if (queryResult?.length > 0) {
            const menuRoleList: MenuRole[] = Object.values(
                queryResult.reduce<Record<string, MenuRole>>((acc, record: QueryResultItem) => {
                    if (!acc[record.idMenu]) {
                        acc[record.idMenu] = {
                            idMenu: record.idMenu,
                            nameMenu: record.nameMenu,
                            pathMenu: record.pathMenu,
                            iconMenu: record.iconMenu,
                            deleteable: record.deleteableMenu === 1,
                            roleList: [],
                        };
                    }
                    acc[record.idMenu].roleList.push({
                        idRole: record.idRole,
                        rolename: record.rolename,
                        roledescription: record.roledescription,
                        deleteable: record.deleteableRole === 1,
                    });
                    return acc;
                }, {} as Record<string, MenuRole>)
            );
            return await ResponseHelper.send(res, ApiResponse.success(menuRoleList));
        }
        await ResponseHelper.send(res, ApiResponse.success(queryResult));
    } catch (error) {
        console.error('Error menu.controller : ', error);
        await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}
