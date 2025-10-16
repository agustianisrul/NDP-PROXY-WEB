import { NextFunction, Request, Response } from 'express';
import { AuditTrail } from '../../model/base-entity/audit.trail';
import { AuditTrailData } from '../../model/base-entity/audit.trail.data';
import { UserSession } from '../../model/custom-entity/UserSession';
import db from '../config/client';
import { nowJSDate } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';

const genericRepository = new GenericRepository();

export default async function auditMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.originalUrl.includes('/v2')) {
        return next();
    }

    const userInfo: UserSession = (req.session as any).user;
    let responseBody: any;
    const oldSend = res.send;
    (res as any).send = function (body: any) {
        responseBody = body;
        return oldSend.apply(res, arguments as any);
    };
    res.on('finish', () => {
        const auditTrail: Partial<AuditTrail> = {
            iduser: userInfo?.iduser || null,
            httpmethod: req.method,
            responsestatus: res.statusCode,
            requesturl: req.originalUrl,
            created_by: userInfo ? userInfo.iduser : null,
            created_date: nowJSDate(),
        };
        const auditTrailData: Partial<AuditTrailData> = {
            requestbody: req.body,
            responsebody: responseBody,
        };
        createAuditTrail(auditTrail, auditTrailData);
    });

    next();
}

const createAuditTrail = async (auditTrail: Partial<AuditTrail>, auditTrailData: Partial<AuditTrailData>) => {
    try {
        return await db.transaction(async (trx) => {
            // Insert into Audit Trail
            const [resultAuditTrail] = await genericRepository.insert('tr_audit_trail', auditTrail, trx);
            const tempIdAudit = resultAuditTrail.idaudit;

            // Insert into Audit trail Data
            const tempAuditTrailData = {
                ...auditTrailData,
                idaudit: tempIdAudit,
            };
            await genericRepository.insert('tr_audit_trail_data', tempAuditTrailData, trx);
        });
    } catch (error) {
        console.error('error audit', error);
        throw error;
    }
};
