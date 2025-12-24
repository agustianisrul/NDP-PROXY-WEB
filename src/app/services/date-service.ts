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

    currentDate(tz: string = this.DEFAULT_TZ): Date {
        return DateTime.now().setZone(tz).toJSDate();
    }

    currentDateStartDay(date: string | Date, fmt: string = this.DEFAULT_FMT, tz: string = this.DEFAULT_TZ): String {
        return DateTime.fromJSDate(date instanceof Date ? date : new Date(date)).startOf('day').setZone(tz).toFormat(fmt);
    }

    currentDateEndDay(date: string | Date, fmt: string = this.DEFAULT_FMT, tz: string = this.DEFAULT_TZ): String {
        return DateTime.fromJSDate(date instanceof Date ? date : new Date(date)).setZone(tz).endOf('day').toFormat(fmt);
    }

    minusDaysDate(date: Date | string, minusDays: number, tz: string = this.DEFAULT_TZ): Date {
        const dateTime = DateTime.fromJSDate(
            date instanceof Date ? date : new Date(date)
        ).setZone(tz);
        
        return dateTime.minus({ days: minusDays }).startOf('day').toJSDate();
    }

    // Get date range with time set to start of day (00:00:00) and end of day (23:59:59)
    getDateRangeWithTime(minusDays: number = 7, tz: string = this.DEFAULT_TZ): [Date, Date] {
        const endDate = DateTime.now().setZone(tz).endOf('day'); // 23:59:59
        const startDate = endDate.minus({ days: minusDays }).startOf('day'); // 00:00:00
        
        return [startDate.toJSDate(), endDate.toJSDate()];
    }

    // Alternative method if you want to specify exact start and end times
    getDateRangeWithCustomTime(
        minusDays: number = 7, 
        startTime: string = '00:00:00', 
        endTime: string = '23:59:59',
        tz: string = this.DEFAULT_TZ
    ): [Date, Date] {
        const endDate = DateTime.now().setZone(tz);
        const startDate = endDate.minus({ days: minusDays });
        
        // Combine date with time
        const startDateTime = DateTime.fromISO(
            `${startDate.toISODate()}T${startTime}`
        ).setZone(tz);
        
        const endDateTime = DateTime.fromISO(
            `${endDate.toISODate()}T${endTime}`
        ).setZone(tz);
        
        return [startDateTime.toJSDate(), endDateTime.toJSDate()];
    }

    // For PrimeNG calendar compatibility with full day range
    getDateRangeForCalendar(minusDays: number = 7, tz: string = this.DEFAULT_TZ): Date[] {
        const [startDate, endDate] = this.getDateRangeWithTime(minusDays, tz);
        return [startDate, endDate];
    }

    // Method to set time for a specific date
    setTimeForDate(date: Date, time: string, tz: string = this.DEFAULT_TZ): Date {
        const dateTime = DateTime.fromJSDate(date).setZone(tz);
        const [hours, minutes, seconds] = time.split(':').map(Number);
        
        return dateTime.set({ 
            hour: hours, 
            minute: minutes, 
            second: seconds 
        }).toJSDate();
    }

    // Method to get start of day (00:00:00) for any date
    getStartOfDay(date: Date | string, tz: string = this.DEFAULT_TZ): Date {
        const dateTime = DateTime.fromJSDate(
            date instanceof Date ? date : new Date(date)
        ).setZone(tz);
        
        return dateTime.startOf('day').toJSDate();
    }

    // Method to get end of day (23:59:59) for any date
    getEndOfDay(date: Date | string, tz: string = this.DEFAULT_TZ): Date {
        const dateTime = DateTime.fromJSDate(
            date instanceof Date ? date : new Date(date)
        ).setZone(tz);
        
        return dateTime.endOf('day').toJSDate();
    }
}
