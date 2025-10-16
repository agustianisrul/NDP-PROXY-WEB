export type Condition<T> = {
    column: keyof T & string;
    operator?: string;
    value: T[keyof T];
};
