export interface AuditTrailData {
    idaudit: number;
    requestbody: Record<string, any>;
    responsebody: Record<string, any>;
}
