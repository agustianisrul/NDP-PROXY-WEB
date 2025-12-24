import { Router } from 'express';
import { ReportLoggingFileController } from '../controllers/surrounding/logging.file.controller';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authBearerMiddleware } from '../middlewares/authmiddleware';
import { AuditController } from '../controllers/audit.controller';

const reportLoggingFileRouter = Router();

reportLoggingFileRouter.post('/report-file/file-list', asyncHandler(authBearerMiddleware), asyncHandler(ReportLoggingFileController.getAllData));
reportLoggingFileRouter.post('/report-file/resend', asyncHandler(authBearerMiddleware), asyncHandler(ReportLoggingFileController.resendData));
reportLoggingFileRouter.post('/report-file/request-list', asyncHandler(authBearerMiddleware), asyncHandler(AuditController.getAllRequest));

export default reportLoggingFileRouter;
