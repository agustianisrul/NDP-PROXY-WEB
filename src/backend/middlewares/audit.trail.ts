import { NextFunction, Request, Response } from 'express';
import { AuditTrail } from '../../model/base-entity/audit.trail';
import { AuditTrailData } from '../../model/base-entity/audit.trail.data';
import { UserSession } from '../../model/custom-entity/UserSession';
import db from '../config/client';
import { DateUtils } from '../config/date-utils';
import { GenericRepository } from '../repositories/generic.repository';
import { Condition } from '../../model/others/ConditionQuery';
import { User } from '../../model/base-entity/User';

const genericRepository = new GenericRepository();

export default async function auditMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.originalUrl.includes('/v2')) {
        return next();
    }

    const tempRequestBody = safeClone(req.body);

    const userInfo: UserSession = (req.session as any).user;

    // let responseBody: any;
    // const oldSend = res.send;
    // (res as any).send = function (body: any) {
    //     responseBody = body;
    //     return oldSend.apply(res, arguments as any);
    // };
    res.on('finish', async () => {
        const auditTrail: Partial<AuditTrail> = {
            iduser: userInfo?.iduser || null,
            httpmethod: req.method,
            responsestatus: res.statusCode,
            requesturl: req.originalUrl,
            created_by: userInfo ? userInfo.iduser : null,
            created_date: DateUtils.nowJSDate(),
            sourceRequest: 'PORTAL',
        };

        const auditTrailData: Partial<AuditTrailData> = {
            requestbody: tempRequestBody ?? null,
            // responsebody: responseBody,
        };
        await createAuditTrail(auditTrail, auditTrailData);
    });
        
    next();
}

const createAuditTrail = async (auditTrail: Partial<AuditTrail>, auditTrailData: Partial<AuditTrailData>): Promise<void> => {
    try {
        if (auditTrail.requesturl === '/v2/auth/login' && auditTrailData.requestbody) {
            const { credential } = auditTrailData.requestbody;
            const decoded = Buffer.from(credential, 'base64').toString('utf-8');
            const [username, password] = decoded.split(':');
            const whereCondition: Condition<User>[] = [{ column: 'username', operator: '=', value: username }];
            const user: User | null = await genericRepository.findOne<User>('tm_user', whereCondition, []);
            if (user && user.iduser) {
                auditTrail.iduser = user.iduser;
            }
        }
                    
        // Insert into Audit Trail
        const [resultAuditTrail] = await genericRepository.insert('tr_audit_trail', auditTrail);
        const tempIdAudit = resultAuditTrail.idaudit;
        // Insert into Audit trail Data
        const tempAuditTrailData = {
            ...auditTrailData,
            idaudit: tempIdAudit,
        };
        await genericRepository.insert('tr_audit_trail_data', tempAuditTrailData);

        // return await db.transaction(async (trx) => {
        //     if (auditTrail.requesturl === '/v2/auth/login' && auditTrailData.requestbody) {
        //         const { credential } = auditTrailData.requestbody;
        //         const decoded = Buffer.from(credential, 'base64').toString('utf-8');
        //         const [username, password] = decoded.split(':');
        //         const whereCondition: Condition<User>[] = [{ column: 'username', operator: '=', value: username }];
        //         const user: User | null = await genericRepository.findOne<User>('tm_user', whereCondition, [], trx);
        //         if (user && user.iduser) {
        //             auditTrail.iduser = user.iduser;
        //         }
        //     }
                        
        //     // Insert into Audit Trail
        //     const [resultAuditTrail] = await genericRepository.insert('tr_audit_trail', auditTrail, trx);
        //     const tempIdAudit = resultAuditTrail.idaudit;

        //     // Insert into Audit trail Data
        //     const tempAuditTrailData = {
        //         ...auditTrailData,
        //         idaudit: tempIdAudit,
        //     };
        //     await genericRepository.insert('tr_audit_trail_data', tempAuditTrailData, trx);
        // });
    } catch (error) {
        throw error;
    }
}

function safeClone(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        return null;
    }
}