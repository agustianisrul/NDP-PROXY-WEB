import { isPlatformBrowser } from '@angular/common';
import { Directive, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { RouterItem } from '../../model/others/RouterItem';
import { AuthenticationService } from '../services/authentication-service';
import { RoleEnumService } from '../services/role-enum-service';

@Directive({
    selector: '[appParentComponent]',
})
export abstract class ParentComponent implements OnInit, OnDestroy {
    protected readonly router = inject(Router);
    private readonly authenticationService = inject(AuthenticationService);
    protected readonly platformId = inject(PLATFORM_ID);
    private routerSub?: Subscription;
    private _activeMenuItem: RouterItem | null = null;

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const nav = this.router.currentNavigation();
            const menuItem = nav?.extras?.state?.['menuItem'];
            this._activeMenuItem = menuItem ?? this.resolveActiveMenuItem();
        }
    }

    ngOnInit(): void {
        console.log(
            'Initial Active Menu:',
            this._activeMenuItem,
            this.authenticationService.lastMenuAccessed,
            this.authenticationService.redirectUrl
        );
    }
    //     // update once when route changes
    //     this.routerSub = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
    //         this._activeMenuItem = this.resolveActiveMenuItem();
    //     });

    //     // initialize for current route
    //     this._activeMenuItem = this.resolveActiveMenuItem();
    // }

    ngOnDestroy(): void {
        this.routerSub?.unsubscribe();
    }

    private resolveActiveMenuItem(): RouterItem | null {
        const currentUrl = this.router.url;
        const groupDetail = this.authenticationService.group();
        const routerItemList: RouterItem[] | null = groupDetail?.menublob && groupDetail.menublob.length > 0 ? groupDetail.menublob : null;
        return this.findMenuItemByUrl(routerItemList, currentUrl);
    }

    private findMenuItemByUrl(routerItemList: RouterItem[] | null, currentUrl: string): RouterItem | null {
        if (!routerItemList?.length) return null;

        for (const routerItem of routerItemList) {
            if (routerItem?.routerLink && currentUrl.includes(routerItem.routerLink)) {
                return routerItem;
            }
            if (routerItem.items?.length) {
                const found = this.findMenuItemByUrl(routerItem.items, currentUrl);
                if (found) return found;
            }
        }
        return null;
    }

    protected hasRole(roleName: string): boolean {
        if (this.currentUser?.isAdmin === true) return true;

        const activeMenuItem = this._activeMenuItem;
        const expectedRoleValue = RoleEnumService.getRoleValue(roleName);
        if (!expectedRoleValue || !activeMenuItem?.roles?.length) return false;

        const roles = activeMenuItem.roles as string[];
        return roles.includes(expectedRoleValue);
    }

    protected get currentUser(): UserSession | null {
        return this.authenticationService.user();
    }

    protected get roleList(): RoleDetail[] | null {
        return this.authenticationService.roleList();
    }

    protected get currentUrl(): string {
        return this.router.url;
    }

    protected get currentMenuLabel(): string {
        return this._activeMenuItem?.label ?? this.router.url.replaceAll('/', '');
        // return this.authenticationService.
    }
}
