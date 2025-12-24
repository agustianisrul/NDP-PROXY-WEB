export interface RequestDetail {
    idaudit: number;
    iduser: string | null;
    username: string;
    httpmethod: string;
    responsestatus: number;
    requesturl: string;
    sourceRequest: string;
    idMenu: number;
    nameMenu: string;
    idRole: string;
    rolename: string;
    created_date: Date;
}