import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Group } from '../../model/base-entity/Group';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';
import { ApiResponse } from '../utils/apiResponse';

const genericRepository = new GenericRepository();

export async function getAllGroup(req: Request, res: Response) {
    const groupList: Group[] = await genericRepository.select<Group>('tm_group');
    if (groupList?.length > 0) {
        const groupDetailList: GroupDetail[] = groupList.map((group) => ({
            idgroup: group.idgroup,
            groupname: group.groupname,
            description: group.description,
            menublob: group.menublob,
            deleteable: group.deleteable === 1,
        }));
        return await ResponseHelper.send(res, ApiResponse.success(groupDetailList));
    }
    await ResponseHelper.send(res, ApiResponse.success(groupList));
}

export async function getGroup(req: Request, res: Response) {
    try {
        const requestParam = req.params['id'];
        const existingGroup: Group | null = await genericRepository.findOne<Group>('tm_group', [
            { column: 'idgroup', operator: '=', value: requestParam },
        ]);
        if (!existingGroup) {
            return await ResponseHelper.send(res, ApiResponse.successNoData([], 'Group does not exist'));
        }

        const groupDetail: GroupDetail = {
            idgroup: existingGroup.idgroup,
            groupname: existingGroup.groupname,
            description: existingGroup.description,
            menublob: existingGroup.menublob,
            deleteable: existingGroup.deleteable === 1,
        };
        return await ResponseHelper.send(res, ApiResponse.success(groupDetail));
    } catch (error) {
        console.error('Error Group.controller function getGroup : ', error);
        return await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}

export async function addGroup(req: Request, res: Response) {
    try {
        const requestBodyGroup: GroupDetail = req.body;
        const userInfo: UserSession = (req.session as any).user;
        const existingGroup: Group | null = await genericRepository.findOne<Group>('tm_group', [
            { column: 'groupname', operator: '=', value: requestBodyGroup.groupname },
        ]);
        if (existingGroup) {
            return await ResponseHelper.send(res, ApiResponse.successNoData([], 'Group name Already taken!, please use anything else'));
        }

        const payloadInsert: Partial<Group> = {
            ...requestBodyGroup,
            idgroup: uuidv4(),
            created_by: userInfo.iduser,
            created_date: nowJSDate(),
            deleteable: 1,
        };
        const insertGroupList: Group[] = await genericRepository.insert<Group>('tm_group', payloadInsert);
        if (insertGroupList.length === 0) {
            return await ResponseHelper.send(res, ApiResponse.successNoData(null, 'Unable to add data!'));
        }
        await ResponseHelper.send(res, ApiResponse.success());
    } catch (error) {
        console.error('Error Group.controller : ', error);
        return await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}

export async function editGroup(req: Request, res: Response) {
    try {
        const requestBodyGroup: GroupDetail = req.body;
        const userInfo: UserSession = (req.session as any).user;

        const payloadInsert: Partial<Group> = {
            ...requestBodyGroup,
            updated_by: userInfo?.iduser,
            updated_date: nowJSDate(),
            deleteable: requestBodyGroup.deleteable ? 1 : 0,
        };
        const GroupList: Group[] = await genericRepository.update<Group>('tm_group', payloadInsert, [
            { column: 'idgroup', operator: '=', value: requestBodyGroup.idgroup },
        ]);
        if (GroupList.length === 0) {
            return await ResponseHelper.send(res, ApiResponse.successNoData(null, 'Unable to update data!'));
        }
        await ResponseHelper.send(res, ApiResponse.success());
    } catch (error) {
        console.error('Error Group.controller : ', error);
        await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}

export async function deleteGroup(req: Request, res: Response) {
    try {
        const requestBodyGroup: GroupDetail = req.body;
        const GroupList: Group[] = await genericRepository.delete<Group>('tm_group', [
            { column: 'idgroup', operator: '=', value: requestBodyGroup.idgroup },
        ]);
        if (GroupList.length === 0) {
            return await ResponseHelper.send(res, ApiResponse.successNoData(null, 'Unable to delete data!'));
        }
        await ResponseHelper.send(res, ApiResponse.success());
    } catch (error) {
        console.error('Error Group.controller : ', error);
        await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
    }
}
