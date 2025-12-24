import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../model/base-entity/Role';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { DateUtils } from '../config/date-utils';
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
            deleted: role.deleted,
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
            created_date: DateUtils.nowJSDate(),
            deleted: true,
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
            updated_date: DateUtils.nowJSDate(),
            deleted: requestBodyRole.deleted,
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
        const requestBody = req.body;
        if (Array.isArray(requestBody)) {
            for (const detail of requestBody) {
                await genericRepository.delete<Role>('tm_role', [{ column: 'idRole', operator: '=', value: detail.idRole }]);
            }
        } else {
            await genericRepository.delete<Role>('tm_role', [{ column: 'idRole', operator: '=', value: requestBody.idRole }]);
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}
