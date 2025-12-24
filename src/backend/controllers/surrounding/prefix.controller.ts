import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { Prefix } from '../../../model/surrounding/Prefix';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

export class PrefixController {
    static async getAllPrefix(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = '/ndp/proxy/prefix-name';
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async getPrefixById(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestParam = req.params['id'];
        const endpointTarget = `/ndp/proxy/prefix-name/${requestParam}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async postPrefix(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Prefix> = {
            ...req.body,
            createdBy: userInfo.username,
            updatedBy: userInfo.username,
        };
        const endpointTarget = `/ndp/proxy/prefix-name`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', requestBody));
    }

    static async putPrefix(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Prefix> = {
            ...req.body,
            createdBy: userInfo.username,
            updatedBy: userInfo.username,
        };
        const endpointTarget = `/ndp/proxy/prefix-name/${requestBody.idPrefixName}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT', requestBody));
    }

    static async deletePrefix(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const requestBody = req.body;
            if (Array.isArray(requestBody)) {
                for (const detail of requestBody) {
                    const endpointTarget = `/ndp/proxy/prefix-name/${detail.idPrefixName}`;
                    await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
                }
            } else {
                const endpointTarget = `/ndp/proxy/prefix-name/${requestBody.idPrefixName}`;
                await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }
}
