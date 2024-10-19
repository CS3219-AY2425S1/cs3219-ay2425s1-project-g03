import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const SPECIAL_PASSWORD_REGEX = /^(?=.*[!"#$%&'()*+,-.:;<=>?@\\/\\[\]^_`{|}~])/;

export const PASSWORD_SPECIAL = 'passwordSpecial';

export function specialPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const missingSpecial = !SPECIAL_PASSWORD_REGEX.test(control.value)
        return missingSpecial ? { [PASSWORD_SPECIAL]: true } : null;
    };
}