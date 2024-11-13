import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { PASSWORD_LOWERCASE } from '../app/account/_validators/lowercase-password';
import { PASSWORD_UPPERCASE } from '../app/account/_validators/uppercase-password';
import { PASSWORD_NUMERIC } from '../app/account/_validators/numeric-password';
import { PASSWORD_SPECIAL } from '../app/account/_validators/special-password';
import { PASSWORD_SHORT } from '../app/account/_validators/short-password';
import { PASSWORD_WEAK } from '../app/account/_validators/weak-password.validator';
import { PASSWORD_MISMATCH } from '../app/account/_validators/mismatch-password.validator';
import { USERNAME_INVALID } from '../app/account/_validators/invalid-username.validator';
import { PASSWORD_INVALID } from '../app/account/_validators/invalid-password.validator';

@Injectable({
    providedIn: 'root',
})

// This service is used to validate the form fields in the register and profile components
export class FormUtilsService {
    get isUsernameInvalid(): (form: FormGroup) => boolean {
        return (form: FormGroup) => {
            const usernameControl = form.controls['username'];
            return usernameControl.dirty && usernameControl.hasError(USERNAME_INVALID);
        };
    }

    get isEmailInvalid(): (form: FormGroup) => boolean {
        return (form: FormGroup) => {
            const emailControl = form.controls['email'];
            return emailControl.dirty && emailControl.invalid;
        };
    }

    get passwordControl(): (form: FormGroup) => AbstractControl {
        return (form: FormGroup) => form.controls['password'];
    }

    get isPasswordControlDirty(): (form: FormGroup) => boolean {
        return (form: FormGroup) => this.passwordControl(form).dirty;
    }

    get passwordHasNoLowercase(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).pristine || this.passwordControl(form).hasError(PASSWORD_LOWERCASE);
    }

    get passwordHasNoUppercase(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).pristine || this.passwordControl(form).hasError(PASSWORD_UPPERCASE);
    }

    get passwordHasNoNumeric(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).pristine || this.passwordControl(form).hasError(PASSWORD_NUMERIC);
    }

    get passwordHasNoSpecial(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).pristine || this.passwordControl(form).hasError(PASSWORD_SPECIAL);
    }

    get isPasswordShort(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).pristine || this.passwordControl(form).hasError(PASSWORD_SHORT);
    }

    get isPasswordWeak(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).dirty && this.passwordControl(form).hasError(PASSWORD_WEAK);
    }

    get isPasswordStrong(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).dirty && !this.passwordControl(form).hasError(PASSWORD_WEAK);
    }

    get isPasswordInvalid(): (form: FormGroup) => boolean {
        return (form: FormGroup) =>
            this.passwordControl(form).dirty && this.passwordControl(form).hasError(PASSWORD_INVALID);
    }

    get hasPasswordMismatch(): (form: FormGroup) => boolean {
        return (form: FormGroup) => {
            const confirmPasswordControl = form.controls['confirmPassword'];
            return this.passwordControl(form).valid && confirmPasswordControl.dirty && form.hasError(PASSWORD_MISMATCH);
        };
    }
}
