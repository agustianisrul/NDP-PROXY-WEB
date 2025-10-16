import { BaseEntity } from './BaseEntity';

export interface Menu extends BaseEntity {
    idMenu: number;
    nameMenu: string;
    pathMenu: string;
    idAppMenu: number;
    iconMenu: string;
    deleteable: number;
}
