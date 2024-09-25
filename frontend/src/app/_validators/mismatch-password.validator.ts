import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MISMATCH = 'passwordMismatch';

export function mismatchPasswordValidator(firstPasswordField: string, secondPasswordField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const password = formGroup.get(firstPasswordField)?.value;
        const confirmPassword = formGroup.get(secondPasswordField)?.value;
        return password !== confirmPassword ? { [PASSWORD_MISMATCH]: true } : null;
    };
}
