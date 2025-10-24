import { Request } from 'express';
import { base64url, SignJWT } from 'jose';
import { config } from '../config/environment';

export class TokenUtils {
    public static getHeaderRawValue(cookieHeader: string | undefined, sessionName: string): string | null {
        if (!cookieHeader) return null;

        // Split and parse cookies safely
        const cookies: Record<string, string> = Object.fromEntries(
            cookieHeader.split(';').map((c: string) => {
                const [key, value] = c.trim().split('=');
                return [key, decodeURIComponent(value ?? '')];
            })
        );

        // Return the requested cookie value or null if missing
        return cookies[sessionName] ?? null;
    }

    public static async generateToken(userInfo: any): Promise<string> {
        const secretKey = base64url.decode(config.cookie.secret);

        // const payload: any = {
        //     ...(req.session as any).user,
        //     ip: req.ip,
        //     ua: req.headers['user-agent'],
        // };
        return await new SignJWT(userInfo)
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime('10s')
            // .setExpirationTime(`${config.cookie.maxAge / 1000}s`) // convert ms → s
            .sign(secretKey);
    }

    public static generateToken2(req: Request): Promise<string> {
        const secretKeyBase64 = base64url.decode(config.cookie.secret);
        const userInfo: any = req.session;
        return new SignJWT(userInfo)
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime(config.cookie.maxAge)
            .sign(secretKeyBase64);
    }
}
