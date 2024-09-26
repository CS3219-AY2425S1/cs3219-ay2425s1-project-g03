import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_REGEX = /^[a-zA-Z0-9!"#$%&'()*+,-.:;<=>?@\\/\\[\]^_`{|}~]+$/;

export const PASSWORD_INVALID = 'passwordInvalid';

export function invalidPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const weak = !PASSWORD_REGEX.test(control.value);
        return weak ? { [PASSWORD_INVALID]: true } : null;
    };
}
