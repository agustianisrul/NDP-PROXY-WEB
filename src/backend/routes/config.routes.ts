import { Router } from 'express';
import { ServerConfigController } from '../controllers/surrounding/server.config';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const serverConfigRouter = Router();

serverConfigRouter.get('/config-server/list-config', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.getAllConfig));
serverConfigRouter.put('/config-server/edit-config', asyncHandler(authBearerMiddleware), asyncHandler(ServerConfigController.editConfig));

export default serverConfigRouter;
