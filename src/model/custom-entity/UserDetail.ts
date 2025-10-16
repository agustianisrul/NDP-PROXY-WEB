import { GroupDetail } from './GroupDetail';

export interface UserDetail {
    iduser: string;
    deleteable: boolean;
    status: boolean;
    username: string;
    group: GroupDetail;
    fullname: string;
    mobile: string;
    email: string;
    isAdmin: boolean;
    password: string;
}
