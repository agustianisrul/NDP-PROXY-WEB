import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Group } from '../../model/base-entity/Group';
import { Role } from '../../model/base-entity/Role';
import { User } from '../../model/base-entity/User';
import { UserSession } from '../../model/custom-entity/UserSession';
import { Condition } from '../../model/others/ConditionQuery';
import { config } from '../config/environment';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';

const genericRepository = new GenericRepository();

export class AuthController {
    public static async login(req: Request, res: Response) {
        const { credential } = req.body;
        try {
            const decoded = Buffer.from(credential, 'base64').toString('utf-8');
            const [username, password] = decoded.split(':');

            const whereCondition: Condition<User>[] = [{ column: 'username', operator: '=', value: username }];
            const user = await genericRepository.findOne<User>('tm_user', whereCondition);
            if (!user) {
                return ResponseHelper.error(res, 'Invalid username or password');
            }
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return ResponseHelper.error(res, 'Invalid username or password');
            }
            const userSession: UserSession = {
                iduser: user.iduser,
                username: user.username,
                idgroup: user.idgroup,
                fullname: user.fullname,
                mobile: user.mobile,
                email: user.email,
                isAdmin: user.isAdmin === 1,
            };
            (req.session as any).user = userSession;

            const responseBody = {
                userInfo: userSession,
                group: userSession.idgroup
                    ? await genericRepository.findOne<Group>('tm_group', [{ column: 'idgroup', operator: '=', value: userSession.idgroup }])
                    : null,
                roleList: await genericRepository.select<Role>('tm_role'),
            };

            ResponseHelper.success(res, responseBody);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    public static async logout(req: Request, res: Response) {
        req.session = null;
        res.clearCookie(config.cookie.name);
        ResponseHelper.success(res);
    }

    public static async reloadUserSession(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const responseBody = {
                userInfo: userInfo,
                group: userInfo.idgroup
                    ? await genericRepository.findOne<Group>('tm_group', [{ column: 'idgroup', operator: '=', value: userInfo.idgroup }])
                    : null,
                roleList: await genericRepository.select<Role>('tm_role'),
            };
            ResponseHelper.success(res, responseBody);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }
}
