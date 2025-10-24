import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { Scheduler } from '../../../model/surrounding/Scheduler';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

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
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', requestBody));
    }

    static async putScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const endpointTarget = `/ndp/proxy/scheduler/update/${requestBody.idScheduler}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'PUT', requestBody));
    }

    static async deleteScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBody: Partial<Scheduler> = req.body;
        const endpointTarget = `/ndp/proxy/scheduler/deletebyid/${requestBody.idScheduler}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'DELETE'));
    }

    static async startScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = `/ndp/proxy/scheduler/start`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }

    static async stopScheduler(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const endpointTarget = `/ndp/proxy/scheduler/stop`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }
}
