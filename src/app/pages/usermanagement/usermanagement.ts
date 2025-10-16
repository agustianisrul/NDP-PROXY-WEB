import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { UserDetail } from '../../../model/custom-entity/UserDetail';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-usermanagement',
    imports: [
        CommonModule,
        TooltipModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        TextareaModule,
        TableModule,
        BreadcrumbModule,
        MessageModule,
        ChipModule,
        TagModule,
        ToggleSwitchModule,
        DividerModule,
        PasswordModule,
        SelectModule,
        DialogModule,
    ],
    templateUrl: './usermanagement.html',
    styleUrl: './usermanagement.css',
})
export class Usermanagement implements OnInit {
    currentUrl: string = '';
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;
    token: string | null | undefined = undefined;
    userInfo: any;
    loading: boolean = false;
    cols!: Column[];
    rows = 50;
    idUserOld: string = '';
    users!: UserDetail[];
    totalUsers: number = 0;
    allUser!: UserDetail[];
    globalFilter: string = '';
    groups: any[] = [];
    selectedUser!: UserDetail;
    showDetailForm: any = { show: false, action: 'add' };
    showDetailDelete: boolean = false;
    showErrorPage: any = { show: false, message: 'undefined' };
    errorMessage: any = { error: false, severity: 'error', message: 'ini test', icon: 'pi pi-exclamation-circle' };
    aclMenublob: any[] = ['up', 'rd', 'dl', 'cr'];
    userForm = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        fullname: new FormControl('', [Validators.required]),
        group: new FormControl(''),
        email: new FormControl(''),
        mobile: new FormControl(''),
        status: new FormControl(true),
        isAdmin: new FormControl(false),
    });

    constructor(private readonly router: Router, private readonly requestService: RequestService) {}

    async ngOnInit(): Promise<void> {
        this.currentUrl = this.router.url;
        this.cols = [
            { field: 'username', header: 'User' },
            { field: 'fullname', header: 'Fullname' },
            { field: 'group.groupname', header: 'Group' },
            { field: 'email', header: 'Email' },
            { field: 'status', header: 'Status' },
        ];
        this.breaditems = [{ label: 'Management' }, { label: 'Users' }];
        this.home = { icon: 'pi pi-home', routerLink: '/' };
        //##########################################################
        // await this._refreshACLMenu();
        if (this.aclMenublob.includes('rd')) {
            await this._refreshGroupData();
            await this._refreshListData();
        }
    }
    get f() {
        return this.userForm.controls;
    }
    _changeError() {
        // this.errorMessage={error:false, severity:"info", message:"", icon:"pi pi-send"};
    }
    onRowSelect(event: any) {
        console.log('Selected User:', event.data);
        const dataObj = event.data;
        this.idUserOld = dataObj.iduser;
        const groupObj: any = this.groups.find((g) => g.idgroup === dataObj.idgroup) || {};
        const passwordControl = this.userForm.get('password');
        if (passwordControl) {
            passwordControl.clearValidators(); // hapus semua validator
            passwordControl.updateValueAndValidity(); // refresh validasi
        }

        this.userForm.patchValue({
            username: dataObj.username,
            password: null,
            fullname: dataObj.fullname,
            email: dataObj.email,
            group: dataObj.idgroup,
            status: dataObj.status,
        });
        this.showDetailForm = { show: true, action: 'edit' };
    }

    async _refreshListData(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/user/list-user').subscribe({
            next: (data: any) => {
                this.users = data.data;
                this.allUser = this.users;
                this.totalUsers = this.allUser.length;
                this.loading = false;
            },
            error: () => {
                this.users = [];
                this.totalUsers = this.users.length;
                this.loading = false;
            },
        });
    }

    async _refreshGroupData(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/group/list-group').subscribe({
            next: (data: any) => {
                this.groups = data.data;
                this.loading = false;
            },
            error: () => {
                this.groups = [];
                this.loading = false;
            },
        });
    }

    onGlobalSearch() {
        console.log('Global filter : ', this.globalFilter);
        const term = this.globalFilter.trim().toLowerCase();
        if (term === '') {
            this.users = [...this.allUser];
        } else {
            this.users = this.allUser.filter((item) =>
                [item.username, item.fullname, item.group.groupname].some((field) => field?.toLowerCase().includes(term))
            );
        }
    }

    async _addUser() {
        // this.userForm.patchValue({
        //     username: null,
        //     password: null,
        //     fullname: null,
        //     email: null,
        //     status: true,
        // });
        this.userForm.reset();
        this.setCreateMode();

        this.showDetailForm = { show: true, action: 'add' };
    }
    async _delUser(event: any) {
        this.selectedUser = event;
        this.showDetailDelete = true;
    }

    onSubmit() {
        if (this.userForm.invalid) {
            return; // Form invalid, jangan lanjut
        }
        this.loading = true;
        let objPayload = this.userForm.value;
        console.log('Payload form ', objPayload);
        // const selectedGroup: any = objPayload.idgroupObj;
        // objPayload.idgroup = selectedGroup?.idgroup;
        // delete objPayload.idgroupObj;
        if (this.showDetailForm.action == 'add') {
            //########### CHECK PANJANG USER ##############
            let usernameLength = objPayload?.username;
            if ((usernameLength ?? '').length < 6) {
                this.loading = false;
                this.errorMessage = {
                    error: true,
                    severity: 'error',
                    message: 'Username cannot less than 6 characters',
                    icon: 'pi pi-exclamation-circle',
                };
                return;
            }
            // ########## CHECK PASSWORD ATTRIBUTE ########
            const policy = {
                minLength: 8,
                requireUppercase: true,
                requireNumber: true,
                requireSpecialChar: true,
                allowedSpecialChars: '!@#$%^&*()_+[]{}|;:,.?~-',
            };
            const resultValidasiPassword = this._validatePassword(objPayload?.password!, policy);

            if (!resultValidasiPassword.valid) {
                this.loading = false;
                this.errorMessage = { error: true, severity: 'error', message: resultValidasiPassword.errors, icon: 'pi pi-exclamation-circle' };
            } else {
                this._saveAddData(objPayload);
            }
        } else {
            console.log('IdUserOLD : ', this.idUserOld);
            this._saveEditData(objPayload, this.idUserOld);
        }
    }
    onCancel() {
        this.setCreateMode();
        this.showDetailForm = { show: false, action: 'add' };
    }
    setCreateMode() {
        const passwordControl = this.userForm.get('password');
        if (passwordControl) {
            passwordControl.setValidators([Validators.required]);
            passwordControl.updateValueAndValidity();
        }
    }
    async onOkDelete() {
        this.loading = true;
        console.log('data to delete ', this.selectedUser);
        await this._saveDeleteData(this.selectedUser);
        this.showDetailDelete = false;
    }
    onCancelDelete() {
        this.showDetailDelete = false;
    }
    _saveAddData(payload: any) {
        this.requestService.postBackend('/v2/user/add-user', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }
    _saveEditData(payload: any, idUser: string) {
        payload = { ...payload, iduser: idUser };
        this.requestService.postBackend('/v2/user/edit-user', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }
    async _saveDeleteData(payload: any) {
        this.requestService.postBackend('/v2/user/delete-user', payload).subscribe({
            next: () => {
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }

    _validatePassword(password: string, policy: PasswordPolicy): PasswordValidationResult {
        const errors: string[] = [];

        if (policy.minLength && password.length < policy.minLength) {
            errors.push(`Password must be at least ${policy.minLength} characters long`);
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least 1 uppercase letter');
        }

        if (policy.requireNumber && !/[0-9]/.test(password)) {
            errors.push('Password must contain at least 1 number');
        }

        if (policy.requireSpecialChar) {
            // default aman (tidak termasuk < > " ' ` \ /)
            const safeSpecials = policy.allowedSpecialChars || '!@#$%^&*()_+[]{}|;:,.?~-';

            const regex = new RegExp(`[${safeSpecials.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);

            if (!regex.test(password)) {
                errors.push('Password must contain at least 1 special character');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
interface Column {
    field?: string | null;
    header?: string | null;
    class?: string | null;
    cellclass?: string | null;
}

interface PasswordPolicy {
    minLength?: number;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
    allowedSpecialChars?: string; // whitelist karakter khusus
}

interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
}
