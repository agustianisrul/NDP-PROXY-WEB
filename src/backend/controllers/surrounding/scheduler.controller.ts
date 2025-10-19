import { Request, Response } from 'express';
import { config } from '../../config/environment';
import { ResponseHelper } from '../../utils/ResponseHelper';
import { TokenUtils } from '../../utils/TokenUtils';

export class SchedulerController {
    public static async getAllScheduler(req: Request, res: Response) {
        try {
            // 🔐 Generate JWT (HS256)
            const token = await TokenUtils.generateToken(req);
            if (!token) {
                return ResponseHelper.error(res, 'Unauthorized: Failed to generate token');
            }

            // 🌐 Call external API securely
            const response = await fetch(`${config.app.apiUrl}/ndp/proxy/scheduler/getall`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // 📦 Validate response
            if (!response.ok) {
                const errorText = await response.text();
                return ResponseHelper.custom(res, response.status, errorText);
            }

            // ✅ Parse JSON safely
            const data = await response.json();

            const dataParsing = {
                code: data.status ?? 200,
                message: data.message ?? 'OK',
                data: data.data ?? [],
            };

            return ResponseHelper.success(res, dataParsing);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message || 'Internal server error');
        }
    }
}
