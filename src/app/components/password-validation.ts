import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PasswordPolicy, PasswordValidationResult } from '../../model/others/PasswordPolicy';

export function createPasswordValidator(policy: PasswordPolicy): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.value;
        if (!password) return null; // skip empty, use required separately

        const result = validatePassword(password, policy);
        return result.valid ? null : { passwordPolicy: result.errors };
    };
}

function validatePassword(password: string, policy: PasswordPolicy): PasswordValidationResult {
    const errors: string[] = [];

    if (policy.minLength && password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireNumber && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChar) {
        const safeSpecials = policy.allowedSpecialChars || '!@#$%^&*()_+[]{}|;:,.?~-';

        // ✅ Use a regex literal for static pattern
        const pattern = /[-[\]{}()*+?.,^$|#\s]/g;

        // ✅ Use String.raw to avoid escaping backslashes
        const escaped = safeSpecials.replaceAll(pattern, String.raw`\$&`);

        // ✅ Dynamic regex stays via constructor (pattern is variable)
        const regex = new RegExp(`[${escaped}]`);

        if (!regex.test(password)) {
            errors.push('Password must contain at least one special character');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
