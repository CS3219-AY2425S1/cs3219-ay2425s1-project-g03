import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

export const PASSWORD_WEAK = 'passwordWeak';

export function weakPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const weak = !PASSWORD_REGEX.test(control.value);
        return weak ? { [PASSWORD_WEAK]: true } : null;
    };
}
