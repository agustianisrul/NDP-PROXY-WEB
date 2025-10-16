import { Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export class ResponseHelper {
    static send<T>(res: Response, responseObject: ApiResponse<T>): Promise<void> {
        let statusCode: number = Math.floor(responseObject.code / 100); // Pastikan status valid
        res.setHeader('Content-Type', 'application/json'); // Pastikan response JSON
        if (statusCode > 200 && statusCode < 300) {
            statusCode = 200;
        }
        res.status(statusCode).json(responseObject);
        return Promise.resolve(); // <--- tambahkan ini
    }
    static sendWithCookies<T>(
        res: Response,
        responseObject: ApiResponse<T>,
        cookies: { name: string; value: string; options?: any }[]
    ): Promise<void> {
        const statusCode = Math.floor(responseObject.code / 100); // Pastikan status valid
        res.setHeader('Content-Type', 'application/json'); // Pastikan response JSON
        // Set semua cookie yang diberikan
        cookies.forEach((cookie) => {
            try {
                res.cookie(cookie.name, cookie.value, cookie.options || {});
            } catch (error) {
                console.error('Error : ', error);
            }
        });
        res.status(statusCode).json(responseObject);
        return Promise.resolve(); // <--- tambahkan ini
    }

    static sendClearCookies<T>(
        res: Response,
        responseObject: ApiResponse<T>,
        cookies: { name: string; value: string; options?: any }[]
    ): Promise<void> {
        const statusCode = Math.floor(responseObject.code / 100); // Pastikan status valid
        res.setHeader('Content-Type', 'application/json'); // Pastikan response JSON
        // Set semua cookie yang diberikan
        res.clearCookie(cookies[0].name);
        res.status(statusCode).json(responseObject);
        return Promise.resolve(); // <--- tambahkan ini
    }
}
