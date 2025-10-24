import type { Knex } from 'knex';
import { Condition } from '../../model/others/ConditionQuery';
import { JoinQuery } from '../../model/others/JoinQuery';
import { Order } from '../../model/others/OrderQuery';
import db from '../config/client';

export class GenericRepository {
    private readonly pool: Knex;

    constructor(knexInstance: Knex = db) {
        this.pool = knexInstance;
    }

    private applyConditions<T>(queryBuilder: Knex.QueryBuilder, conditions: Condition<T>[]): void {
        for (const { column, operator = '=', value } of conditions) {
            queryBuilder.where(column, operator, value as any);
        }
    }

    private applyOrders<T>(query: Knex.QueryBuilder, orders: Order<T>[]): void {
        for (const { column, direction = 'asc' } of orders) {
            query.orderBy(column, direction);
        }
    }

    private applyJoins<T>(query: Knex.QueryBuilder, joins: JoinQuery[]): Knex.QueryBuilder {
        for (const j of joins) {
            const joinType = j.type ?? 'left';
            const operator = j.operator ?? '=';
            if (!j.second) throw new Error('Join must specify "second" field');

            switch (joinType) {
                case 'inner':
                    query = query.innerJoin(j.table, j.first, operator, j.second);
                    break;
                case 'right':
                    query = query.rightJoin(j.table, j.first, operator, j.second);
                    break;
                case 'cross':
                    query = query.crossJoin(j.table, j.first, operator, j.second);
                    break;
                default:
                    query = query.leftJoin(j.table, j.first, operator, j.second);
                    break;
            }
        }

        return query;
    }

    private async buildAliasedColumns(tempPool: Knex, tables: string[]): Promise<string[]> {
        const selectColumns: string[] = [];

        for (const tbl of tables) {
            try {
                const info = await tempPool(tbl).columnInfo();
                for (const col of Object.keys(info)) {
                    selectColumns.push(`${tbl}.${col} as ${tbl}_${col}`);
                }
            } catch {
                selectColumns.push(`${tbl}.*`);
            }
        }

        return selectColumns;
    }

    // ─────────────────────────────────────────────
    // Main: Simplified select()
    public async select<T extends Record<string, any>>(
        tableName: string,
        joins: JoinQuery[] = [],
        conditions: Condition<T>[] = [],
        orders: Order<T>[] = [],
        limit?: number,
        offset?: number,
        trx?: Knex.Transaction
    ): Promise<T[]> {
        try {
            const tempPool = trx ?? this.pool;
            const hasJoins = joins.length > 0;
            let query: Knex.QueryBuilder;

            if (hasJoins) {
                // joined query path
                const tables = [tableName, ...joins.map((j) => j.table)];
                const selectColumns = await this.buildAliasedColumns(tempPool, tables);
                query = tempPool.from(tableName).select(selectColumns); //.select('*');
                query = this.applyJoins(query, joins);
            } else {
                // simple query path
                query = tempPool(tableName).select('*');
            }

            if (conditions.length > 0) this.applyConditions(query, conditions);
            if (orders.length > 0) this.applyOrders(query, orders);
            if (limit) query.limit(limit);
            if (offset) query.offset(offset);

            const rows = await query;
            return rows as unknown as T[];
        } catch (error) {
            console.error('❌ Error in select query:', error);
            throw error;
        }
    }

    /** SELECT with optional conditions, order, pagination */
    public async select2<T extends Record<string, any>>(
        tableName: string,
        conditions: Condition<T>[] = [],
        orders: Order<T>[] = [],
        limit?: number,
        offset?: number,
        trx?: Knex.Transaction
    ): Promise<T[]> {
        try {
            const tempPool = trx ?? this.pool;
            let query = tempPool<T>(tableName).select('*');

            if (conditions.length > 0) {
                query = query.where((qb: any) => this.applyConditions(qb, conditions));
            }

            if (orders.length > 0) {
                this.applyOrders(query, orders);
            }

            if (limit) query = query.limit(limit);
            if (offset) query = query.offset(offset);

            return (await query) as T[];
        } catch (error) {
            console.error('error select query', error);
            throw error;
        }
    }

    /** SELECT first row or null */
    public async findOne<T extends Record<string, any>>(
        tableName: string,
        conditions: Condition<T>[] = [],
        orders: Order<T>[] = [],
        trx?: Knex.Transaction
    ): Promise<T | null> {
        try {
            const tempPool = trx ?? this.pool;
            let query = tempPool<T>(tableName).select('*');

            if (conditions.length > 0) {
                query = query.where((qb: any) => this.applyConditions(qb, conditions));
            }

            if (orders.length > 0) {
                this.applyOrders(query, orders);
            }

            return (await query.first()) as T | null;
        } catch (error) {
            console.error('error findOne query', error);
            throw error;
        }
    }

    /** INSERT row(s) and return inserted rows */
    public async insert<T extends Record<string, any>>(tableName: string, data: Partial<T> | Partial<T>[], trx?: Knex.Transaction): Promise<T[]> {
        try {
            const tempPool = trx ?? this.pool;
            return (await tempPool<T>(tableName)
                .insert(data as any)
                .returning('*')) as T[];
        } catch (error) {
            console.error('error insert query', error);
            throw error;
        }
    }

    /** UPDATE row(s) and return updated rows */
    public async update<T extends Record<string, any>>(
        tableName: string,
        data: Partial<T>,
        conditions: Condition<T>[] = [],
        trx?: Knex.Transaction
    ): Promise<T[]> {
        try {
            const tempPool = trx ?? this.pool;
            return (await tempPool<T>(tableName)
                .where((qb: any) => this.applyConditions(qb, conditions))
                .update(data as any)
                .returning('*')) as T[];
        } catch (error) {
            console.error('error update query', error);
            throw error;
        }
    }

    /** DELETE row(s) and return deleted rows */
    public async delete<T extends Record<string, any>>(tableName: string, conditions: Condition<T>[] = [], trx?: Knex.Transaction): Promise<T[]> {
        try {
            const tempPool = trx ?? this.pool;
            return (await tempPool<T>(tableName)
                .where((qb: any) => this.applyConditions(qb, conditions))
                .del()
                .returning('*')) as T[];
        } catch (error) {
            console.error('error delete query', error);
            throw error;
        }
    }

    /** Run a set of queries in a transaction */
    public async withTransaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
        return await this.pool.transaction(async (trx) => {
            return await callback(trx);
        });
    }
}
