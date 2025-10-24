import { Response } from 'express';
import { ApiResponse, ApiResponseData } from '../../model/others/ApiResponse';
import { ResponseCode } from './responseCode';

export class ResponseHelper {
    private static sendResponse<T>(res: Response, code: ResponseCode, message: unknown, data: ApiResponseData<T> = null): void {
        const response: ApiResponse<T> = { code, message, data };
        res.status(code).json(response);
    }

    static success<T>(res: Response, data: ApiResponseData<T> = null, message: unknown = 'success'): void {
        this.sendResponse(res, ResponseCode.SUCCESS, message, data);
    }

    static error<T>(res: Response, message: unknown, code: ResponseCode = ResponseCode.SERVER_ERROR, data: ApiResponseData<T> = null): void {
        const tempMessage: string = ResponseHelper.convertMessageToString(message);
        this.sendResponse(res, code, tempMessage, data);
    }

    static custom<T>(res: Response, code: ResponseCode, message: unknown, data: ApiResponseData<T> = null): void {
        this.sendResponse(res, code, message, data);
    }

    static customResponse<T>(res: Response, response: ApiResponse<T>): void {
        res.status(response.code).json(response);
    }

    private static convertMessageToString(message: unknown): string {
        if (!message) return '';
        if (message instanceof Error) {
            // ✅ Include both name and message
            return `${message.name}: ${message.message}`;
        }
        if (typeof message === 'string') {
            return message.trim() || 'Unknown error';
        }
        try {
            // ✅ Pretty-print JSON safely and avoid circular refs
            return JSON.stringify(message, Object.getOwnPropertyNames(message), 2);
        } catch {
            // fallback to inspect-style string if JSON fails
            return Object.prototype.toString.call(message);
        }
    }
}
