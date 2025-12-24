import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { Scheduler } from '../../../model/surrounding/Scheduler';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';
import { DateUtils } from '../../config/date-utils';

export class SchedulerController {
    static async getAllScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = '/ndp/proxy/scheduler/getall';
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async getSchedulerById(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestParam = req.params['id'];
        const endpointTarget = `/ndp/proxy/scheduler/getbyid/${requestParam}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async postScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const endpointTarget = `/ndp/proxy/scheduler/create`;
        delete requestBody.idScheduler;
        const payloadBody = {
            ...requestBody,
            updatedBy: userInfo.username,
            createdDate: DateUtils.nowFormat("yyyy-MM-dd'T'HH:mm:ss.SSS"),
            createdBy: userInfo.username,
        }
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', payloadBody));
    }

    static async putScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const tempIdScheduler = requestBody.idScheduler;
        delete requestBody.idScheduler;
        const payloadBody = {
            ...requestBody,
            updatedBy: userInfo.username,
            createdDate: DateUtils.nowFormat("yyyy-MM-dd'T'HH:mm:ss.SSS"),
            createdBy: userInfo.username,
        }
        const endpointTarget = `/ndp/proxy/scheduler/update/${tempIdScheduler}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT', payloadBody));
    }

    static async deleteScheduler(req: Request, res: Response) {
        try {
            const userInfo: UserSession = (req.session as any).user;
            const requestBody = req.body;
            if (Array.isArray(requestBody)) {
                for (const detail of requestBody) {
                    const endpointTarget = `/ndp/proxy/scheduler/deletebyid/${detail.idScheduler}`;
                    await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
                }
            } else {
                const endpointTarget = `/ndp/proxy/scheduler/deletebyid/${requestBody.idScheduler}`;
                await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE')
            }
            ResponseHelper.success(res);
        } catch (error) {
            ResponseHelper.error(res, error);
        }
    }

    static async startScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const endpointTarget = `/ndp/proxy/scheduler/start/${requestBody.idScheduler}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT'));
    }

    static async stopScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const endpointTarget = `/ndp/proxy/scheduler/stop/${requestBody.idScheduler}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT'));
    }
}
