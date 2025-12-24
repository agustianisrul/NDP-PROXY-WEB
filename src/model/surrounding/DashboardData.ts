import { DashboardDetail } from './DashboardDetail';
import { DashboardFileActivity } from './DashboardFileActivity';

export interface DashboardData {
    totalUpload: number;
    totalComplete: number;
    totalPending: number;
    totalDownload: number;
    detail: DashboardDetail[];
    fileList: DashboardFileActivity[];
}
