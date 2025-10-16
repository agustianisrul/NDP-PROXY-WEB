import { BaseEntity } from './BaseEntity';

export interface Role extends BaseEntity {
    idRole: string;
    rolename: string;
    roledescription: string;
    deleteable: number;
}
