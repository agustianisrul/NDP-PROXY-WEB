import { Request, Response } from 'express';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { DashboardData } from '../../../model/surrounding/DashboardData';
import { DashboardDetail } from '../../../model/surrounding/DashboardDetail';
import { DashboardFileActivity } from '../../../model/surrounding/DashboardFileActivity';
import { DateUtils } from '../../config/date-utils';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { GenericSurrounding } from './generic.surrounding';

export class DashboardController {
    static async getDashboardData(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const payload = {
            startDate: DateUtils.formatToString(req.body.selectedDate[0], 'yyyy-MM-dd'),
            endDate: DateUtils.formatToString(req.body.selectedDate[1], 'yyyy-MM-dd'),
        };
        const endpointTarget = '/ndp/proxy/dashboard';
        const responseData: any = await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'POST', payload);
        if (responseData.data) {
            const tempTotalDashboard = responseData.data.counting.reduce(
                (acc: any, item: any) => {
                    acc.total_upload += item.value.total_upload || 0;
                    acc.total_complete += item.value.total_complete || 0;
                    acc.total_pending += item.value.total_pending || 0;
                    acc.total_download += item.value.total_download || 0;
                    return acc;
                },
                { total_upload: 0, total_complete: 0, total_pending: 0, total_download: 0 }
            );
            const tempDetail: DashboardDetail[] = responseData.data.counting.map((detail: any) => ({
                periode: detail.periode,
                totalUpload: detail.value.total_upload || 0,
                totalComplete: detail.value.total_complete || 0,
                totalPending: detail.value.total_pending || 0,
                totalDownload: detail.value.total_download || 0,
            }));
            const tempListFile: DashboardFileActivity[] = responseData.data.fileList.map((item: any, index: number) => ({
                keyId: index,
                fileName: item.file_name,
                action: item.action,
                status: item.status,
                updatedDate: item.update_date,
            }));
            const resultData: DashboardData = {
                totalUpload: tempTotalDashboard.total_upload,
                totalComplete: tempTotalDashboard.total_complete,
                totalPending: tempTotalDashboard.total_pending,
                totalDownload: tempTotalDashboard.total_download,
                detail: tempDetail,
                fileList: tempListFile,
            };
            return ResponseHelper.success(res, resultData);
        }
        return ResponseHelper.success(res);
    }

    static async resendData(req: Request, res: Response) {
        const userInfo: UserSession = (req.session as any).user;
        const requestBodyData: DashboardFileActivity = req.body;
        const endpointTarget = `/ndp/proxy/redownload/${requestBodyData.keyId}`;
        return ResponseHelper.customResponse(res, await GenericSurrounding.requestMicroService(userInfo, endpointTarget, 'GET'));
    }
}
