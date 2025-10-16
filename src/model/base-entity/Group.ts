import { RouterItem } from '../others/RouterItem';
import { BaseEntity } from './BaseEntity';

export interface Group extends BaseEntity {
    idgroup: string;
    groupname: string;
    description: string;
    menublob: RouterItem[] | null;
    deleteable: number;
}
