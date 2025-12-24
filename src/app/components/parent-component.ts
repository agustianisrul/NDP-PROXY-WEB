import { Directive, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { AuthenticationService } from '../services/authentication-service';
import { RoleEnumService } from '../services/role-enum-service';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';

@Directive({
    selector: '[appParentComponent]',
})
export abstract class ParentComponent {
    protected readonly router = inject(Router);
    private readonly authenticationService = inject(AuthenticationService);
    protected readonly platformId = inject(PLATFORM_ID);

    protected hasRole(roleName: string): boolean {
        if (this.currentUser?.isAdmin === true && !this.currentGroup) {
            if (['CREATE', 'EDIT', 'DELETE'].includes(roleName)) {
                return true;
            }
            return false;
        }

        const activeMenuItem = this.authenticationService.lastMenuAccessed();
        const expectedRoleValue = RoleEnumService.getRoleValue(roleName);
        if (!expectedRoleValue || !activeMenuItem?.state?.['roleList']?.length) return false;

        const roles = activeMenuItem.state?.['roleList'];
        const tempRoles = roles.map((role: RoleDetail) => role.rolename);
        return tempRoles.includes(expectedRoleValue);
    }

    protected get currentUser(): UserSession | null {
        return this.authenticationService.user();
    }

    protected get currentGroup(): GroupDetail | null {
        return this.authenticationService.group();
    }

    protected get roleList(): RoleDetail[] | null {
        return this.authenticationService.roleList();
    }

    protected get currentUrl(): string {
        return this.router.url;
    }

    protected get currentMenuLabel(): string {
        return this.authenticationService.lastMenuAccessed()?.label ?? 'NONE';
    }

    protected get lastSuccessLogin(): String | null {
        return this.authenticationService.lastSuccessLogin()
    }

    protected get lastFailedLogin(): String | null {
        return this.authenticationService.lastFailedLogin()
    }

    protected get isPasswordExpired(): boolean | null {
        return this.authenticationService.isPasswordExpired()
    }

    protected get dashboardAutoRefresh(): number | null {
        return this.authenticationService.dashboardAutoRefresh();
    }    
}
