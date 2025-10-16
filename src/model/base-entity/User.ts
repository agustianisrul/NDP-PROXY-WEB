import { BaseEntity } from './BaseEntity';

export interface User extends BaseEntity {
    iduser: string;
    password: string;
    is_twofa_enabled: number;
    twofa_secret: string;
    deleteable: number;
    last_login: Date;
    last_logout: Date;
    status: number;
    username: string;
    idgroup: string;
    fullname: string;
    mobile: string;
    email: string;
    isAdmin: number;
}
