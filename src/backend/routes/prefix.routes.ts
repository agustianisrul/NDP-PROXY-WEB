import { Router } from 'express';
import { PrefixController } from '../controllers/surrounding/prefix.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const prefixRouter = Router();

prefixRouter.get('/Prefix/list-Prefix', asyncHandler(authBearerMiddleware), asyncHandler(PrefixController.getAllPrefix));
prefixRouter.get('/Prefix/:id', asyncHandler(authBearerMiddleware), asyncHandler(PrefixController.getPrefixById));
prefixRouter.post('/Prefix/add-Prefix', asyncHandler(authBearerMiddleware), asyncHandler(PrefixController.postPrefix));
prefixRouter.post('/Prefix/edit-Prefix', asyncHandler(authBearerMiddleware), asyncHandler(PrefixController.putPrefix));
prefixRouter.post('/Prefix/delete-Prefix', asyncHandler(authBearerMiddleware), asyncHandler(PrefixController.deletePrefix));

export default prefixRouter;
