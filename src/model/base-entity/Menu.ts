import { BaseEntity } from './BaseEntity';

export interface Menu extends BaseEntity {
    idMenu: number;
    nameMenu: string;
    pathMenu: string | null;
    idAppMenu: number;
    iconMenu: string;
    deleteable: number;
}
