import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { Scheduler } from '../../../model/surrounding/Scheduler';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

export class ServerConfigController {
    static async getAllConfig(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = '/ndp/proxy/config/getall';
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async editConfig(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const endpointTarget = `/ndp/proxy/config/updatebykeygroup?keyGroup=${requestBody.idScheduler}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT', requestBody));
    }
}
