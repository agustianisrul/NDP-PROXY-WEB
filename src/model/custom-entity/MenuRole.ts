import { MenuDetail } from './MenuDetail';
import { RoleDetail } from './RoleDetail';

export interface MenuRole extends MenuDetail {
    roleList: RoleDetail[];
}
