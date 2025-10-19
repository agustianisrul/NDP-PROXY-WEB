import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../model/base-entity/Role';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

const genericRepository = new GenericRepository();

export async function getAllRole(req: Request, res: Response) {
    const roleList: Role[] = await genericRepository.select<Role>('tm_role');
    if (roleList?.length > 0) {
        const roleDetailList: RoleDetail[] = roleList.map((role) => ({
            idRole: role.idRole,
            rolename: role.rolename,
            roledescription: role.roledescription,
            deleteable: role.deleteable === 1,
        }));
        return ResponseHelper.success(res, roleDetailList);
    }
    ResponseHelper.success(res);
}

export async function addRole(req: Request, res: Response) {
    try {
        const requestBodyRole: RoleDetail = req.body;
        const userInfo: UserSession = (req.session as any).user;

        const existingRole: Role | null = await genericRepository.findOne<Role>('tm_role', [
            { column: 'rolename', operator: '=', value: requestBodyRole.rolename },
        ]);
        if (existingRole) {
            return ResponseHelper.error(res, 'Menu name Already taken!, please use anything else');
        }

        const payloadInsert: Partial<Role> = {
            ...requestBodyRole,
            idRole: uuidv4(),
            created_by: userInfo?.iduser,
            created_date: nowJSDate(),
            deleteable: 1,
        };
        const insertRoleList: Role[] = await genericRepository.insert<Role>('tm_role', payloadInsert);
        if (insertRoleList.length === 0) {
            return ResponseHelper.error(res, 'Unable to add data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}

export async function editRole(req: Request, res: Response) {
    try {
        const requestBodyRole: RoleDetail = req.body;
        const userInfo: UserSession = (req.session as any).user;
        const payloadInsert: Partial<Role> = {
            ...requestBodyRole,
            updated_by: userInfo?.iduser,
            updated_date: nowJSDate(),
            deleteable: requestBodyRole.deleteable ? 1 : 0,
        };
        const roleList: Role[] = await genericRepository.update<Role>('tm_role', payloadInsert, [
            { column: 'idRole', operator: '=', value: requestBodyRole.idRole },
        ]);
        if (roleList.length === 0) {
            return ResponseHelper.error(res, 'Unable to update data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}

export async function deleteRole(req: Request, res: Response) {
    try {
        const requestBodyRole: RoleDetail = req.body;
        const roleList: Role[] = await genericRepository.delete<Role>('tm_role', [
            { column: 'idRole', operator: '=', value: requestBodyRole.idRole },
        ]);
        if (roleList.length === 0) {
            return ResponseHelper.error(res, 'Unable to delete data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}
