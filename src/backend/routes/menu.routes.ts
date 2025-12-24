import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const menuRouter = Router();

menuRouter.get('/menu/list-menu', asyncHandler(authBearerMiddleware), asyncHandler(MenuController.getAllMenu));
menuRouter.post('/menu/add-menu', asyncHandler(authBearerMiddleware), asyncHandler(MenuController.addMenu));
menuRouter.post('/menu/edit-menu', asyncHandler(authBearerMiddleware), asyncHandler(MenuController.editMenu));
menuRouter.post('/menu/delete-menu', asyncHandler(authBearerMiddleware), asyncHandler(MenuController.deleteMenu));

menuRouter.get('/menu/list-menu-role', asyncHandler(authBearerMiddleware), asyncHandler(MenuController.getAllMenuRole));
menuRouter.get('/menu/list-icon', asyncHandler(authBearerMiddleware), asyncHandler(MenuController.getAllMenuIcons));

export default menuRouter;
