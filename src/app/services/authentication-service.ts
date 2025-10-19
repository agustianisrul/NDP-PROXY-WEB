import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { firstValueFrom, fromEvent, merge, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { GroupDetail } from '../../model/custom-entity/GroupDetail';
import { RoleDetail } from '../../model/custom-entity/RoleDetail';
import { UserSession } from '../../model/custom-entity/UserSession';
import { ApiResponse } from '../../model/others/ApiResponse';
import { RoleEnumService } from './role-enum-service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user = signal<UserSession | null>(null);
    group = signal<GroupDetail | null>(null);
    roleList = signal<RoleDetail[] | null>(null);
    loading = signal<boolean>(true);

    redirectUrl: string | null = null;

    private readonly idleTimeoutMs = 15 * 60 * 1000;
    private idleSub?: Subscription;

    constructor(
        private readonly http: HttpClient,
        @Inject(PLATFORM_ID) private readonly platformId: Object,
        private readonly roleEnumService: RoleEnumService
    ) {}

    /** 🔐 Perform login */
    login(username: string, password: string): Observable<ApiResponse<any>> {
        const credential = btoa(`${username}:${password}`);

        return this.http.post<any>('/v2/auth/login', { credential }, this.defaultOptions).pipe(
            tap(async (res) => {
                if (res?.data) {
                    this.user.set(res.data.userInfo);
                    this.group.set(res.data.group);
                    this.roleList.set(res.data.roleList);
                    this.loading.set(false);
                    this.startIdleWatcher();
                    if (Object.keys(RoleEnumService.getRoleEnum()).length === 0) {
                        await this.roleEnumService.loadEnums(res.data.roleList);
                    }
                }
            })
        );
    }

    /** 🚪 Logout and clear session */
    logout(): Observable<any> {
        return this.http.get('/v2/auth/logout', this.defaultOptions).pipe(tap(() => this.clearUser()));
    }

    /** 🧹 Reset auth state */
    clearUser() {
        this.user.set(null);
        this.group.set(null);
        this.loading.set(false);
        this.stopIdleWatcher();
    }

    async loadCurrentUser(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            this.clearUser();
            return;
        }

        this.loading.set(true);

        await firstValueFrom(
            this.http.get('/v2/auth/reload-user', this.defaultOptions).pipe(
                map(async (res: any) => {
                    this.user.set(res.data.userInfo);
                    this.group.set(res.data.group);
                    this.roleList.set(res.data.roleList);
                    this.loading.set(false);
                    this.startIdleWatcher();
                    if (Object.keys(RoleEnumService.getRoleEnum()).length === 0) {
                        await this.roleEnumService.loadEnums(res.data.roleList);
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
                switchMap(() => timer(this.idleTimeoutMs)),
                tap(() => {
                    if (this.user()) {
                        this.logout().subscribe(() => {
                            alert('Session expired due to inactivity');
                            location.href = '/login';
                        });
                    }
                })
            )
            .subscribe();
    }

    private stopIdleWatcher() {
        this.idleSub?.unsubscribe();
        this.idleSub = undefined;
    }
}
