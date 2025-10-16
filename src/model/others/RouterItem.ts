export interface RouterItem {
    label: string;
    routerLink?: string;
    icon?: string;
    items?: RouterItem[] | null;
}
