import { RoleDetail } from '../custom-entity/RoleDetail';

export interface RouterDataItem {
    routerLink: string | null;
    roleList?: RoleDetail[];
    deleted: boolean;
    parentIdMenu: number | null;
    menuSequence: number;
    permission: RoleDetail[];
}

export interface RouterItem {
    key: string;
    label: string;
    icon: string | null;
    children: RouterItem[];
    data: RouterDataItem;
}
