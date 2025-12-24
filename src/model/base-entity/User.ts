import { BaseEntity } from './BaseEntity';

export interface User extends BaseEntity {
    iduser: string;
    password: string;
    is_twofa_enabled: boolean;
    twofa_secret: string;
    deleted: boolean;
    last_login: Date;
    last_logout: Date;
    status: boolean;
    username: string;
    idgroup: string;
    fullname: string;
    mobile: string;
    email: string;
    isAdmin: boolean;
    envi_user: string;
    retry_failed_login: number;
    last_failed_login: Date;
    account_status: string;
    last_password_modified: Date;
}
