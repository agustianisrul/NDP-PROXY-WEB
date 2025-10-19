import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { ApiResponse } from '../../model/others/ApiResponse';

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly http = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    private get defaultOptions() {
        let headers: any = {
            'Content-Type': 'application/json',
            'x-client': 'angular-ssr',
        };

        if (isPlatformServer(this.platformId)) {
            const cookie = (global as any)['cookieHeader'];
            if (cookie) {
                headers['Cookie'] = cookie; // ✅ forward browser cookie
            }
        }

        return { headers, withCredentials: true };
    }

    private get defaultUploadOptions() {
        let headers: any = {
            'x-client': 'angular-ssr',
        };

        if (isPlatformServer(this.platformId)) {
            const cookie = (global as any)['cookieHeader'];
            if (cookie) {
                headers['Cookie'] = cookie; // ✅ forward browser cookie
            }
        }

        return { headers, withCredentials: true };
    }

    // ---------- HTTP response handling ----------
    private handleResponse<T>(result: Observable<T>): Observable<ApiResponse<T>> {
        return result.pipe(
            take(1),
            map((res: any) => {
                if (isPlatformBrowser(this.platformId)) {
                    queueMicrotask(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Request Success',
                            detail: 'response map request service',
                            life: 5000,
                        });
                    });
                }
                return { code: res.code, message: res.message, data: res.data };
            }),
            catchError((error) => {
                if (isPlatformBrowser(this.platformId)) {
                    queueMicrotask(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Request Failed',
                            detail: error?.error?.message || error?.message || 'Unknown error',
                            life: 5000,
                        });
                    });
                    // try {
                    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: JSON.stringify(error) });
                    // } catch {
                    //     console.error('MessageService add failed:', error);
                    // }
                }

                return of({ code: error.status, message: error.error, data: null });
            })
        );
    }

    getBackend<T>(endpoint: string): Observable<ApiResponse<T>> {
        return this.handleResponse(this.http.get<T>(`${endpoint}`, this.defaultOptions));
    }

    postBackend<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
        return this.handleResponse(this.http.post<T>(`${endpoint}`, body, this.defaultOptions));
    }
}
