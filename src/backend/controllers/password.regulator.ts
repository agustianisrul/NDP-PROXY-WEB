import { Condition } from "../../model/others/ConditionQuery";
import { GenericRepository } from "../repositories/generic.repository";
import { ResponseHelper } from "../utils/ResponseHelper";

const genericRepository = new GenericRepository();

export class PasswordRegulationService {
    private async getActiveRegulation(): Promise<Record<string, any> | null> {
        const whereCondition: Condition<any>[] = [
            { column: 'keygroup', operator: '=', value: 'common-config' },
            { column: 'keyname', operator: 'like', value: 'password%' }
        ];
        const resultQueryList = await genericRepository.select<Record<string, any>>('tm_config_main', [], whereCondition);
        if (resultQueryList.length === 0) return null;

        return resultQueryList.reduce((acc, row) => {
            acc[row["keyname"]] = row["value"];
            return acc;
        }, {} as Record<string, any>);
    }

    async validatePassword(password: string) {
        const regulation = await this.getActiveRegulation();
        const errors = [];

        // Check minimum length
        if (password.length < regulation?.["password_min_length"]) {
            errors.push(`Password must be at least ${regulation?.["password_min_length"]} characters long`);
        }

        // Check uppercase requirement
        if (regulation?.["password_require_uppercase"] && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        // Check lowercase requirement
        if (regulation?.["password_require_lowercase"] && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        // Check numbers requirement
        if (regulation?.["password_require_numbers"] && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        // Check special characters requirement
        if (regulation?.["password_require_special_chars"] && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
