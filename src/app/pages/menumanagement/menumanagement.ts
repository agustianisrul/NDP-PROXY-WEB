import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-menumanagement',
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
        SelectModule,
        MultiSelectModule,
    ],
    templateUrl: './menumanagement.html',
    styleUrl: './menumanagement.css',
})
export class Menumanagement implements OnInit {
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
    idMenuOld: string = '';
    menus!: MenuField[];
    allicons!: any[];
    allRoles!: any[];
    totalMenus: number = 0;
    allMenus!: MenuField[];
    globalFilter: string = '';
    selectedMenu: MenuField = {};
    showDetailForm: any = { show: false, action: 'add' };
    showDetailDelete: boolean = false;
    errorMessage: any = { error: false, severity: 'error', message: 'ini test', icon: 'pi pi-exclamation-circle' };
    aclMenublob: any[] = ['up', 'rd', 'dl', 'cr'];
    menuForm = new FormGroup({
        idMenu: new FormControl(''),
        nameMenu: new FormControl('', [Validators.required]),
        pathMenu: new FormControl(''),
        iconMenu: new FormControl(''),
        roleList: new FormControl([]),
    });
    get f() {
        return this.menuForm.controls;
    }

    constructor(private readonly router: Router, private readonly requestService: RequestService) {}

    async ngOnInit(): Promise<void> {
        this.currentUrl = this.router.url;
        this.cols = [
            { field: 'idMenu', header: 'Id' },
            { field: 'nameMenu', header: 'Menu' },
            { field: 'pathMenu', header: 'URL Link' },
            { field: 'iconMenu', header: 'iconcode' },
            { field: 'created_at', header: 'Create At' },
            { field: 'updated_at', header: 'Update At' },
        ];
        this.breaditems = [{ label: 'Management' }, { label: 'Menus' }];
        this.home = { icon: 'pi pi-home', routerLink: '/' };
        if (this.aclMenublob.includes('rd')) {
            await this._refreshIconData();
            await this._refreshListData();
            await this._refreshRoleData();
        }
    }
    async _refreshListData(): Promise<any> {
        this.loading = true;
        this.requestService.getBackend('/v2/menu/list-menu').subscribe({
            next: (data: any) => {
                this.menus = data.data;
                this.allMenus = this.menus;
                this.totalMenus = this.allMenus.length;
                this.loading = false;
            },
            error: () => {
                this.menus = [];
                this.totalMenus = this.menus.length;
                this.loading = false;
            },
        });
    }

    async _refreshIconData(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/menu/list-icon').subscribe({
            next: (data: any) => {
                this.allicons = data.data;
                this.loading = false;
            },
            error: () => {
                this.allicons = [];
                this.loading = false;
            },
        });
    }

    async _refreshRoleData(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/role/list-role').subscribe({
            next: (data: any) => {
                this.allRoles = data.data;
                this.loading = false;
            },
            error: () => {
                this.allRoles = [];
                this.loading = false;
            },
        });
    }

    onGlobalSearch() {
        console.log('Global filter : ', this.globalFilter);
        const term = this.globalFilter.trim().toLowerCase();
        if (term === '') {
            this.menus = [...this.allMenus];
        } else {
            this.menus = this.allMenus.filter((item) => [item.nameMenu, item.iconMenu].some((field) => field?.toLowerCase().includes(term)));
        }
    }

    onRowSelect(event: any) {
        console.log('Selected Menu:', event.data);
        const dataObj = event.data;
        // Cari 1 object berdasarkan code
        let iconObject: any = {};
        this.idMenuOld = dataObj.idMenu;
        if (dataObj.iconMenu) {
            iconObject = this.allicons.find((x) => x.code === dataObj.iconMenu);
        }
        this.menuForm.patchValue({
            idMenu: dataObj.idMenu,
            nameMenu: dataObj.nameMenu,
            pathMenu: dataObj.pathMenu,
            iconMenu: dataObj.iconMenu,
            roleList: dataObj.roleList,
        });
        this.showDetailForm = { show: true, action: 'edit' };
    }

    async _addMenu() {
        this.menuForm.reset();
        // this.menuForm.patchValue({
        //     nameMenu: null,
        //     pathMenu: null,
        //     iconMenu: null,
        //     roleList: [],
        // });
        this.showDetailForm = { show: true, action: 'add' };
    }
    async _delMenu(event: any) {
        this.selectedMenu = event;
        this.showDetailDelete = true;
    }

    onSubmit() {
        if (this.menuForm.invalid) {
            return; // Form invalid, jangan lanjut
        }
        this.loading = true;
        let objPayload: any = this.menuForm.value;
        // if (objPayload.iconMenuObj.id) objPayload.iconMenu = objPayload.iconMenuObj.code;
        // if (!objPayload.iconMenuObj.id) objPayload.iconMenu = null;
        // delete objPayload.iconMenuObj;
        console.log('Payload form ', objPayload);
        if (this.showDetailForm.action == 'add') {
            this._saveAddData(objPayload);
        } else {
            objPayload = { ...objPayload, ...{ idMenu: this.idMenuOld } };
            this._saveEditData(objPayload);
        }
    }
    onCancel() {
        this.showDetailForm = { show: false, action: 'add' };
    }
    async onOkDelete() {
        this.loading = true;
        console.log('data to delete ', this.selectedMenu);
        await this._saveDeleteData(this.selectedMenu);
        this.showDetailDelete = false;
    }
    onCancelDelete() {
        this.showDetailDelete = false;
    }
    _saveAddData(payload: any) {
        this.requestService.postBackend('/v2/menu/add-menu', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }
    _saveEditData(payload: any) {
        this.requestService.postBackend('/v2/menu/edit-menu', payload).subscribe({
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
        this.requestService.postBackend('/v2/menu/delete-menu', payload).subscribe({
            next: () => {
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }
}
interface MenuField {
    idMenu?: number | null;
    nameMenu?: string | null;
    pathMenu?: string | null;
    idAppMenu?: string | null;
    iconMenu?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}
interface Column {
    field?: string | null;
    header?: string | null;
    class?: string | null;
    cellclass?: string | null;
}
