import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { config } from './backend/config/environment.js';
import sessionConfig from './backend/config/session.js';
import auditMiddleware from './backend/middlewares/audit.trail';
import authRouter from './backend/routes/auth.routes.js';
import groupRouter from './backend/routes/group.routes.js';
import menuRouter from './backend/routes/menu.routes.js';
import roleRouter from './backend/routes/role.routes.js';
import userRouter from './backend/routes/user.routes.js';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/******************** API SERVER *********************/
app.use(express.json());
app.use(sessionConfig);
app.use(auditMiddleware);
app.use('/v2', [authRouter, userRouter, menuRouter, groupRouter, roleRouter]);

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
    express.static(browserDistFolder, {
        maxAge: '1y',
        index: false,
        redirect: false,
    })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
    angularApp
        .handle(req)
        .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
        .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
    const port = process.env['PORT'] || 4000;
    app.listen(port, (error) => {
        if (error) {
            throw error;
        }

        console.log(`Node Express server listening on http://localhost:${config.app.port} [${config.env}]`);
    });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
