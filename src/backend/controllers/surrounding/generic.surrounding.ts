import { UserSession } from '../../../model/custom-entity/UserSession';
import { ApiResponse, ApiResponseData } from '../../../model/others/ApiResponse';
import { config } from '../../config/environment';
import { ResponseCode } from '../../utils/responseCode';
import { TokenUtils } from '../../utils/TokenUtils';

export class GenericSurrounding {
    static async requestMicroService<T>(
        userInfo: UserSession,
        backendUrl: string,
        methodType: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        payload?: ApiResponseData<T>
    ): Promise<ApiResponse<T>> {
        // 🔐 Generate JWT
        const token = await TokenUtils.generateToken(userInfo as any);
        if (!token) {
            return {
                code: ResponseCode.UNAUTHORIZED,
                message: 'Unauthorized: Failed to generate token',
                data: null,
            };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            // 🚫 ADD CACHE BUSTING FOR GET REQUESTS
            const finalUrl = backendUrl;
            // if (methodType === 'GET') {
            //     const separator = backendUrl.includes('?') ? '&' : '?';
            //     finalUrl = `${backendUrl}${separator}_t=${Date.now()}`;
            // }

            // 🌐 Build Request
            const requestOptions: RequestInit = {
                method: methodType,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'If-None-Match': '' // 👈 Add this
                },
                signal: controller.signal,
                cache: 'no-store' as RequestCache, // 👈 CRITICAL: Force no caching
            };

            if (['POST', 'PUT'].includes(methodType) && payload) {
                requestOptions.body = JSON.stringify(payload);
            }

            // 🧭 Construct Full URL
            const fullUrl = new URL(finalUrl, config.app.apiUrl).toString(); // Use finalUrl here

            const response = await fetch(fullUrl, requestOptions);

            // ❗ Non-OK response
            if (!response.ok) {
                let errorText = '';
                let dataDetail = null;
                try {
                    const errJson = await response.json();
                    errorText = errJson.message || response.statusText;
                    dataDetail = errJson.data || null
                } catch {
                    errorText = await response.text();
                    dataDetail = errorText;
                }

                return {
                    code: response.status as ResponseCode,
                    message: errorText || 'Request failed',
                    data: dataDetail,
                };
            }

            // ✅ Parse JSON safely
            const data = await response.json().catch(() => null);

            const normalized: ApiResponse<T> = {
                code: data?.status ?? ResponseCode.SUCCESS,
                message: data?.message ?? 'success',
                data: data?.data ?? null,
            };

            return normalized;
        } catch (error: any) {
            // 🧱 Error categorization
            let message = 'Unexpected error';
            if (error.name === 'AbortError') message = 'Request timeout';
            else if (error.code === 'ECONNREFUSED') message = 'Backend unreachable';
            else if (typeof error.message === 'string') message = error.message;

            return {
                code: ResponseCode.SERVER_ERROR,
                message,
                data: null,
            };
        } finally {
            clearTimeout(timeout);
        }
    }
}
