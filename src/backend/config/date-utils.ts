import { DateTime } from 'luxon';
import { config } from './environment';

const DEFAULT_TZ = config.app.timezone;
const DEFAULT_FMT = 'dd/MM/yyyy HH:mm:ss';

export class DateUtils {
    static formatToString(date: string | Date, fmt = DEFAULT_FMT, tz = DEFAULT_TZ): string {
        return DateTime.fromJSDate(date instanceof Date ? date : new Date(date))
            .setZone(tz)
            .toFormat(fmt);
    }

    static nowFormat(fmt = DEFAULT_FMT, tz = DEFAULT_TZ): string {
        return DateTime.now().setZone(tz).toFormat(fmt);
    }

    static nowJSDate(tz = DEFAULT_TZ): Date {
        return DateTime.now().setZone(tz).toJSDate();
    }

    static compareDate(operator1: Date | string, operator2: Date | string, operand: '>' | '<' | '>=' | '<=' | '!==' | '===' = '===', 
        modifOperator: 'operator1' | 'operator2' | 'both' | null = null,
        targetModify: 'days' | 'months' | 'years' | 'hours' | 'minutes' | 'seconds' | null = null,
        signModif: 'plus' | 'minus' | null = null, modifyNumber: number | null = null): boolean {
        const tempOperator1 = DateTime.fromJSDate(operator1 instanceof Date ? operator1 : new Date(operator1)).setZone(DEFAULT_TZ);
        const tempOperator2 = DateTime.fromJSDate(operator2 instanceof Date ? operator2 : new Date(operator2)).setZone(DEFAULT_TZ);
        const modifyOperator1 = modifOperator && ['operator1', 'both'].includes(modifOperator) && targetModify && signModif && modifyNumber ? 
        DateUtils.modifyDate(tempOperator1, targetModify, signModif, modifyNumber) : tempOperator1;
        const modifyOperator2 = modifOperator && ['operator2', 'both'].includes(modifOperator) && targetModify && signModif && modifyNumber ? 
        DateUtils.modifyDate(tempOperator2, targetModify, signModif, modifyNumber) : tempOperator2;
        switch (operand) {
            case '>':
                return modifyOperator1 > modifyOperator2;
            case '<':
                return modifyOperator1 < modifyOperator2;
            case '>=':
                return modifyOperator1 >= modifyOperator2;
            case '<=':
                return modifyOperator1 <= modifyOperator2;
            case '!==':
                return !modifyOperator1.equals(modifyOperator2);
            default:
                return modifyOperator1.equals(modifyOperator2);
        }
    }

    private static modifyDate(date: DateTime, targetModify: 'days' | 'months' | 'years' | 'hours' | 'minutes' | 'seconds' | null = null,
        signModif: 'plus' | 'minus', modifyNumber: number): DateTime {
        const modifyField = targetModify || 'seconds';

        const modification = { [modifyField]: modifyNumber };

        return signModif === 'plus'
            ? date.plus(modification)
            : date.minus(modification);
    }
}