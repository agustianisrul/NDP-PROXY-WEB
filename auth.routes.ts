import { Router } from 'express';
import { AuthController } from './src/backend/controllers/auth.controller';
import { asyncHandler } from './src/backend/middlewares/asyncHandler';
import { authBearerMiddleware } from './src/backend/middlewares/authmiddleware';

const authRouter = Router();

authRouter.post('/auth/login', asyncHandler(AuthController.login));
authRouter.get('/auth/logout', asyncHandler(authBearerMiddleware), asyncHandler(AuthController.logout));
authRouter.get('/auth/reload-user', asyncHandler(authBearerMiddleware), asyncHandler(AuthController.reloadUserSession));

export default authRouter;
