import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LOWERCASE_PASSWORD_REGEX } from './lowercase-password';
import { UPPERCASE_PASSWORD_REGEX } from './uppercase-password';
import { NUMERIC_PASSWORD_REGEX } from './numeric-password';
import { SPECIAL_PASSWORD_REGEX } from './special-password';
import { SHORT_PASSWORD_REGEX } from './short-password';

export const PASSWORD_WEAK = 'passwordWeak';

export function weakPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const weak = !(
            LOWERCASE_PASSWORD_REGEX.test(control.value) &&
            UPPERCASE_PASSWORD_REGEX.test(control.value) &&
            NUMERIC_PASSWORD_REGEX.test(control.value) &&
            SPECIAL_PASSWORD_REGEX.test(control.value) &&
            SHORT_PASSWORD_REGEX.test(control.value)
        );
        return weak ? { [PASSWORD_WEAK]: true } : null;
    };
}
