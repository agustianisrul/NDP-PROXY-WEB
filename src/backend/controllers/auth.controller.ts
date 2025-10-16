import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { User } from '../../model/base-entity/User';
import { UserSession } from '../../model/custom-entity/UserSession';
import { Condition } from '../../model/others/ConditionQuery';
import { config } from '../config/environment';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';
import { ApiResponse } from '../utils/apiResponse';

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
                await ResponseHelper.send(res, ApiResponse.notFound('Invalid username or password'));
                return;
            }
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                await ResponseHelper.send(res, ApiResponse.notFound('Invalid username or password'));
                return;
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

            await ResponseHelper.send(res, ApiResponse.success(userSession));
        } catch (error) {
            console.error('Error auth.controller : ', error);
            await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
        }
    }

    public static async logout(req: Request, res: Response) {
        req.session = null;
        res.clearCookie(config.cookie.name);
        await ResponseHelper.send(res, ApiResponse.success({}));
    }

    public static async reloadUserSession(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            await ResponseHelper.send(res, ApiResponse.success(userInfo));
        } catch (error) {
            console.error('Error reloadUserSession : ', error);
            await ResponseHelper.send(res, ApiResponse.serverError(error + ''));
        }
    }
}
