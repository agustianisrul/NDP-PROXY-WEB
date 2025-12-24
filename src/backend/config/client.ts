import type { Knex } from 'knex';
import knex from 'knex';
import { config } from './environment';

const knexConfig: Knex.Config = {
    client: 'pg',
    connection: {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.pass,
        database: config.db.name,
    },
    pool: { min: 2, max: 10 },
    debug: false,
};

const db: Knex = knex(knexConfig);

export default db;
