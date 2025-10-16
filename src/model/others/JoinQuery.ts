export interface JoinQuery {
    table: string;
    first: string;
    operator?: string;
    second?: string;
    type?: 'inner' | 'left' | 'right' | 'cross';
}
