import { Router } from 'express';
import { SchedulerController } from '../controllers/surrounding/scheduler.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const schedulerRouter = Router();

schedulerRouter.get('/scheduler/list-scheduler', asyncHandler(authBearerMiddleware), asyncHandler(SchedulerController.getAllScheduler));

export default schedulerRouter;
