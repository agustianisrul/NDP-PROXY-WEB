export interface GroupMenuRole {
    idgroup: string;
    idMenu: number;
    idRole?: string;
    parentIdMenu?: number | null;
    menuSequence: number;
}
