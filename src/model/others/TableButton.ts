export type PermissionMode = 'create' | 'edit' | 'view' | 'delete' | 'start' | 'stop' | 'export';
export type SeverityMode = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';

export interface TableButton {
    label: string;
    icon?: string;
    severity?: SeverityMode;
    type: PermissionMode;
}
