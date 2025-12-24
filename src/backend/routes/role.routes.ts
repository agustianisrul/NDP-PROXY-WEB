import { Router } from 'express';
import { addRole, deleteRole, editRole, getAllRole } from '../controllers/role.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const roleRouter = Router();

roleRouter.get('/role/list-role', asyncHandler(authBearerMiddleware), asyncHandler(getAllRole));
roleRouter.post('/role/add-role', asyncHandler(authBearerMiddleware), asyncHandler(addRole));
roleRouter.post('/role/edit-role', asyncHandler(authBearerMiddleware), asyncHandler(editRole));
roleRouter.post('/role/delete-role', asyncHandler(authBearerMiddleware), asyncHandler(deleteRole));

export default roleRouter;
