import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { OnlyBrowserDirective } from '../../directives/only-browser.directive';
import { UserDetail } from '../../../model/custom-entity/UserDetail';
import { RequestService } from '../../services/request-service';
import { SelectModule } from 'primeng/select';

@Component({
    standalone: true,
    selector: 'app-registration',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, OnlyBrowserDirective, SelectModule],
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
        envi_user: new FormControl('', [Validators.required]),
        status: new FormControl(true),
        idgroup: new FormControl(null),
        isAdmin: new FormControl(true),
    });
    environmentOptions = [
        { label: 'Production', value: 'prod' },
        { label: 'Development', value: 'non-prod' },
    ];

    // Helper getter untuk akses kontrol form di template
    get f() {
        return this.registerForm.controls;
    }

    constructor(private readonly router: Router, private readonly requestService: RequestService) { }

    onCancel() {
        this.registerForm.reset();
        this.router.navigate(['/login']);
    }

    onSubmit() {
        if (this.registerForm.invalid) return;
        this.loading = true;

        this.requestService.postBackend<UserDetail>('/v2/user/register-user-admin', this.registerForm.value).subscribe({
            next: (res: any) => {
                if (res.code === 200) {
                    this.router.navigate(['/login']);
                }
                this.loading = false;
            },
            error: (err: any) => {
                this.loading = false;
            },
        })
    }

    // async cancelError() {
    //     this.errorRegistration = { error: false, message: 'Error Message', title: 'Error!' };
    // }

    // async cancelSuccess() {
    //     this.successRegistration = { success: false, message: 'Registration Success', title: 'Success!' };
    //     this.router.navigate(['/login']);
    // }
}
