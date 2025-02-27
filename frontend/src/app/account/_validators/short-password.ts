import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const SHORT_PASSWORD_REGEX = /^(?=.{8,})/;

export const PASSWORD_SHORT = 'passwordShort';

export function shortPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const short = !SHORT_PASSWORD_REGEX.test(control.value);
        return short ? { [PASSWORD_SHORT]: true } : null;
    };
}
