import { OptionsParameter } from './OptionsParameter';
import { PermissionMode } from './TableButton';

export interface TableHeader {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'right' | 'center'; // default is left
    labelUsingIcon?: boolean; // is value using icon special for icon in menu
    dateFormat?: string; // for date/boolean/string formatting
    displayAt?: 'table' | 'none' | PermissionMode[]; // where to display the column
    optionsParameter?: OptionsParameter;
    validators?: {
        required?: boolean;
        email?: boolean;
        passwordPolicy?: boolean;
    };
    componentType?:
        | 'p-checkbox'
        | 'p-datepicker'
        | 'p-inputnumber'
        | 'input'
        | 'p-multiselect'
        | 'p-password'
        | 'p-radiobutton'
        | 'p-select'
        | 'textarea'
        | 'p-togglebutton'
        | 'p-toggleswitch'
        | 'tree-menu-picker'
        | 'p-label';
}
