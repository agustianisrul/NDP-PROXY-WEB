import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { UserDetail } from '../../../model/custom-entity/UserDetail';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-registration',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
    templateUrl: './registration.html',
    styleUrl: './registration.css',
})
export class Registration {
    errorRegistration: any = { error: false, message: 'Error Message', title: 'Error!' };
    successRegistration: any = { success: false, message: 'Registration Success', title: 'Success!' };
    loading = false;
    registerForm = new FormGroup({
        fullname: new FormControl('', [Validators.required]),
        mobile: new FormControl('', [Validators.minLength(11), Validators.maxLength(12)]),
        email: new FormControl('', [Validators.email]),
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        status: new FormControl(true),
        idgroup: new FormControl(null),
        isAdmin: new FormControl(true),
    });

    // Helper getter untuk akses kontrol form di template
    get f() {
        return this.registerForm.controls;
    }

    constructor(private readonly router: Router, private readonly requestService: RequestService) {}

    onCancel() {
        this.registerForm.reset();
        this.router.navigate(['/login']);
    }

    onSubmit() {
        if (this.registerForm.invalid) return;
        this.loading = true;

        this.requestService.postBackend<UserDetail>('/v2/user/register-user-admin', this.registerForm.value).subscribe((res: any) => {
            this.loading = false;
            if (res.code === 20000) {
                this.successRegistration = { success: true, message: `Registration Success and ${res.message}`, title: 'Success Register!' };
            } else {
                this.errorRegistration = { error: true, message: res.message, title: 'Error Registration!' };
            }
        });
    }

    async cancelError() {
        this.errorRegistration = { error: false, message: 'Error Message', title: 'Error!' };
    }

    async cancelSuccess() {
        this.successRegistration = { success: false, message: 'Registration Success', title: 'Success!' };
        this.router.navigate(['/login']);
    }
}
