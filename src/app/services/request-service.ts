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
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'If-None-Match': ''
        };

        if (isPlatformServer(this.platformId)) {
            const cookie = (globalThis as any)['cookieHeader'];
            if (cookie) {
                headers['Cookie'] = cookie; // ✅ forward browser cookie
            }
        }

        return { headers, withCredentials: true };
    }

    private get defaultUploadOptions() {
        let headers: any = {
            'x-client': 'angular-ssr',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'If-None-Match': ''
        };

        if (isPlatformServer(this.platformId)) {
            const cookie = (globalThis as any)['cookieHeader'];
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
                if (res.code !== 200) {
                    const messageError = res.data ? res.data : res.message;
                    const titleMessage = res.data ? res.message : 'Error';
                    this.displayMessageService('error', titleMessage, messageError);
                }
                return { code: res.code, message: res.message, data: res.data };
            }),
            catchError((error) => {
                const headerTitle = error?.error?.data ? error?.error?.message : 'Error';
                const displayMessage = error?.error?.data?.username || error?.error?.data || error?.error?.message || 'Unknown error';
                this.displayMessageService('error', headerTitle, this.objectToString(displayMessage));
                return of({ code: error.status, message: error.error, data: null });
            })
        );
    }

    private objectToString(obj: any, indent = ''): string {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj !== 'object') return String(obj);

        if (Array.isArray(obj)) {
            return `[${obj.map(item => this.objectToString(item)).join(', ')}]`;
        }

        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';

        const newIndent = indent + '  ';
        const items = entries.map(([key, value]) => {
            return `${newIndent}${key}: ${this.objectToString(value, newIndent)}`;
        });

        return `${items.join(',\n')}\n${indent}`;
    }

    getBackend<T>(endpoint: string): Observable<ApiResponse<T>> {
        return this.handleResponse(this.http.get<T>(`${endpoint}`, this.defaultOptions));
    }

    postBackend<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
        return this.handleResponse(this.http.post<T>(`${endpoint}`, body, this.defaultOptions));
    }

    displayMessageService(severity: string, headerTitle: string, detailMessage: string): void {
        if (isPlatformBrowser(this.platformId)) {
            this.messageService.add({ severity: severity, summary: headerTitle, detail: detailMessage, life: 5000 });
        }
    }
}
