import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export const USERNAME_INVALID = 'usernameInvalid';

export function invalidUsernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const invalid = !USERNAME_REGEX.test(control.value);
        return invalid ? { [USERNAME_INVALID]: true } : null;
    };
}
