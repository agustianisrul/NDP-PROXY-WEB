import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, firstValueFrom, fromEvent, merge, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ApiResponse } from '../../backend/utils/apiResponse';
import { UserSession } from '../../model/custom-entity/UserSession';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private readonly userSubject = new BehaviorSubject<UserSession | null>(null);
    private readonly loadingSubject = new BehaviorSubject<boolean>(true);

    user$ = this.userSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    redirectUrl: string | null = null;

    private readonly idleTimeoutMs = 15 * 60 * 1000;
    private idleSub?: Subscription;

    constructor(private readonly http: HttpClient, @Inject(PLATFORM_ID) private readonly platformId: Object) {
        console.log('constructor AuthenticationService');
    }

    /** 🔐 Perform login */
    login(username: string, password: string): Observable<ApiResponse<UserSession>> {
        const credential = btoa(`${username}:${password}`);

        return this.http.post<ApiResponse<UserSession>>('/v2/auth/login', { credential }, this.defaultOptions).pipe(
            tap((res) => {
                if (res?.data) {
                    console.log('✅ Login success, setting user:', res.data);
                    this.userSubject.next(res.data as UserSession);
                    this.startIdleWatcher();
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
        this.userSubject.next(null);
        this.stopIdleWatcher();
    }

    async loadCurrentUser(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            // ✅ SSR: skip calling API, avoid crashing prerender
            this.userSubject.next(null);
            this.loadingSubject.next(false);
            return;
        }

        this.loadingSubject.next(true);

        await firstValueFrom(
            this.http.get<{ data: UserSession }>('/v2/auth/reload-user', this.defaultOptions).pipe(
                map((res) => {
                    this.userSubject.next(res.data);
                    this.loadingSubject.next(false);
                    this.startIdleWatcher();
                }),
                catchError(() => {
                    this.userSubject.next(null);
                    this.loadingSubject.next(false);
                    return of(void 0);
                })
            )
        );
    }

    get currentUser(): UserSession | null {
        return this.userSubject.value;
    }

    get isLoading(): boolean {
        return this.loadingSubject.value;
    }

    /** 🔄 Cookie + headers handling */
    private get defaultOptions() {
        let headers: any = {
            'Content-Type': 'application/json',
            'x-client': 'angular-ssr',
        };

        // if (isPlatformServer(this.platformId)) {
        //     const cookie = (global as any)['cookieHeader'];
        //     if (cookie) headers['Cookie'] = cookie; // ✅ forward cookie to backend
        // }

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
                    if (this.userSubject.value) {
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
