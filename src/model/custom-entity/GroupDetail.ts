import { RouterItem } from '../others/RouterItem';

export interface GroupDetail {
    idgroup: string;
    groupname: string;
    description: string;
    menublob: RouterItem[] | null;
    deleteable: boolean;
}
