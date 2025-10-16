import { Router } from 'express';
import { addUser, deleteUser, editUser, getAllUsers } from '../controllers/user.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const userRouter = Router();

userRouter.post('/user/register-user-admin', asyncHandler(addUser));
userRouter.get('/user/list-user', asyncHandler(authBearerMiddleware), asyncHandler(getAllUsers));
userRouter.post('/user/add-user', asyncHandler(authBearerMiddleware), asyncHandler(addUser));
userRouter.post('/user/edit-user', asyncHandler(authBearerMiddleware), asyncHandler(editUser));
userRouter.post('/user/delete-user', asyncHandler(authBearerMiddleware), asyncHandler(deleteUser));

export default userRouter;
