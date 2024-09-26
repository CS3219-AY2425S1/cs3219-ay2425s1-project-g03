import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const STRONG_PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})(?=.*[!"#$%&'()*+,-.:;<=>?@\\/\\[\]^_`{|}~])/;

export const PASSWORD_WEAK = 'passwordWeak';

export function weakPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const weak = !STRONG_PASSWORD_REGEX.test(control.value);
        return weak ? { [PASSWORD_WEAK]: true } : null;
    };
}
