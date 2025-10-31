import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Group } from '../../model/base-entity/Group';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

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
        return ResponseHelper.success(res, groupDetailList);
    }
    ResponseHelper.success(res);
}

export async function getGroup(req: Request, res: Response) {
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
            menublob: existingGroup.menublob,
            deleteable: existingGroup.deleteable === 1,
        };
        return ResponseHelper.success(res, groupDetail);
    } catch (error) {
        return ResponseHelper.error(res, error);
    }
}

export async function addGroup(req: Request, res: Response) {
    try {
        const requestBodyGroup: any = req.body;
        const userInfo: UserSession = (req.session as any).user;
        const existingGroup: Group | null = await genericRepository.findOne<Group>('tm_group', [
            { column: 'groupname', operator: '=', value: requestBodyGroup.groupname },
        ]);
        if (existingGroup) {
            return ResponseHelper.error(res, 'Group name Already taken!, please use anything else');
        }

        let menuData = requestBodyGroup.menublob;
        if (typeof menuData === 'string') {
            try {
                menuData = JSON.parse(menuData);
            } catch (err) {
                console.error('Invalid menublob JSON:', err);
                menuData = {}; // fallback to empty object
            }
        }

        const payloadInsert: Partial<Group> = {
            ...requestBodyGroup,
            menublob: menuData,
            idgroup: uuidv4(),
            created_by: userInfo.iduser,
            created_date: nowJSDate(),
            deleteable: 1,
        };
        const insertGroupList: Group[] = await genericRepository.insert<Group>('tm_group', payloadInsert);
        if (insertGroupList.length === 0) {
            return ResponseHelper.error(res, 'Unable to add data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.success(res, error);
    }
}

export async function editGroup(req: Request, res: Response) {
    try {
        const requestBodyGroup: any = req.body;
        const userInfo: UserSession = (req.session as any).user;

        let parsedMenublob: any = requestBodyGroup.menublob;

        // Handle if menublob is JSON string
        if (typeof parsedMenublob === 'string') {
            try {
                parsedMenublob = JSON.parse(parsedMenublob);
            } catch (err) {
                console.error('❌ menublob parse error:', err);
                parsedMenublob = null;
            }
        }

        // Handle if menublob is empty string or invalid
        if (!parsedMenublob || typeof parsedMenublob !== 'object') {
            parsedMenublob = null;
        }

        const payloadInsert: Partial<Group> = {
            ...requestBodyGroup,
            menublob: parsedMenublob,
            updated_by: userInfo?.iduser,
            updated_date: nowJSDate(),
            deleteable: requestBodyGroup.deleteable ? 1 : 0,
        };
        const GroupList: Group[] = await genericRepository.update<Group>('tm_group', payloadInsert, [
            { column: 'idgroup', operator: '=', value: requestBodyGroup.idgroup },
        ]);
        if (GroupList.length === 0) {
            return ResponseHelper.error(res, 'Unable to update data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.success(res, error);
    }
}

export async function deleteGroup(req: Request, res: Response) {
    try {
        const requestBodyGroup: GroupDetail = req.body;
        const GroupList: Group[] = await genericRepository.delete<Group>('tm_group', [
            { column: 'idgroup', operator: '=', value: requestBodyGroup.idgroup },
        ]);
        if (GroupList.length === 0) {
            return ResponseHelper.error(res, 'Unable to delete data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.success(res, error);
    }
}
