import { BaseEntity } from './BaseEntity';

export interface Menu extends BaseEntity {
    idMenu: number;
    nameMenu: string;
    pathMenu: string | null;
    iconMenu: string;
    deleted: boolean;
}
