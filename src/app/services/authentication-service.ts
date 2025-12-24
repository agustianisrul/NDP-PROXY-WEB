import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable, PLATFORM_ID, signal, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { firstValueFrom, fromEvent, merge, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { ApiResponse } from '../../model/others/ApiResponse';
import { RouterItem } from '../../model/others/RouterItem';
import { RoleEnumService } from './role-enum-service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

// Component for the session expired dialog
@Component({
    standalone: true,
    imports: [ButtonModule, DialogModule, DynamicDialogModule],
    template: `
    <div class="p-3">
      <p class="mb-4">Your session has expired due to inactivity.</p>
      <div class="flex justify-end">
        <button pButton pRipple 
                label="OK" 
                class="p-button-primary"
                (click)="onOk()"></button>
      </div>
    </div>
  `
})
export class SessionExpiredDialogComponent {
    constructor(
        public ref: DynamicDialogRef
    ) { }

    onOk() {
        this.ref.close();
    }
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private readonly messageService = inject(MessageService);
    private readonly dialogService = inject(DialogService);

    user = signal<UserSession | null>(null);
    group = signal<GroupDetail | null>(null);
    roleList = signal<RoleDetail[] | null>(null);
    loading = signal<boolean>(true);

    redirectUrl: string | null = null;
    lastMenuAccessed = signal<MenuItem | null>(null);
    lastSuccessLogin = signal<string | null>(null);
    lastFailedLogin = signal<string | null>(null);
    isPasswordExpired = signal<boolean | null>(false);
    dashboardAutoRefresh = signal<number | null>(30 * 1000);

    private idleTimeoutSecond = 15 * 60 * 1000;
    private idleSub?: Subscription;
    private sessionExpiredDialogRef?: DynamicDialogRef | undefined | null;

    constructor(
        private readonly http: HttpClient,
        @Inject(PLATFORM_ID) private readonly platformId: Object,
        private readonly roleEnumService: RoleEnumService,
        private readonly router: Router
    ) {
        this.restoreLastMenuAccessed();
    }

    /** 🔐 Perform login */
    login(username: string, password: string): Observable<ApiResponse<any>> {
        const credential = btoa(`${username}:${password}`);

        return this.http.post<any>('/v2/auth/login', { credential }, this.defaultOptions).pipe(
            tap(async (res) => {
                if (res?.data) {
                    this.user.set(res.data.userInfo);
                    this.group.set(res.data.group);
                    this.roleList.set(res.data.roleList);
                    this.lastFailedLogin.set(res.data.lastFailedLogin);
                    this.lastSuccessLogin.set(res.data.lastSuccessLogin);
                    this.isPasswordExpired.set(res.data.isPasswordExpired ?? false);
                    this.idleTimeoutSecond = res.data.idleTimeoutSecond * 1000;
                    this.dashboardAutoRefresh.set(res.data.dashboardAutoRefresh * 1000);
                    this.loading.set(false);
                    this.startIdleWatcher();
                    if (Object.keys(RoleEnumService.getRoleEnum()).length === 0) {
                        await this.roleEnumService.loadEnums(res.data.roleList);
                    }
                    const tempMenuList = this.menuItemList;
                    if (!this.isPasswordExpired() && tempMenuList && tempMenuList.length > 0) {
                        const tempMenuItem = tempMenuList[0];
                        this.redirectUrl = tempMenuItem.routerLink[0];
                        this.lastMenuAccessed.set(tempMenuItem);
                    } else {
                        this.redirectUrl = '/profile';
                        this.lastMenuAccessed.set({
                            label: 'Profile',
                            routerLink: ['/profile'],
                        });
                    }
                    const target = this.redirectUrl ?? '/dashboard';
                    this.router.navigateByUrl(target);
                }
            })
        );
    }

    /** 🚪 Logout and clear session */
    logout(): Observable<any> {
        return this.http.get('/v2/auth/logout', this.defaultOptions).pipe(
            tap(() => {
                this.clearUser();
            })
        );
    }

    /** 🧹 Reset auth state */
    clearUser() {
        this.user.set(null);
        this.group.set(null);
        this.loading.set(false);
        this.stopIdleWatcher();
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('lastMenuAccessed');
        }
    }

    async loadCurrentUser(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            this.clearUser();
            return;
        }

        this.loading.set(true);
        const tempLastMenu = this.lastMenuAccessed();

        await firstValueFrom(
            this.http.post('/v2/auth/reload-user', { menuTitle: tempLastMenu?.label }, this.defaultOptions).pipe(
                map(async (res: any) => {
                    this.user.set(res.data.userInfo);
                    this.group.set(res.data.group);
                    this.roleList.set(res.data.roleList);
                    this.lastFailedLogin.set(res.data.lastFailedLogin);
                    this.lastSuccessLogin.set(res.data.lastSuccessLogin);
                    this.isPasswordExpired.set(res.data.isPasswordExpired ?? false);
                    this.idleTimeoutSecond = res.data.idleTimeoutSecond * 1000;
                    this.dashboardAutoRefresh.set(res.data.dashboardAutoRefresh * 1000);
                    this.loading.set(false);
                    this.startIdleWatcher();
                    if (Object.keys(RoleEnumService.getRoleEnum()).length === 0) {
                        await this.roleEnumService.loadEnums(res.data.roleList);
                    }
                    const tempMenuItemList = this.menuItemList;
                    const currentMenuItem = this.findMenuItem(tempMenuItemList, tempLastMenu?.label ?? '');
                    if (currentMenuItem) {
                        this.lastMenuAccessed.set(currentMenuItem);
                    }
                }),
                catchError(() => {
                    this.clearUser();
                    return of(void 0);
                })
            )
        );
    }

    get currentUser(): UserSession | null {
        return this.user();
    }

    get isLoading(): boolean {
        return this.loading();
    }

    get menuItemList(): MenuItem[] | null {
        const tempGroup = this.group();
        if (tempGroup?.menublob && tempGroup?.menublob.length > 0) {
            return this.buildNonDefaultMenuItem(tempGroup.menublob);
        }
        const tempUserLogin = this.user();
        if (tempUserLogin?.isAdmin) {
            return [
                // { label: 'Permission', icon: 'pi pi-table', routerLink: ['/permission'] },
                // { label: 'Menu', icon: 'pi pi-check-square', routerLink: ['/menus'] },
                { label: 'Group', icon: 'pi pi-mobile', routerLink: ['/group'] },
                { label: 'User', icon: 'pi pi-id-card', routerLink: ['/user'] },
            ];
        }
        return null;
    }

    private buildNonDefaultMenuItem(routerItemList: RouterItem[]): MenuItem[] | null {
        if (!routerItemList || routerItemList.length === 0) return null;

        return routerItemList.map((item: RouterItem) => {
            const tempMenuItem: MenuItem = {};
            tempMenuItem.id = item.key;
            tempMenuItem.label = item.label;
            if (item.icon) {
                tempMenuItem.icon = item.icon;
            }
            if (item.data?.routerLink) {
                const link = item.data.routerLink;
                tempMenuItem.routerLink = link.includes('/') ? [link] : [`/${link}`];
            }
            if (item.data?.permission && item.data?.permission.length > 0) {
                tempMenuItem.state = { roleList: item.data?.permission };
            }
            if (item.children && item.children.length > 0) {
                tempMenuItem.items = this.buildNonDefaultMenuItem(item.children) ?? [];
            }
            return tempMenuItem;
        });
    }

    private buildMenuItem(group: GroupDetail, menuLabel: string): MenuItem | null {
        if (!group) return null;
        if (!group.menublob || group.menublob.length === 0) return null;

        const tempRouterItem = this.findMenuItemFromRouterItem(group.menublob, menuLabel);
        if (!tempRouterItem) return null;

        const tempMenuItem: MenuItem = {};
        tempMenuItem.id = tempRouterItem.key;
        tempMenuItem.label = tempRouterItem.label;
        if (tempRouterItem.icon) {
            tempMenuItem.icon = tempRouterItem.icon;
        }
        if (tempRouterItem.data?.routerLink) {
            const link = tempRouterItem.data?.routerLink;
            tempMenuItem.routerLink = link?.includes('/')
                ? [link]
                : [`/${link}`];
        }
        if (tempRouterItem.data?.permission && tempRouterItem.data?.permission.length > 0) {
            tempMenuItem.state = { roleList: tempRouterItem.data?.permission };
        }
        if (tempRouterItem.children && tempRouterItem.children.length > 0) {
            tempMenuItem.items = this.buildNonDefaultMenuItem(tempRouterItem.children) ?? [];
        }
        return tempMenuItem;
    }

    private findMenuItemFromRouterItem(routerItemList: RouterItem[], menuLabel: string): RouterItem | null {
        for (const routerItem of routerItemList) {
            if (routerItem.label === menuLabel) {
                return routerItem;
            }
            if (routerItem.children.length > 0) {
                const tempRouterItem = this.findMenuItemFromRouterItem(routerItem.children, menuLabel);
                if (tempRouterItem) {
                    return tempRouterItem;
                }
            }
        }
        return null;
    }

    private findMenuItem(menuItemList: MenuItem[] | null, menuLabel: string): MenuItem | null {
        if (!menuItemList || menuItemList.length === 0) return null;

        for (const menuItem of menuItemList) {
            if (menuItem.label === menuLabel) {
                return menuItem;
            }
            if (menuItem.items && menuItem.items.length > 0) {
                const tempMenuItem = this.findMenuItem(menuItem.items, menuLabel);
                if (tempMenuItem) {
                    return tempMenuItem;
                }
            }
        }
        return null;
    }

    private restoreLastMenuAccessed(): void {
        if (isPlatformBrowser(this.platformId)) {
            const saved = localStorage.getItem('lastMenuAccessed');
            if (saved) {
                try {
                    this.lastMenuAccessed.set(JSON.parse(saved));
                } catch {
                    this.lastMenuAccessed.set(null);
                }
            }
        }
    }

    /** Called whenever user clicks menu or changes last menu */
    setLastMenuAccessed(menu: MenuItem): void {
        this.lastMenuAccessed.set(menu);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lastMenuAccessed', JSON.stringify(menu));
        }
    }

    /** 🔄 Cookie + headers handling */
    private get defaultOptions() {
        let headers: any = {
            'Content-Type': 'application/json',
            'x-client': 'angular-ssr',
        };

        return { headers, withCredentials: true };
    }

    // 👇 Idle watcher (resettable)
    private startIdleWatcher() {
        this.stopIdleWatcher(); // clear existing
        const activityEvents$ = merge(
            fromEvent(document, 'mousemove'),
            fromEvent(document, 'keydown'),
            fromEvent(document, 'click'),
            fromEvent(document, 'scroll')
        ).pipe(map(() => 'active'));

        this.idleSub = activityEvents$
            .pipe(
                switchMap(() => timer(this.idleTimeoutSecond)),
                tap(() => {
                    this.logout().subscribe();
                    this.showSessionExpiredDialog();
                })
            )
            .subscribe();
    }

    private stopIdleWatcher() {
        this.idleSub?.unsubscribe();
        this.idleSub = undefined;
    }

    private showSessionExpiredDialog() {
        // Close any existing dialog first
        this.closeSessionExpiredDialog();

        this.sessionExpiredDialogRef = this.dialogService.open(SessionExpiredDialogComponent, {
            header: 'Session Expired',
            width: '400px',
            modal: true,
            closable: false,
            closeOnEscape: false,
            dismissableMask: false,
            data: {
                authService: this
            }
        });

        // Handle dialog closure
        this.sessionExpiredDialogRef?.onClose.subscribe(() => {
            this.sessionExpiredDialogRef = undefined;
            this.router.navigate(['/login']);
        });
    }

    private closeSessionExpiredDialog() {
        if (this.sessionExpiredDialogRef) {
            this.sessionExpiredDialogRef.close();
            this.sessionExpiredDialogRef = undefined;
        }
    }

}
