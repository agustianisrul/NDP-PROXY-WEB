import { DateTime } from 'luxon';
import { config } from './environment';

const DEFAULT_TZ = config.app.timezone;
const DEFAULT_FMT = 'dd/MM/yyyy HH:mm:ss';

export const formatDate = (date: string | Date, fmt = DEFAULT_FMT, tz = DEFAULT_TZ) =>
    DateTime.fromJSDate(date instanceof Date ? date : new Date(date))
        .setZone(tz)
        .toFormat(fmt);

export const nowFormat = (fmt = DEFAULT_FMT, tz = DEFAULT_TZ) => DateTime.now().setZone(tz).toFormat(fmt);

export const nowJSDate = (tz = DEFAULT_TZ) => DateTime.now().setZone(tz).toJSDate();
