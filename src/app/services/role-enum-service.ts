import { Injectable } from '@angular/core';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';

@Injectable({
    providedIn: 'root',
})
export class RoleEnumService {
    private static roleEnum: Record<string, string> = {};

    async loadEnums(roleDetail: RoleDetail[] | null): Promise<void> {
        RoleEnumService.roleEnum = {};
        if (roleDetail && roleDetail.length > 0) {
            for (const role of roleDetail) {
                const key = role.rolename.replaceAll(/\s+/g, '_').toUpperCase();
                RoleEnumService.roleEnum[key] = role.rolename;
            }
        }
    }

    static getRoleEnum(): Record<string, string> {
        return RoleEnumService.roleEnum;
    }

    static getRoleValue(key: string): string | undefined {
        return RoleEnumService.roleEnum[key];
    }
}
