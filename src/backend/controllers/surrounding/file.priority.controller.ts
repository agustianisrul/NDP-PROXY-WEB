import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

export class FilePriorityController {
    static async getAllFilePriority(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = '/ndp/proxy/sequence-file-priority';
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async getFilePriorityById(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestParam = req.params['id'];
        const endpointTarget = `/ndp/proxy/sequence-priority/getbyid/${requestParam}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async postFilePriority(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: any = {
            ...req.body,
            createdBy: userInfo.username,
            updatedBy: userInfo.username,
        };
        const endpointTarget = `/ndp/proxy/sequence-priority/create`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', requestBody));
    }

    static async putFilePriority(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: any = {
            ...req.body,
            createdBy: userInfo.username,
            updatedBy: userInfo.username,
        };
        const endpointTarget = `/ndp/proxy/sequence-priority/update/${requestBody.idFilePriority}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT', requestBody));
    }

    static async deleteFilePriority(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const requestBody = req.body;
            if (Array.isArray(requestBody)) {
                for (const detail of requestBody) {
                    const endpointTarget = `/ndp/proxy/sequence-priority/deletebyid/${detail.idFilePriority}`;
                    await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
                }
            } else {
                const endpointTarget = `/ndp/proxy/sequence-priority/deletebyid/${requestBody.idFilePriority}`;
                await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }
}
