export interface PasswordPolicy {
    minLength?: number;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
    allowedSpecialChars?: string;
}

export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
}
