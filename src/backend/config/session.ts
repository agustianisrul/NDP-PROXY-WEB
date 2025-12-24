import cookieSession from 'cookie-session';
import { config } from './environment';

export default cookieSession({
    name: config.cookie.name,
    keys: [config.cookie.secret],
    maxAge: config.cookie.maxAge,
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
});
