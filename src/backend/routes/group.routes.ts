import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const groupRouter = Router();

groupRouter.get('/group/list-group', asyncHandler(authBearerMiddleware), asyncHandler(GroupController.getAllGroup));
groupRouter.get('/group/group-menu-role', asyncHandler(authBearerMiddleware), asyncHandler(GroupController.getAllGroupMenuRole));
groupRouter.post('/group/add-group', asyncHandler(authBearerMiddleware), asyncHandler(GroupController.addGroup));
groupRouter.post('/group/edit-group', asyncHandler(authBearerMiddleware), asyncHandler(GroupController.editGroup));
groupRouter.post('/group/delete-group', asyncHandler(authBearerMiddleware), asyncHandler(GroupController.deleteGroup));

export default groupRouter;
