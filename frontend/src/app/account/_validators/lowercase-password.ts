import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const LOWERCASE_PASSWORD_REGEX = /^(?=.*[a-z])/;

export const PASSWORD_LOWERCASE = 'passwordLowercase';

export function lowercasePasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const missingLowercase = !LOWERCASE_PASSWORD_REGEX.test(control.value)
        return missingLowercase ? { [PASSWORD_LOWERCASE]: true } : null;
    };
}