import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export async function authBearerMiddleware(req: Request, res: Response, next: NextFunction) {
    const clientHeader = req.headers['x-client'];
    if (clientHeader && clientHeader === 'angular-ssr' && req.session && (req.session as any).user) {
        return next();
    }
    return res.status(401).json(ApiResponse.serviceUnauthorised('Unauthorized'));
}
