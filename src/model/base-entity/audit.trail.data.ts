export interface AuditTrailData {
    idaudit: number;
    requestbody: Record<string, any> | null;
    responsebody: Record<string, any> | null;
}
