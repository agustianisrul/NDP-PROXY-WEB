import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const userRouter = Router();

userRouter.post('/user/register-user-admin', asyncHandler(UserController.addUser));
userRouter.get('/user/list-user', asyncHandler(authBearerMiddleware), asyncHandler(UserController.getAllUsers));
userRouter.get('/user/list-user-group', asyncHandler(authBearerMiddleware), asyncHandler(UserController.getAllUserGroup));
userRouter.post('/user/add-user', asyncHandler(authBearerMiddleware), asyncHandler(UserController.addUser));
userRouter.post('/user/edit-user', asyncHandler(authBearerMiddleware), asyncHandler(UserController.editUser));
userRouter.post('/user/edit-profile-user', asyncHandler(authBearerMiddleware), asyncHandler(UserController.editProfileUser));
userRouter.post('/user/delete-user', asyncHandler(authBearerMiddleware), asyncHandler(UserController.deleteUser));

export default userRouter;
