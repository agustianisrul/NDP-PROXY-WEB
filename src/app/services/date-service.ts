import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({
    providedIn: 'root',
})
export class DateService {
    private readonly DEFAULT_TZ = 'Asia/Jakarta';
    private readonly DEFAULT_FMT = 'dd/MM/yyyy HH:mm:ss';

    now(fmt: string = this.DEFAULT_FMT, tz: string = this.DEFAULT_TZ): string {
        return DateTime.now().setZone(tz).toFormat(fmt);
    }

    format(date: string | Date, fmt: string = this.DEFAULT_FMT, tz: string = this.DEFAULT_TZ): string {
        return DateTime.fromJSDate(date instanceof Date ? date : new Date(date))
            .setZone(tz)
            .toFormat(fmt);
    }
}
