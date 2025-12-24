import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { OnlyBrowserDirective } from '../../directives/only-browser.directive';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
    standalone: true,
    selector: 'app-login',
    imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, OnlyBrowserDirective],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    authService = inject(AuthenticationService);
    submitted = false;
    errorMessage: any = { error: false, severity: 'info', message: 'ini test', icon: 'pi pi-times' };
    loading = false;
    loginForm = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });

    onSubmit() {
        this.submitted = true;
        if (this.loginForm.invalid) return;
        const { username, password } = this.loginForm.value;

        this.authService.login(username!, password!).subscribe({
            error: (err: HttpErrorResponse) => {
                const message = err.error.message || 'Invalid username or password';
                this.loginForm.setErrors({ invalidLogin: true });
                this.errorMessage = { error: true, severity: 'error', message: `${message}`, icon: 'pi pi-times' };
            },
        });
    }

    // Helper getter untuk akses kontrol form di template
    get f() {
        return this.loginForm.controls;
    }

    _changeError() {
        this.errorMessage = { error: false, severity: 'info', message: '', icon: 'pi pi-send' };
    }
}
