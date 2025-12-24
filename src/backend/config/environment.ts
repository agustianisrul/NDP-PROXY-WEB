import dotenv from 'dotenv';
import * as path from 'path';

// determine env file dynamically
const nodeEnv = process.env['NODE_ENV'] || 'development';

// supported: development, staging, production
const envFile = nodeEnv === 'development' ? '.env.development' : '.env.production';

// load the chosen env file
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// timezone (optional, for server-side Date)
process.env.TZ = process.env['TIMEZONE'] || 'Asia/Jakarta';

const validateAndFormatSecretKey = (inputKey: string): string => {
    let cleanedKey = inputKey.replace(/[^A-Za-z0-9]/g, '');
    if (cleanedKey.length < 46) {
        const paddingNeeded = 46 - cleanedKey.length;
        cleanedKey += 'x'.repeat(paddingNeeded);
    }
    return cleanedKey;
}

export const config = {
    env: nodeEnv,

    // Cookie session
    cookie: {
        name: process.env['COOKIE_NAME'] || 'app_session',
        maxAge: parseInt(process.env['COOKIE_MAX_AGE_MS'] || '3600000', 10),
        secret: validateAndFormatSecretKey(process.env['SECRET_KEY_BASE'] || '7SI9QbfZy9zXuDb6O3SGG0okP0FU75Yh2RYkLskg4SBMkx'),
        secure: false,
        sameSite: (process.env['SESSION_SAMESITE'] as 'lax' | 'strict' | 'none') || 'lax',
    },

    // App
    app: {
        port: parseInt(process.env['PORT'] || '4000', 10),
        apiUrl: process.env['API_URL'] || 'http://localhost:3000/api',
        appName: process.env['APP_NAME'] || 'Angular SSR App',
        timezone: process.env['TIMEZONE'] || 'Asia/Jakarta',
        locale: process.env['LOCALE'] || 'id',
    },

    db: {
        host: process.env['DB_HOST'] || 'localhost',
        port: +(process.env['DB_PORT'] || 5432),
        user: process.env['DB_USER'] || 'user',
        pass: process.env['DB_PASS'] || 'pass',
        name: process.env['DB_NAME'] || 'db',
        db_file_name: process.env['DB_FILE_NAME'] || 'admdb.sqlite',
    },
};
