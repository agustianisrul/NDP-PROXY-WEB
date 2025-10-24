import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-rolemanagement',
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
    ],
    templateUrl: './rolemanagement.html',
    styleUrl: './rolemanagement.css',
})
export class Rolemanagement implements OnInit {
    currentUrl: string = '';
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;
    //##########################################################
    token: string | null | undefined = undefined;
    userInfo: any;
    //##########################################################
    loading: boolean = false;
    cols!: Column[];
    rows = 50;
    idRoleOld: string = '';
    roles!: RoleField[];
    totalRoles: number = 0;
    allRoles!: RoleField[];
    globalFilter: string = '';
    selectedRole: RoleField = {};
    showDetailForm: any = { show: false, action: 'add' };
    showDetailDelete: boolean = false;
    showErrorPage: any = { show: false, message: 'undefined' };
    errorMessage: any = { error: false, severity: 'error', message: 'ini test', icon: 'pi pi-exclamation-circle' };
    aclMenublob: any[] = ['up', 'rd', 'dl', 'cr'];
    roleForm = new FormGroup({
        idRole: new FormControl(''),
        rolename: new FormControl('', [Validators.required]),
        roledescription: new FormControl(''),
    });

    constructor(private readonly router: Router, private readonly requestService: RequestService) {}

    // Helper getter untuk akses kontrol form di template
    get f() {
        return this.roleForm.controls;
    }

    async ngOnInit(): Promise<void> {
        this.currentUrl = this.router.url;
        this.cols = [
            { field: 'idRole', header: 'Id Role', class: 'text-center' },
            { field: 'rolename', header: 'Name', class: 'text-center' },
            { field: 'roledescription', header: 'Description' },
        ];
        this.breaditems = [{ label: 'Management' }, { label: 'Role' }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
        if (this.aclMenublob.includes('rd')) {
            await this._refreshListData();
        }
    }

    async _refreshListData(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/role/list-role').subscribe({
            next: (data: any) => {
                this.roles = data.data;
                this.allRoles = this.roles;
                this.totalRoles = this.allRoles.length;
                this.loading = false;
            },
            error: () => {
                this.roles = [];
                this.totalRoles = this.roles.length;
                this.loading = false;
            },
        });
    }

    onGlobalSearch() {
        const term = this.globalFilter.trim().toLowerCase();
        if (term === '') {
            this.roles = [...this.allRoles];
        } else {
            this.roles = this.allRoles.filter((item) =>
                [item.idRole, item.rolename, item.roledescription].some((field) => field?.toLowerCase().includes(term))
            );
        }
    }

    onRowSelect(event: any) {
        const dataObj = event.data;
        this.idRoleOld = dataObj.idRole;
        this.roleForm.patchValue({
            idRole: dataObj.idRole,
            rolename: dataObj.rolename,
            roledescription: dataObj.roledescription,
        });
        this.showDetailForm = { show: true, action: 'edit' };
    }

    async _addRole() {
        this.roleForm.patchValue({
            idRole: null,
            rolename: null,
            roledescription: null,
        });
        this.showDetailForm = { show: true, action: 'add' };
    }
    async _delRole(event: any) {
        this.selectedRole = event;
        this.showDetailDelete = true;
    }

    onSubmit() {
        if (this.roleForm.invalid) {
            return; // Form invalid, jangan lanjut
        }
        this.loading = true;
        const objPayload = this.roleForm.value;
        if (this.showDetailForm.action == 'add') {
            this._saveAddData(objPayload);
        } else {
            this._saveEditData(objPayload, this.idRoleOld);
        }
    }

    onCancel() {
        this.showDetailForm = { show: false, action: 'add' };
    }

    async onOkDelete() {
        this.loading = true;
        await this._saveDeleteData(this.selectedRole);
        this.showDetailDelete = false;
    }

    onCancelDelete() {
        this.showDetailDelete = false;
    }

    _saveAddData(payload: any) {
        this.requestService.postBackend('/v2/role/add-role', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: Error) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err}`, icon: 'pi pi-times' };
            },
        });
    }

    _saveEditData(payload: any, idRoleOld: string) {
        payload = { ...payload, ...{ idRoleOld: idRoleOld } };
        this.requestService.postBackend('/v2/role/edit-role', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: Error) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err}`, icon: 'pi pi-times' };
            },
        });
    }

    async _saveDeleteData(payload: any) {
        this.requestService.postBackend('/v2/role/delete-role', payload).subscribe({
            next: () => {
                this._refreshListData();
            },
            error: (err: Error) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err}`, icon: 'pi pi-times' };
            },
        });
    }
}

interface RoleField {
    idRole?: string | null;
    rolename?: string | null;
    roledescription?: string | null;
    created_at?: string | null;
    deleteable?: number | null;
}

interface Column {
    field?: string | null;
    header?: string | null;
    class?: string | null;
    cellclass?: string | null;
}
