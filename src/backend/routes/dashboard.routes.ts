import { Router } from 'express';
import { DashboardController } from '../controllers/surrounding/dashboard.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const dashboardRouter = Router();

dashboardRouter.post('/dashboard/list-dashboard', asyncHandler(authBearerMiddleware), asyncHandler(DashboardController.getDashboardData));

export default dashboardRouter;
