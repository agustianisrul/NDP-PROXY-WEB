import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../model/base-entity/User';
import { UserDetail } from '../../model/custom-entity/UserDetail';
import { UserGroup } from '../../model/custom-entity/UserGroup';
import { UserSession } from '../../model/custom-entity/UserSession';
import { JoinQuery } from '../../model/others/JoinQuery';
import { DateUtils } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';
import { PasswordRegulationService } from './password.regulator';

const genericRepository = new GenericRepository();
const passwordRegulationService = new PasswordRegulationService();

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        const userList: User[] = await genericRepository.select<User>('tm_user');
        if (userList.length > 0) {
            const userDetailList: UserDetail[] = userList.map((user: User) => ({
                iduser: user.iduser,
                deleted: user.deleted,
                status: user.status,
                username: user.username,
                idgroup: user.idgroup,
                fullname: user.fullname,
                mobile: user.mobile,
                email: user.email,
                isAdmin: user.isAdmin,
                password: '',
                envi_user: user.envi_user,
                account_status: user.account_status
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
                status: record.tm_user_status,
                username: record.tm_user_username,
                idgroup: record.tm_user_idgroup,
                fullname: record.tm_user_fullname,
                mobile: record.tm_user_mobile,
                email: record.tm_user_email,
                isAdmin: record.tm_user_isAdmin,
                password: '',
                newPassword: '',
                deleted: record.tm_user_deleted,
                envi_user: record.tm_user_envi_user,
                account_status: record.tm_user_account_status,
                group: record.tm_group_idgroup
                    ? {
                        idgroup: record.tm_group_idgroup,
                        groupname: record.tm_group_groupname,
                        description: record.tm_group_description,
                        menublob: [],
                        deleted: record.tm_group_deleted,
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
            // get user admin status
            const adminUser: User | null = await genericRepository.findOne<User>('tm_user', [
                { column: 'isAdmin', operator: '=', value: true },
            ]);

            const validation = await passwordRegulationService.validatePassword(requestBodyUser.password);
            if (!validation.isValid) {
                return ResponseHelper.error(res, `Password validation failed: ${validation.errors.join(', ')}`);
            }

            const tempPassword = await bcrypt.hash(requestBodyUser.password, 12);
            const uid = uuidv4();
            const currentDate = DateUtils.nowJSDate();
            const payloadInsert: Partial<User> = {
                iduser: uid,
                username: requestBodyUser.username,
                idgroup: requestBodyUser.idgroup,
                fullname: requestBodyUser.fullname,
                mobile: requestBodyUser.mobile,
                email: requestBodyUser.email,
                created_by: userInfo?.iduser || uid,
                created_date: currentDate,
                password: tempPassword,
                deleted: requestBodyUser.isAdmin,
                status: requestBodyUser.status,
                isAdmin: adminUser ? false : true,
                envi_user: requestBodyUser.envi_user,
                last_password_modified: currentDate,
                account_status: requestBodyUser.account_status
            };
            
            await genericRepository.insert<User>('tm_user', payloadInsert);

            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async editUser(req: Request, res: Response) {
        try {
            const requestBodyUser: UserGroup = req.body;
            const userInfo: UserSession = (req.session as any).user;

            if (requestBodyUser.newPassword) {
                const existingUser: User | null = await genericRepository.findOne<User>('tm_user', [
                    { column: 'username', operator: '=', value: requestBodyUser.username },
                ]);

                if (existingUser) {
                    const isMatch = await bcrypt.compare(requestBodyUser.newPassword, existingUser?.password);
                    if (!isMatch) {
                        return ResponseHelper.error(res, 'Current Password does not match');
                    }
                }

                const validation = await passwordRegulationService.validatePassword(requestBodyUser.newPassword);
                if (!validation.isValid) {
                    return ResponseHelper.error(res, `Password validation failed: ${validation.errors.join(', ')}`);
                }
            }

            const payloadInsert: Partial<User> = {
                username: requestBodyUser.username,
                idgroup: requestBodyUser.idgroup,
                fullname: requestBodyUser.fullname,
                mobile: requestBodyUser.mobile,
                email: requestBodyUser.email,
                updated_by: userInfo?.iduser,
                updated_date: DateUtils.nowJSDate(),
                deleted: requestBodyUser.isAdmin,
                status: requestBodyUser.status,
                isAdmin: requestBodyUser.isAdmin,
                envi_user: requestBodyUser.envi_user,
                account_status: requestBodyUser.account_status
            };
            await genericRepository.update<User>('tm_user', payloadInsert, [
                { column: 'username', operator: '=', value: requestBodyUser.username },
            ]);
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async editProfileUser(req: Request, res: Response) {
        try {
            const requestBodyUser: UserGroup = req.body;
            const userInfo: UserSession = (req.session as any).user;

            const existingUser: User | null = await genericRepository.findOne<User>('tm_user', [
                { column: 'username', operator: '=', value: userInfo.username },
            ]);

            if (!existingUser) {
                return ResponseHelper.error(res, 'User does not exist');
            }

            const currentDate = DateUtils.nowJSDate();
            const payloadInsert: Partial<User> = {
                fullname: requestBodyUser.fullname,
                mobile: requestBodyUser.mobile,
                email: requestBodyUser.email,
                updated_by: userInfo?.iduser,
                updated_date: currentDate
            };

            if (requestBodyUser.newPassword) {
                if (requestBodyUser.password && requestBodyUser.password !== requestBodyUser.newPassword) {
                    return ResponseHelper.error(res, 'Current Password does not match');
                }
                const validation = await passwordRegulationService.validatePassword(requestBodyUser.newPassword);
                if (!validation.isValid) {
                    return ResponseHelper.error(res, `Password validation failed: ${validation.errors.join(', ')}`);
                }
                const tempPassword = await bcrypt.hash(requestBodyUser.newPassword, 12);
                payloadInsert.password = tempPassword;
                payloadInsert.last_password_modified = currentDate;
            }

            await genericRepository.update<User>('tm_user', payloadInsert, [
                { column: 'username', operator: '=', value: userInfo.username },
            ]);
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
