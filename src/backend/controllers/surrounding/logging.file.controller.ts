import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { FileActivity } from '../../../model/surrounding/ReportLogging';
import { DateUtils } from '../../config/date-utils';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

export class ReportLoggingFileController {
    static async getAllData(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = '/ndp/proxy/report/v2/getAll';
        const payload = {
            startDate: DateUtils.formatToString(req.body.selectedDate[0], 'yyyy-MM-dd'),
            endDate: DateUtils.formatToString(req.body.selectedDate[1], 'yyyy-MM-dd'),
        };
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', payload));
    }

    static async resendData(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBodyData: FileActivity = req.body;
        const endpointTarget = `/ndp/proxy/reupload/${requestBodyData.idfileactivity}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST'));
    }
}
