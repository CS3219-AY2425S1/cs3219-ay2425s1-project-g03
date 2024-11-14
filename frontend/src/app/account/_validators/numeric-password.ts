import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const NUMERIC_PASSWORD_REGEX = /^(?=.*[0-9])/;

export const PASSWORD_NUMERIC = 'passwordNumeric';

export function numericPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const missingNumeric = !NUMERIC_PASSWORD_REGEX.test(control.value);
        return missingNumeric ? { [PASSWORD_NUMERIC]: true } : null;
    };
}
