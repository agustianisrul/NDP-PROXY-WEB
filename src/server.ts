import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { config } from './backend/config/environment';
import sessionConfig from './backend/config/session';
import auditMiddleware from './backend/middlewares/audit.trail';
import authRouter from './backend/routes/auth.routes';
import serverConfigRouter from './backend/routes/config.routes';
import dashboardRouter from './backend/routes/dashboard.routes';
import filePriorityRouter from './backend/routes/file.priority.routes';
import groupRouter from './backend/routes/group.routes';
import houseKeepingRouter from './backend/routes/housekeeping.routes';
import menuRouter from './backend/routes/menu.routes';
import prefixRouter from './backend/routes/prefix.routes';
import reportLoggingFileRouter from './backend/routes/report.logging.file.routes';
import roleRouter from './backend/routes/role.routes';
import schedulerRouter from './backend/routes/scheduler.routes';
import userRouter from './backend/routes/user.routes';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/******************** API SERVER *********************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionConfig);

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

app.use(auditMiddleware);
app.use('/v2', [
    authRouter,
    userRouter,
    menuRouter,
    groupRouter,
    roleRouter,
    schedulerRouter,
    prefixRouter,
    dashboardRouter,
    serverConfigRouter,
    filePriorityRouter,
    houseKeepingRouter,
    reportLoggingFileRouter
]);

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
    const port = Number(process.env['PORT']) || 4000;
    app.listen(port, '0.0.0.0', (error) => {
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
