import { BaseEntity } from './BaseEntity';

export interface AuditTrail extends BaseEntity {
    idaudit: number;
    iduser: string | null;
    httpmethod: string;
    responsestatus: number;
    requesturl: string;
    sourceRequest: string;
    idMenu: number;
    nameMenu: string;
    idRole: string;
    rolename: string;
}
