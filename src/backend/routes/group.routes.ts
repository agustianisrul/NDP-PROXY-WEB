import { Router } from 'express';
import { addGroup, deleteGroup, editGroup, getAllGroup, getGroup } from '../controllers/group.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const groupRouter = Router();

groupRouter.get('/group/list-group', asyncHandler(authBearerMiddleware), asyncHandler(getAllGroup));
groupRouter.get('/group/get-group/:id', asyncHandler(authBearerMiddleware), asyncHandler(getGroup));
groupRouter.post('/group/add-group', asyncHandler(authBearerMiddleware), asyncHandler(addGroup));
groupRouter.post('/group/edit-group', asyncHandler(authBearerMiddleware), asyncHandler(editGroup));
groupRouter.post('/group/delete-group', asyncHandler(authBearerMiddleware), asyncHandler(deleteGroup));

export default groupRouter;
