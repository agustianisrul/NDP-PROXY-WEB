import { BaseEntity } from './BaseEntity';

export interface Group extends BaseEntity {
    idgroup: string;
    groupname: string;
    description: string;
    deleted: boolean;
    status: boolean;
}
