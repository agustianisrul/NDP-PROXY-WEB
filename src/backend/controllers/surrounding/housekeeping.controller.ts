import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

export class HouseKeepingController {
    static async getAllHouseKeeping(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = '/ndp/proxy/maintenance/getall';
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async postHouseKeeping(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: any = req.body;
        const endpointTarget = `/ndp/proxy/maintenance/create`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', requestBody));
    }

    static async putHouseKeeping(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: any = req.body;
        const endpointTarget = `/ndp/proxy/maintenance/update/${requestBody.idHouseKeeping}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT', requestBody));
    }

    static async deleteHouseKeeping(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const requestBody = req.body;
            if (Array.isArray(requestBody)) {
                for (const detail of requestBody) {
                    const endpointTarget = `/ndp/proxy/maintenance/deletebyid/${detail.idHouseKeeping}`;
                    await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
                }
            } else {
                const endpointTarget = `/ndp/proxy/maintenance/deletebyid/${requestBody.idHouseKeeping}`;
                await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }
}
