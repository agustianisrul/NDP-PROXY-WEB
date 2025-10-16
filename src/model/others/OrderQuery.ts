export type Order<T> = {
    column: keyof T & string;
    direction?: 'asc' | 'desc';
};
