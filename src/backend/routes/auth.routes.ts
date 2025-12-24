import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const authRouter = Router();

authRouter.post('/auth/login', asyncHandler(AuthController.login));
authRouter.get('/auth/logout', asyncHandler(authBearerMiddleware), asyncHandler(AuthController.logout));
authRouter.post('/auth/reload-user', asyncHandler(authBearerMiddleware), asyncHandler(AuthController.reloadUserSession));

export default authRouter;
