import { GroupDetail } from './GroupDetail';
import { UserDetail } from './UserDetail';

export interface UserGroup extends UserDetail {
    group: GroupDetail | null;
    newPassword: string;
}
