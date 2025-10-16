export interface TableButton {
    label: string;
    icon?: string;
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';
    action: (row?: any) => void;
    alwaysEnabled?: boolean;
}
