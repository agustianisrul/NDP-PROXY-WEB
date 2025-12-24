import { Router } from 'express';
import { ServerConfigController } from '../controllers/surrounding/server.config.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const serverConfigRouter = Router();

serverConfigRouter.get('/config-server/list-config/config-type-list', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.getAllConfig));
serverConfigRouter.get('/config-server/list-config/common-config', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.getAllConfig));
serverConfigRouter.post('/config-server/create-config', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.postConfig));
serverConfigRouter.post('/config-server/edit-config', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.editConfig));
serverConfigRouter.post('/config-server/delete-config', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.deleteConfig));
serverConfigRouter.post('/config-parameter/list-form-type', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.getConfigParameter));
serverConfigRouter.get('/config-parameter/list-form-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.getSchedulerParameter));

export default serverConfigRouter;
