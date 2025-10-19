import { NextFunction, Request, Response } from 'express';
import { ResponseCode } from '../utils/responseCode';
import { ResponseHelper } from '../utils/ResponseHelper';

export async function authBearerMiddleware(req: Request, res: Response, next: NextFunction) {
    const clientHeader = req.headers['x-client'];
    if (clientHeader && clientHeader === 'angular-ssr' && req.session && (req.session as any).user) {
        return next();
    }
    return ResponseHelper.custom(res, ResponseCode.UNAUTHORIZED, 'Unauthorized');
}
