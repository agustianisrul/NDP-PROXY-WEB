import { Request, Response } from 'express';
import { GenericRepository } from '../repositories/generic.repository';
import { AuditTrail } from '../../model/base-entity/audit.trail';
import { ResponseHelper } from '../utils/ResponseHelper';
import { JoinQuery } from '../../model/others/JoinQuery';
import { RequestDetail } from '../../model/custom-entity/RequestDetail';
import { Order } from '../../model/others/OrderQuery';
import { DateUtils } from '../config/date-utils';
import { Condition } from '../../model/others/ConditionQuery';

const genericRepository = new GenericRepository();

export class AuditController {
    public static async getAllRequest(req: Request, res: Response) {
        try {
            const payload = {
                startDate: DateUtils.formatToString(req.body.selectedDate[0], 'yyyy-MM-dd HH:mm:ss'),
                endDate: DateUtils.formatToString(req.body.selectedDate[1], 'yyyy-MM-dd HH:mm:ss'),
            };
            const tempJoinQuery: JoinQuery[] = [
                {
                    table: 'tm_user',
                    first: 'tm_user.iduser',
                    operator: '=',
                    second: 'tr_audit_trail.iduser',
                    type: 'left',
                },
            ]
            const tempConditions: Condition<any>[] = [
                {column: 'tr_audit_trail.created_date', operator: '>=', value: payload.startDate},
                {column: 'tr_audit_trail.created_date', operator: '<=', value: payload.endDate},
            ]
            const tempOrder: Order<any>[] = [{column: 'tr_audit_trail.created_date', direction: 'desc'}]
            const resultQueryList = await genericRepository.select<Record<string, any>>('tr_audit_trail', tempJoinQuery, tempConditions, tempOrder);
            const result: RequestDetail[] = resultQueryList.map((item: any) => ({
                idaudit: item.tr_audit_trail_idaudit,
                iduser: item.tr_audit_trail_iduser,
                username: item.tm_user_username,
                httpmethod: item.tr_audit_trail_httpmethod,
                responsestatus: item.tr_audit_trail_responsestatus,
                requesturl: item.tr_audit_trail_requesturl,
                sourceRequest: item.tr_audit_trail_sourceRequest,
                idMenu: item.tr_audit_trail_idMenu,
                nameMenu: item.tr_audit_trail_nameMenu,
                idRole: item.tr_audit_trail_idRole,
                rolename: item.tr_audit_trail_rolename,
                created_date: item.tr_audit_trail_created_date
            }));
            return ResponseHelper.success(res, result);
        } catch (error) {
            return ResponseHelper.error(res, error);
        }
    }
}