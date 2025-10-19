import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Group } from '../../model/base-entity/Group';
import { User } from '../../model/base-entity/User';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';
import { UserDetail } from '../../model/custom-entity/UserDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

const genericRepository = new GenericRepository();

export async function getAllUsers(req: Request, res: Response) {
    interface UserGroup extends User, Group {}
    const userList: UserGroup[] = await genericRepository.select<UserGroup>('tm_user', [
        {
            table: 'tm_group',
            first: 'tm_user.idgroup',
            second: 'tm_group.idgroup',
            type: 'left',
        },
    ]);
    if (userList.length > 0) {
        const userInfoList: UserDetail[] = userList.map((user) => {
            const tempGroup: GroupDetail = {
                idgroup: user.idgroup,
                groupname: user.groupname,
                description: user.description,
                menublob: user.menublob,
                deleteable: user.deleteable === 1,
            };
            return {
                username: user.username,
                idgroup: user.idgroup,
                fullname: user.fullname,
                email: user.email,
                mobile: user.mobile,
                group: tempGroup,
                isAdmin: user.isAdmin === 1,
                iduser: user.iduser,
                deleteable: user.deleteable === 1,
                status: user.status === 1,
                password: '',
            };
        });
        return ResponseHelper.success(res, userInfoList);
    }
    ResponseHelper.success(res);
}

export async function addUser(req: Request, res: Response) {
    try {
        const requestBodyUser: UserDetail = req.body;
        const userInfo: UserSession = (req.session as any).user;
        const existingUser: User | null = await genericRepository.findOne<User>('tm_user', [
            { column: 'username', operator: '=', value: requestBodyUser.username },
        ]);
        if (existingUser) {
            return ResponseHelper.error(res, 'Username Already taken!, please use anything else');
        }
        const newPassword = await bcrypt.hash(requestBodyUser.password, 10);
        const uid = uuidv4();
        const payloadInsert: Partial<User> = {
            iduser: uid,
            username: requestBodyUser.username,
            idgroup: requestBodyUser.group.idgroup,
            fullname: requestBodyUser.fullname,
            mobile: requestBodyUser.mobile,
            email: requestBodyUser.email,
            created_by: userInfo?.iduser || uid,
            created_date: nowJSDate(),
            password: newPassword,
            deleteable: requestBodyUser.isAdmin ? 0 : 1,
            status: requestBodyUser.status ? 1 : 0,
            isAdmin: requestBodyUser.isAdmin ? 1 : 0,
        };
        const insertUserList: User[] = await genericRepository.insert<User>('tm_user', payloadInsert);
        if (insertUserList.length === 0) {
            return ResponseHelper.error(res, 'Unable to add data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}

export async function editUser(req: Request, res: Response) {
    try {
        const requestBodyUser: UserDetail = req.body;
        const userInfo: UserSession = (req.session as any).user;
        const payloadInsert: Partial<User> = {
            username: requestBodyUser.username,
            idgroup: requestBodyUser.group.idgroup,
            fullname: requestBodyUser.fullname,
            mobile: requestBodyUser.mobile,
            email: requestBodyUser.email,
            updated_by: userInfo?.iduser,
            updated_date: nowJSDate(),
            deleteable: requestBodyUser.isAdmin ? 0 : 1,
            status: requestBodyUser.status ? 1 : 0,
            isAdmin: requestBodyUser.isAdmin ? 1 : 0,
        };
        const userList: User[] = await genericRepository.update<User>('tm_user', payloadInsert, [
            { column: 'username', operator: '=', value: requestBodyUser.username },
        ]);
        if (userList.length === 0) {
            return ResponseHelper.error(res, 'Unable to update data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const requestBodyUser: UserDetail = req.body;
        const userList: User[] = await genericRepository.delete<User>('tm_user', [
            { column: 'username', operator: '=', value: requestBodyUser.username },
        ]);
        if (userList.length === 0) {
            return ResponseHelper.error(res, 'Unable to delete data!');
        }
        ResponseHelper.success(res);
    } catch (error) {
        ResponseHelper.error(res, error);
    }
}
