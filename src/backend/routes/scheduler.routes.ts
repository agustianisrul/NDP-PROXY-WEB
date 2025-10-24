import { Router } from 'express';
import { SchedulerController } from '../controllers/surrounding/scheduler.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const schedulerRouter = Router();

schedulerRouter.get('/scheduler/list-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.getAllScheduler));
schedulerRouter.get('/scheduler/:id', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.getSchedulerById));
schedulerRouter.post('/scheduler/add-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.postScheduler));
schedulerRouter.post('/scheduler/edit-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.putScheduler));
schedulerRouter.post('/scheduler/delete-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.deleteScheduler));
schedulerRouter.get('/scheduler/start-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.startScheduler));
schedulerRouter.get('/scheduler/stop-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.stopScheduler));

export default schedulerRouter;
