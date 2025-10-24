import { InputParameter } from './InputParameter';

export interface TableHeader {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'right' | 'center'; // default is left
    type?: 'number' | 'boolean' | 'date' | 'string' | 'icon'; // default is string
    format?: string; // for date/boolean/string formatting
    values?: Record<string | number, string>; // for enum conversion
    // options?: { id: string | number; label: string }[]; // array of objects for lookup
    displayAt?: 'table' | 'detail' | 'both' | 'none';
    optionsParameter?: InputParameter;
    validators?: {
        required?: boolean;
        email?: boolean;
        custom?: (value: any) => boolean; // return false if invalid
        customMessage?: string;
    };
}
