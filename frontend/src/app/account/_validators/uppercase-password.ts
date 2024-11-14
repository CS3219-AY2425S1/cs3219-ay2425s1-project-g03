import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const UPPERCASE_PASSWORD_REGEX = /^(?=.*[A-Z])/;

export const PASSWORD_UPPERCASE = 'passwordUppercase';

export function uppercasePasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const missingUppercase = !UPPERCASE_PASSWORD_REGEX.test(control.value);
        return missingUppercase ? { [PASSWORD_UPPERCASE]: true } : null;
    };
}
