import { Router } from 'express';
import { addMenu, deleteMenu, editMenu, getAllMenu, getAllMenuIcons, getMenuRole } from '../controllers/menu.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const menuRouter = Router();

menuRouter.get('/menu/list-menu', asyncHandler(authBearerMiddleware), asyncHandler(getAllMenu));
menuRouter.post('/menu/add-menu', asyncHandler(authBearerMiddleware), asyncHandler(addMenu));
menuRouter.post('/menu/edit-menu', asyncHandler(authBearerMiddleware), asyncHandler(editMenu));
menuRouter.post('/menu/delete-menu', asyncHandler(authBearerMiddleware), asyncHandler(deleteMenu));

menuRouter.get('/menu/list-menu-role', asyncHandler(authBearerMiddleware), asyncHandler(getMenuRole));
menuRouter.get('/menu/list-icon', asyncHandler(authBearerMiddleware), asyncHandler(getAllMenuIcons));

export default menuRouter;
