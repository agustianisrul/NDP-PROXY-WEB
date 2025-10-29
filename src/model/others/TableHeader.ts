import { OptionsParameter } from './OptionsParameter';

export interface TableHeader {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'right' | 'center'; // default is left
    labelUsingIcon?: boolean; // is value using icon special for icon in menu
    dateFormat?: string; // for date/boolean/string formatting
    // values?: Record<string | number, string>; // for enum conversion
    // options?: { id: string | number; label: string }[]; // array of objects for lookup
    displayAt?: 'table' | 'detail' | 'none';
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
        | 'tree-menu-picker';
}
