import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Role } from '../../model/base-entity/Role';
import { User } from '../../model/base-entity/User';
import { UserSession } from '../../model/custom-entity/UserSession';
import { Condition } from '../../model/others/ConditionQuery';
import { JoinQuery } from '../../model/others/JoinQuery';
import { config } from '../config/environment';
import { GenericRepository } from '../repositories/generic.repository';
import { ResponseHelper } from '../utils/ResponseHelper';
import { GroupController } from './group.controller';
import { DateUtils } from '../config/date-utils';
import { AuditTrail } from '../../model/base-entity/audit.trail';

const genericRepository = new GenericRepository();

export class AuthController {
    public static async login(req: Request, res: Response) {
        const { credential } = req.body;
        try {
            const decoded = Buffer.from(credential, 'base64').toString('utf-8');
            const [username, password] = decoded.split(':');

            const formattingDate = 'yyyy-MM-dd HH:mm:ss';
            const currentDate = DateUtils.nowFormat(formattingDate);
            const whereCondition: Condition<User>[] = [{ column: 'username', operator: '=', value: username }];
            const user: User | null = await genericRepository.findOne<User>('tm_user', whereCondition);
            if (!user) {
                // return ResponseHelper.error(res, 'Invalid username or password');
                return ResponseHelper.error(res, 'user not exist');
            }
            const regulator = await AuthController.getLoginConfig();
            const isStillOnline = await AuthController.isCheckUserAccountStatus(user, currentDate, regulator);
            if (user.account_status === 'ONLINE' && !isStillOnline) {
                await AuthController.updateUserAccount(user.iduser, { last_failed_login: currentDate, retry_failed_login: user.retry_failed_login + 1 });
                return ResponseHelper.error(res, 'user already login');
            }
            const tempRetryFailedLogin = Number(regulator?.['retry_failed_login']);
            if (user.account_status !== 'LOCKED' && user.retry_failed_login + 1 >= tempRetryFailedLogin) {
                await AuthController.updateUserAccount(user.iduser, { last_failed_login: currentDate, retry_failed_login: user.retry_failed_login + 1, account_status: 'LOCKED' });
                return ResponseHelper.error(res, `retry failed login already exceed and account has been locked`);
            }
            const tempWaitingTime = Number(regulator?.['waiting_time']);
            const isValidLastFailedLogin = DateUtils.compareDate(user.last_failed_login, currentDate, '<', 'operator1', 'minutes', 'plus', tempWaitingTime);
            if (user.account_status === 'LOCKED' && !isValidLastFailedLogin) {
                return ResponseHelper.error(res, `wait for ${tempWaitingTime} minutes`);
            }
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                await AuthController.updateUserAccount(user.iduser, { last_failed_login: currentDate, retry_failed_login: user.retry_failed_login + 1 });
                return ResponseHelper.error(res, 'Invalid username or password');
            }

            const userSession: UserSession = {
                iduser: user.iduser,
                username: user.username,
                idgroup: user.idgroup,
                fullname: user.fullname,
                mobile: user.mobile,
                email: user.email,
                isAdmin: user.isAdmin,
                envi_user: user.envi_user,
                accessedDate: currentDate
            };
            (req.session as any).user = userSession;

            const tempLastSuccessLogin = user.last_login ? DateUtils.formatToString(user.last_login, formattingDate) : null ;
            const tempLastFailedLogin = user.last_failed_login ? DateUtils.formatToString(user.last_failed_login, formattingDate) : null;

            await AuthController.updateUserAccount(user.iduser, { retry_failed_login: 0, account_status: 'ONLINE', last_login: currentDate });

            const tempJoinQuery: JoinQuery[] = [
                { table: 'tm_group_menu_role', first: 'tm_group_menu_role.idgroup', operator: '=', second: 'tm_group.idgroup', type: 'left' },
                { table: 'tm_menus', first: 'tm_menus.idMenu', operator: '=', second: 'tm_group_menu_role.idMenu', type: 'left' },
                { table: 'tm_role', first: 'tm_role.idRole', operator: '=', second: 'tm_group_menu_role.idRole', type: 'left' },
            ];
            const tempConditions: Condition<any>[] = userSession.idgroup
                ? [{ column: 'tm_group.idgroup', operator: '=', value: userSession.idgroup }]
                : [];
            const resultQueryList = await genericRepository.select<Record<string, any>>('tm_group', tempJoinQuery, tempConditions);

            const tempGroupMenuRoleList = userSession.idgroup ? GroupController.getGroupMenuRoleList(resultQueryList) : [];
            const resultGroupMenuRole = tempGroupMenuRoleList.length > 0 ? tempGroupMenuRoleList[0] : null;
            const tempPasswordExpiryDays = Number(regulator?.['password_expiry_days']);
            const isPasswordExpired = DateUtils.compareDate(user.last_password_modified, currentDate, '<=', 'operator1', 'days', 'plus', tempPasswordExpiryDays);

            const responseBody = {
                userInfo: userSession,
                group: resultGroupMenuRole,
                roleList: await genericRepository.select<Role>('tm_role'),
                lastSuccessLogin: tempLastSuccessLogin,
                lastFailedLogin: tempLastFailedLogin,
                idleTimeoutSecond: Number(regulator?.["idle_timeout"]),
                dashboardAutoRefresh: Number(regulator?.["dashboard_auto_refresh"]),
                isPasswordExpired: isPasswordExpired
            };

            ResponseHelper.success(res, responseBody);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    public static async logout(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const currentDate = DateUtils.nowFormat("yyyy-MM-dd HH:mm:ss");
        await AuthController.updateUserAccount(userInfo.iduser, { last_logout: currentDate, account_status: null });
        req.session = null;
        res.clearCookie(config.cookie.name);
        ResponseHelper.success(res);
    }

    public static async reloadUserSession(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const { menuTitle } = req.body;

            const whereCondition: Condition<User>[] = [{ column: 'username', operator: '=', value: userInfo.username }];
            const user: User | null = await genericRepository.findOne<User>('tm_user', whereCondition);

            if (!user) {
                // return ResponseHelper.error(res, 'Invalid username or password');
                return ResponseHelper.error(res, 'user not exist');
            }

            const formattingDate = 'yyyy-MM-dd HH:mm:ss';
            const tempLastSuccessLogin = user.last_login ? DateUtils.formatToString(user.last_login, formattingDate) : null ;
            const tempLastFailedLogin = user.last_failed_login ? DateUtils.formatToString(user.last_failed_login, formattingDate) : null;

            const regulator = await AuthController.getLoginConfig();

            const tempJoinQuery: JoinQuery[] = [
                { table: 'tm_group_menu_role', first: 'tm_group_menu_role.idgroup', operator: '=', second: 'tm_group.idgroup', type: 'left' },
                { table: 'tm_menus', first: 'tm_menus.idMenu', operator: '=', second: 'tm_group_menu_role.idMenu', type: 'left' },
                { table: 'tm_role', first: 'tm_role.idRole', operator: '=', second: 'tm_group_menu_role.idRole', type: 'left' },
            ];
            const tempConditions: Condition<any>[] = userInfo.idgroup ? [{ column: 'tm_group.idgroup', operator: '=', value: userInfo.idgroup }] : [];
            const resultQueryList = await genericRepository.select<Record<string, any>>('tm_group', tempJoinQuery, tempConditions);

            const tempGroupMenuRoleList = userInfo.idgroup ? GroupController.getGroupMenuRoleList(resultQueryList) : [];
            const resultGroupMenuRole = tempGroupMenuRoleList.length > 0 ? tempGroupMenuRoleList[0] : null;

            const currentDate = DateUtils.nowFormat(formattingDate);
            const tempPasswordExpiryDays = Number(regulator?.['password_expiry_days']);
            const isPasswordExpired = DateUtils.compareDate(user.last_password_modified, currentDate, '<=', 'operator1', 'days', 'plus', tempPasswordExpiryDays);

            const responseBody = {
                menuTitle: menuTitle,
                userInfo: userInfo,
                group: resultGroupMenuRole,
                roleList: await genericRepository.select<Role>('tm_role'),
                lastSuccessLogin: tempLastSuccessLogin,
                lastFailedLogin: tempLastFailedLogin,
                idleTimeoutSecond: Number(regulator?.["idle_timeout"]),
                dashboardAutoRefresh: Number(regulator?.["dashboard_auto_refresh"]),
                isPasswordExpired: isPasswordExpired,
            };

            ResponseHelper.success(res, responseBody);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    private static async getLoginConfig(): Promise<Record<string, any> | null> {
        const whereCondition: Condition<any>[] = [
            { column: 'keygroup', operator: '=', value: 'common-config' }
        ];
        const resultQueryList = await genericRepository.select<Record<string, any>>('tm_config_main', [], whereCondition);
        if (resultQueryList.length === 0) return null;

        return resultQueryList.filter((item: any) => !item.keyname.includes('password') || item.keyname === 'password_expiry_days')
            .reduce((acc, row) => {
                acc[row["keyname"]] = row["value"];
                return acc;
            }, {} as Record<string, any>);
    }

    private static async updateUserAccount(idUser: string, updateObject: any): Promise<void> {
        const whereCondition: Condition<User>[] = [{ column: 'iduser', operator: '=', value: idUser }];
        await genericRepository.update<User>('tm_user', updateObject, whereCondition);
    }

    private static async isCheckUserAccountStatus(user: User, currentDate: string, regulator: any): Promise<boolean> {
        if (!user.last_login) return true;
        if (user.last_logout && DateUtils.compareDate(user.last_login, user.last_logout, '<=')) return true;
        const tempAuditTrail = await AuthController.getAuditTrailUser(user);
        if (!tempAuditTrail) return true;
        const tempIdleTimeout = Number(regulator?.['idle_timeout']);
        return DateUtils.compareDate(tempAuditTrail.created_date, currentDate, '<=', 'operator1', 'seconds', 'plus', tempIdleTimeout);
    }

    private static async getAuditTrailUser(user: User): Promise<AuditTrail | null> {
        if (!user) return null;
        const whereCondition: Condition<AuditTrail>[] = [
            { column: 'iduser', operator: '=', value: user.iduser },
            { column: 'requesturl', operator: '<>', value: '/v2/auth/login' },
            { column: 'requesturl', operator: '<>', value: '/v2/auth/reload-user' },
        ];
        const auditTrailList: AuditTrail[] | null = await genericRepository.select<AuditTrail>('tr_audit_trail', [], whereCondition, 
            [{ column: 'created_date', direction: 'desc' }]);
        return auditTrailList.length > 0 ? auditTrailList[0] : null;
    }
}
