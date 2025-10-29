import { Router } from 'express';
import { HouseKeepingController } from '../controllers/surrounding/housekeeping.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';

const houseKeepingRouter = Router();

houseKeepingRouter.get('/maintenance/list-maintenance', asyncHandler(authBearerMiddleware), asyncHandler(HouseKeepingController.getAllHouseKeeping));
houseKeepingRouter.post('/maintenance/create-maintenance', asyncHandler(authBearerMiddleware), asyncHandler(HouseKeepingController.postHouseKeeping));
houseKeepingRouter.put('/maintenance/edit-maintenance', asyncHandler(authBearerMiddleware), asyncHandler(HouseKeepingController.putHouseKeeping));
houseKeepingRouter.delete(
    '/maintenance/edit-maintenance',
    asyncHandler(authBearerMiddleware),
    asyncHandler(HouseKeepingController.deleteHouseKeeping)
);

export default houseKeepingRouter;
