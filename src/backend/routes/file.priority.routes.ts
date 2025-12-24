import { Router } from 'express';
import { FilePriorityController } from '../controllers/surrounding/file.priority.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const filePriorityRouter = Router();

filePriorityRouter.get('/file-priority/list-file', asyncHandler(authBearerMiddleware), asyncHandler(FilePriorityController.getAllFilePriority));
filePriorityRouter.get('/file-priority/get-file', asyncHandler(authBearerMiddleware), asyncHandler(FilePriorityController.getFilePriorityById));
filePriorityRouter.post('/file-priority/create-file', asyncHandler(authBearerMiddleware), asyncHandler(FilePriorityController.postFilePriority));
filePriorityRouter.put('/file-priority/edit-file', asyncHandler(authBearerMiddleware), asyncHandler(FilePriorityController.putFilePriority));
filePriorityRouter.delete('/file-priority/delete-file', asyncHandler(authBearerMiddleware), asyncHandler(FilePriorityController.deleteFilePriority));

export default filePriorityRouter;
