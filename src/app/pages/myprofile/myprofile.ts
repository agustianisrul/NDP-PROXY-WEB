import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { OnlyBrowserDirective } from '../../directives/only-browser.directive';
import { RequestService } from '../../services/request-service';
import { ParentComponent } from '../../components/parent-component';
import { ResponseCode } from '../../../backend/utils/responseCode';

@Component({
    standalone: true,
    selector: 'app-myprofile',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        OnlyBrowserDirective,
        InputTextModule,
        CheckboxModule,
        PasswordModule,
        BreadcrumbModule,
    ],
    templateUrl: './myprofile.html',
    styleUrl: './myprofile.css',
})
export class Myprofile extends ParentComponent implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    profileForm!: FormGroup;
    formSubmitted = false;

    constructor(private readonly requestService: RequestService) {
        super();

        this.breaditems = [{ label: 'Profile' }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        const currentUser = this.currentUser;
        const currentGroup = this.currentGroup;

        this.profileForm = new FormGroup({
            username: new FormControl({ value: currentUser?.username, disabled: true }),
            fullname: new FormControl(currentUser?.fullname),
            mobile: new FormControl(currentUser?.mobile),
            email: new FormControl(currentUser?.email),
            groupname: new FormControl({ value: currentGroup?.groupname, disabled: true }),
            changepassword: new FormControl(false),
            password: new FormControl(null),
            newPassword: new FormControl(null),
        });
    }

    // ngOnInit(): void {
    //     this.profileForm.get('changepassword')?.valueChanges.subscribe((changePassword: boolean) => {
    //         const passwordControl = this.profileForm.get('password');
    //         const newPasswordControl = this.profileForm.get('newPassword');

    //         if (changePassword) {
    //             passwordControl?.setValidators([Validators.required]);
    //             newPasswordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    //         } else {
    //             passwordControl?.clearValidators();
    //             newPasswordControl?.clearValidators();
    //         }

    //         passwordControl?.updateValueAndValidity();
    //         newPasswordControl?.updateValueAndValidity();
    //     });
    // }

    ngOnInit(): void {
        // Subscribe to changepassword value changes
        this.profileForm.get('changepassword')?.valueChanges.subscribe((changePassword: boolean) => {
            this.updatePasswordValidators(changePassword);
        });

        // Also listen to password changes to validate newPassword
        this.profileForm.get('password')?.valueChanges.subscribe(() => {
            this.validateNewPassword();
        });

        this.profileForm.get('newPassword')?.valueChanges.subscribe(() => {
            this.validateNewPassword();
        });
    }

    private updatePasswordValidators(changePassword: boolean): void {
        const passwordControl = this.profileForm.get('password');
        const newPasswordControl = this.profileForm.get('newPassword');

        if (changePassword) {
            // Add required validators
            passwordControl?.setValidators([Validators.required]);
            newPasswordControl?.setValidators([Validators.required]);
        } else {
            // Remove validators
            passwordControl?.clearValidators();
            newPasswordControl?.clearValidators();

            // Clear the values and errors when checkbox is unchecked
            passwordControl?.setValue('');
            newPasswordControl?.setValue('');
            passwordControl?.setErrors(null);
            newPasswordControl?.setErrors(null);
        }

        // Update validity
        passwordControl?.updateValueAndValidity();
        newPasswordControl?.updateValueAndValidity();
    }

    private validateNewPassword(): void {
        const password = this.profileForm.get('password')?.value;
        const newPassword = this.profileForm.get('newPassword')?.value;
        const newPasswordControl = this.profileForm.get('newPassword');

        // Only validate if both fields have values and changepassword is true
        if (this.profileForm.get('changepassword')?.value && password && newPassword) {
            if (password !== newPassword) {
                newPasswordControl?.setErrors({ sameAsPassword: true });
            } else {
                // Remove sameAsPassword error if it exists
                if (newPasswordControl?.hasError('sameAsPassword')) {
                    const errors = { ...newPasswordControl.errors };
                    delete errors['sameAsPassword'];
                    newPasswordControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
                }
            }
        }
    }

    get f() {
        return this.profileForm?.controls;
    }

    isInvalid(controlName: string) {
        const control = this.profileForm.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }

    onSaveProfile() {
        console.log('Saving profile...');
        // const changePassword = this.profileForm.get('changepassword')?.value;
        // if (changePassword) {
        //     const password = this.profileForm.get('password')?.value;
        //     const newPassword = this.profileForm.get('newPassword')?.value;
        //     const passwordControl = this.profileForm.get('password');
        //     const newPasswordControl = this.profileForm.get('newPassword');
        //     console.log('masuk change password', changePassword, password, newPassword);

        //     if (!password || !newPassword) {
        //         console.log('password atau newPassword kosong');
        //         if (!password) {
        //             passwordControl?.setErrors({ required: true });
        //         }
        //         if (!newPassword) {
        //             newPasswordControl?.setErrors({ required: true });
        //         }
        //         return;
        //     }
        // }
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }
        this.formSubmitted = true;
        const payloadSubmited: any = this.profileForm.value;
        if (payloadSubmited.changepassword && (!payloadSubmited.password || !payloadSubmited.newPassword)) {
            return; // Password change requested but fields are empty
        }
        this.formSubmitted = true;
        this.requestService.postBackend('/v2/user/edit-profile-user', payloadSubmited).subscribe({
            next: (response: any) => {
                if (response.code === ResponseCode.SUCCESS) {
                    this.formSubmitted = false;
                    this.requestService.displayMessageService('info', 'Information', 'Your profile is being updated');
                }
            }
        });
    }
}
