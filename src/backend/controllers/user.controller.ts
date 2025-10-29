import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../model/base-entity/User';
import { UserDetail } from '../../model/custom-entity/UserDetail';
import { UserGroup } from '../../model/custom-entity/UserGroup';
import { UserSession } from '../../model/custom-entity/UserSession';
import { JoinQuery } from '../../model/others/JoinQuery';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

const genericRepository = new GenericRepository();

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        const userList: User[] = await genericRepository.select<User>('tm_user');
        if (userList.length > 0) {
            const userDetailList: UserDetail[] = userList.map((user: User) => ({
                iduser: user.iduser,
                deleteable: user.deleted === 1,
                status: user.status === 1,
                username: user.username,
                idgroup: user.idgroup,
                fullname: user.fullname,
                mobile: user.mobile,
                email: user.email,
                isAdmin: user.isAdmin === 1,
                password: '',
            }));
            return ResponseHelper.success(res, userDetailList);
        }
        ResponseHelper.success(res);
    }

    static async getAllUserGroup(req: Request, res: Response) {
        const tempJoinQuery: JoinQuery[] = [{ table: 'tm_group', first: 'tm_group.idgroup', operator: '=', second: 'tm_user.idgroup', type: 'left' }];
        const resultQueryList: any[] = await genericRepository.select<Record<string, any>>('tm_user', tempJoinQuery);
        if (resultQueryList?.['length'] > 0) {
            const userGroupList: UserGroup[] = resultQueryList.map((record: any) => ({
                iduser: record.tm_user_iduser,
                status: record.tm_user_status === 1,
                username: record.tm_user_username,
                idgroup: record.tm_user_idgroup,
                fullname: record.tm_user_fullname,
                mobile: record.tm_user_mobile,
                email: record.tm_user_email,
                isAdmin: record.tm_user_isAdmin === 1,
                password: '',
                deleteable: record.tm_user_deleted === 1,
                group: record.tm_group_idgroup
                    ? {
                          idgroup: record.tm_group_idgroup,
                          groupname: record.tm_group_groupname,
                          description: record.tm_group_description,
                          menublob: null,
                          deleteable: record.tm_group_deleteable === 1,
                      }
                    : null,
            }));
            return ResponseHelper.success(res, userGroupList);
        }
        ResponseHelper.success(res);
    }

    static async addUser(req: Request, res: Response) {
        try {
            const requestBodyUser: UserGroup = req.body;
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
                idgroup: requestBodyUser.idgroup,
                fullname: requestBodyUser.fullname,
                mobile: requestBodyUser.mobile,
                email: requestBodyUser.email,
                created_by: userInfo?.iduser || uid,
                created_date: nowJSDate(),
                password: newPassword,
                deleted: requestBodyUser.isAdmin ? 0 : 1,
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

    static async editUser(req: Request, res: Response) {
        try {
            const requestBodyUser: UserGroup = req.body;
            const userInfo: UserSession = (req.session as any).user;
            const payloadInsert: Partial<User> = {
                username: requestBodyUser.username,
                idgroup: requestBodyUser.idgroup,
                fullname: requestBodyUser.fullname,
                mobile: requestBodyUser.mobile,
                email: requestBodyUser.email,
                updated_by: userInfo?.iduser,
                updated_date: nowJSDate(),
                deleted: requestBodyUser.isAdmin ? 0 : 1,
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

    static async deleteUser(req: Request, res: Response) {
        try {
            const requestBodyUser = req.body;
            if (Array.isArray(requestBodyUser)) {
                for (const requestBody of requestBodyUser) {
                    await genericRepository.delete<User>('tm_user', [{ column: 'username', operator: '=', value: requestBody.username }]);
                }
            } else {
                await genericRepository.delete<User>('tm_user', [{ column: 'username', operator: '=', value: requestBodyUser.username }]);
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }
}
