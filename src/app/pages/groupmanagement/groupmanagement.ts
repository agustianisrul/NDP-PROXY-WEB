import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { RoleDetail } from '../../../model/custom-entity/RoleDetail';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-groupmanagement',
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
        TreeModule,
        DragDropModule,
    ],
    templateUrl: './groupmanagement.html',
    styleUrl: './groupmanagement.css',
})
export class Groupmanagement implements OnInit {
    currentUrl: string = '';
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;
    token: string | null | undefined = undefined;
    userInfo: any;
    loading: boolean = false;
    cols!: Column[];
    colsRole!: Column[];
    rows = 50;
    idGroup: string = '';
    groups!: GroupField[];
    totalGroups: number = 0;
    allGroups!: GroupField[];
    globalFilter: string = '';
    selectedGroup: GroupField = {};
    rolesData!: any[];
    menusData!: any[];
    showDetailForm: any = { show: false, action: 'add' };
    showDetailDelete: boolean = false;
    showRoleForm: any = { show: false, action: 'root' };
    selectedRoles: any[] = [];
    showMenusDetail: any = { show: false, selectedGroup: { message: 'ini harusnya isi Object' } };
    showErrorPage: any = { show: false, message: 'undefined' };
    errorMessage: any = { error: false, severity: 'error', message: 'ini test', icon: 'pi pi-exclamation-circle' };
    //################################ FOR TREE ##############################
    masterMenu: any[] = [];
    masterMenuTemp: any[] = [];
    treeData: any[] = [];
    draggedMenu: any;
    //######################################################################
    aclMenublob: any[] = ['up', 'rd', 'dl', 'cr', 'sm'];
    groupForm = new FormGroup({
        idgroup: new FormControl(''),
        groupname: new FormControl('', [Validators.required]),
        description: new FormControl(''),
    });
    get f() {
        return this.groupForm.controls;
    }

    constructor(private readonly router: Router, private readonly requestService: RequestService) {}

    async ngOnInit(): Promise<void> {
        this.currentUrl = this.router.url;
        this.cols = [
            { field: 'idgroup', header: 'Group Id' },
            { field: 'groupname', header: 'Name' },
            { field: 'description', header: 'Description' },
        ];
        this.colsRole = [
            { field: 'idRole', header: 'Role Id' },
            { field: 'roleName', header: 'Name' },
            { field: 'roleDescription', header: 'Description' },
        ];
        this.breaditems = [{ label: 'Management' }, { label: 'Groups' }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
        if (this.aclMenublob.includes('rd')) {
            await this._refreshListData();
            await this._refreshMenuMaster();
        }

        //################################ FOR TREE ############################
        this.masterMenu = [];
    }
    onDropNode(event: any) {
        if (this.draggedMenu) {
            // Tambah node baru di root treeData
            this.treeData = [
                ...this.treeData,
                {
                    key: this.draggedMenu.id.toString(),
                    label: this.draggedMenu.label,
                    icon: this.draggedMenu.icon,
                    data: this.draggedMenu,
                    children: [],
                },
            ];
            this.draggedMenu = null;
        }
    }
    async _refreshListData(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/group/list-group').subscribe({
            next: (data: any) => {
                this.groups = data.data;
                this.allGroups = this.groups;
                this.totalGroups = this.allGroups.length;
                this.loading = false;
            },
            error: () => {
                this.groups = [];
                this.totalGroups = this.groups.length;
                this.loading = false;
            },
        });
    }

    async _refreshMenuMaster(): Promise<void> {
        this.loading = true;
        this.requestService.getBackend('/v2/menu/list-menu-role').subscribe({
            next: (data: any) => {
                this.masterMenu = data.data;
                this.masterMenuTemp = data.data;
                this.loading = false;
            },
            error: () => {
                this.masterMenu = [];
                this.masterMenuTemp = [];
                this.loading = false;
            },
        });
    }
    onGlobalSearch() {
        const term = this.globalFilter.trim().toLowerCase();
        if (term === '') {
            this.groups = [...this.allGroups];
        } else {
            this.groups = this.allGroups.filter((item) =>
                [item.idgroup, item.groupname, item.description].some((field) => field?.toLowerCase().includes(term))
            );
        }
    }
    onRowSelect(event: any) {
        const dataObj = event.data;
        this.idGroup = dataObj.idgroup;
        this.groupForm.patchValue({
            idgroup: dataObj.idgroup,
            groupname: dataObj.groupname,
            description: dataObj.description,
        });
        this.groupForm.get('idgroup')?.disable();
        this.showDetailForm = { show: true, action: 'edit' };
    }
    onRowSelectRole(event: any) {
    }
    onRowUnselectRole(event: any) {
        this.selectedRoles = this.selectedRoles.filter((r) => r.idRole !== event.data.idRole);
    }
    onHeaderCheckboxToggle(event: any) {
    }

    async _menusAtGroup(event: any) {
        let menuBlob: any = event.menublob;
        if (menuBlob) {
            let menuObj = menuBlob;
            this.treeData = this.cleanMenuForTree(menuObj);
        }
        this.showMenusDetail = { show: true, selectedGroup: event };
    }
    async _cancelMenusAtGroup() {
        this.masterMenu = this.masterMenuTemp;

        this.showMenusDetail = { show: false, selectedGroup: {} };
    }
    async _addGroup() {
        this.groupForm.patchValue({
            idgroup: null,
            groupname: null,
            description: null,
        });
        this.groupForm.get('idgroup')?.enable();
        this.showDetailForm = { show: true, action: 'add' };
    }
    async _delGroup(event: any) {
        this.selectedGroup = event;
        this.showDetailDelete = true;
    }
    onSubmit() {
        if (this.groupForm.invalid) {
            return;
        }
        this.loading = true;
        const objPayload = this.groupForm.value;
        this.groupForm.get('idgroup')?.enable();
        if (this.showDetailForm.action == 'add') {
            this._saveAddData(objPayload);
        } else {
            this._saveEditData(objPayload, this.idGroup);
        }
    }
    onCancel() {
        this.showDetailForm = { show: false, action: 'add' };
    }
    async onOkDelete() {
        this.loading = true;
        await this._saveDeleteData(this.selectedGroup);
        this.showDetailDelete = false;
    }
    onCancelDelete() {
        this.showDetailDelete = false;
    }
    _saveAddData(payload: any) {
        this.requestService.postBackend('/v2/group/add-group', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }

    _saveEditData(payload: any, iGroup: string) {
        payload = { ...payload, idgroup: iGroup };
        this.requestService.postBackend('/v2/group/edit-group', payload).subscribe({
            next: () => {
                this.showDetailForm = { show: false, action: 'add' };
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }

    _updateMenuGroup(menublob: string) {
        let payload = { idgroup: this.showMenusDetail.selectedGroup.idgroup, menublob: menublob };
        this.requestService.postBackend('/v2/group/edit-group', payload).subscribe({
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
        this.requestService.postBackend('/v2/group/delete-group', payload).subscribe({
            next: () => {
                this._refreshListData();
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = { error: true, severity: 'error', message: `${err.error.message}`, icon: 'pi pi-times' };
            },
        });
    }

    //############################################## FOR DRAG AND DROP ################################
    dragStart(menu: any) {
        this.draggedMenu = menu;
        this.rolesData = menu.roleList;
    }
    dragEnd() {
        if (this.draggedMenu?.roleList?.length === 0) {
            if (this.showRoleForm.action === 'root') {
                this.onDropRoot(this.draggedMenu);
            } else {
                this.onDropChild(this.draggedMenu, this.showRoleForm.parentNode);
            }
        }
    }
    onDropRootStart(event: any) {
        this.selectedRoles = [];
        if (this.draggedMenu?.roleList?.length > 0) {
            this.showRoleForm = { show: true, action: 'root', draggedMenu: this.draggedMenu };
        }
    }
    onDropRoot(event: any) {
        if (this.draggedMenu) {
            this.treeData = [...this.treeData, this.createNode(this.draggedMenu)];
            this.removeFromMaster(this.draggedMenu.idMenu);
            this.draggedMenu = null;
        }
    }
    onDropChildStart(event: any, parentNode: any) {
        this.selectedRoles = [];
        if (this.draggedMenu?.roleList?.length > 0) {
            this.showRoleForm = { show: true, action: 'child', draggedMenu: this.draggedMenu, parentNode: parentNode };
        }
    }
    onDropChild(event: any, parentNode: any) {
        if (this.draggedMenu) {
            parentNode.children = parentNode.children || [];
            parentNode.children.push(this.createNode(this.draggedMenu));
            parentNode.expanded = true;
            this.removeFromMaster(this.draggedMenu.idMenu);
            this.draggedMenu = null;
        }
    }
    async _roleSubmit() {
        // Ambil semua idRole
        if (this.selectedRoles.length > 0) {
            this.draggedMenu = { ...this.draggedMenu, ...{ roles: this.selectedRoles.map((item: RoleDetail) => item.rolename) } };
        }
        if (this.showRoleForm.action === 'root') {
            this.onDropRoot(this.draggedMenu);
        } else {
            this.onDropChild(this.draggedMenu, this.showRoleForm.parentNode);
        }
        this.showRoleForm = { show: false, action: 'root' };
    }
    async _roleCancel() {
        this.selectedRoles = [];
        this.draggedMenu = null;
        this.showRoleForm = { show: false, action: 'root' };
    }

    // Ambil semua node + descendant dalam bentuk flat list
    private flattenNodes(node: any): any[] {
        let nodes = [node];
        if (node.children && node.children.length > 0) {
            for (let child of node.children) {
                nodes = nodes.concat(this.flattenNodes(child));
            }
        }
        return nodes;
    }
    private removeNode(target: any, nodes: any[]): boolean {
        const index = nodes.findIndex((n) => n.key === target.key);
        if (index !== -1) {
            nodes.splice(index, 1);
            return true;
        }
        // Cari rekursif ke children
        for (let node of nodes) {
            if (node.children && this.removeNode(target, node.children)) {
                return true;
            }
        }
        return false;
    }

    deleteNode(node: any, nodes: any[]) {
        // 1. Flatten untuk ambil node beserta semua anak-anaknya
        this.pushMenuToMasterMenu(node);
        // const allNodes = this.flattenNodes(node);
        // 2. Kembalikan semua ke master menu
        // for (let n of allNodes) {
        //     this.masterMenu.push({
        //         idMenu: +n.key,
        //         nameMenu: n.label,
        //         iconMenu: n.icon,
        //         pathMenu: n.path,
        //     });
        // }
        // 3. Hapus dari treeData (rekursif)
        this.removeNode(node, this.treeData);
    }

    private pushMenuToMasterMenu(node: any): void {
        const tempDeleteMenu = this.masterMenuTemp.find((tempMenu) => tempMenu.nameMenu === node.label);
        if (tempDeleteMenu) {
            this.masterMenu.push(tempDeleteMenu);
        }
        if (node.children?.length > 0) {
            for (const tempChildrenNode of node.children) {
                this.pushMenuToMasterMenu(tempChildrenNode);
            }
        }
    }

    private createNode(menu: any) {
        return {
            key: menu.idMenu.toString(),
            label: menu.nameMenu,
            icon: menu.iconMenu,
            path: menu.pathMenu,
            roles: this.selectedRoles.map((item: RoleDetail) => item.rolename),
            children: [],
        };
    }

    private removeFromMaster(id: number) {
        this.masterMenu = this.masterMenu.filter((m) => m.idMenu !== id);
    }

    async _generateMenusAtGroup() {
        this.loading = true;
        const compactMenu = await this.transformTreeToMenuModel(this.treeData);
        this._updateMenuGroup(JSON.stringify(compactMenu));
        this.showMenusDetail = { show: false };
    }
    // Transform treeData -> PrimeNG MenuModel
    async transformTreeToMenuModel(nodes: any[], isRoot = true): Promise<any[]> {
        const transformed = await Promise.all(
            nodes.map(async (node) => {
                const menuItem: any = {
                    label: node.label,
                };
                if (node.icon) {
                    menuItem.icon = node.icon;
                }
                if (node.path) {
                    menuItem.routerLink = node.path;
                }
                if (node.roles && Array.isArray(node.roles) && node.roles.length > 0) {
                    menuItem.roles = [...node.roles];
                }
                if (node.children && node.children.length > 0) {
                    menuItem.items = await this.transformTreeToMenuModel(node.children, false);
                }
                return menuItem;
            })
        );

        return transformed;
    }

    private cleanMenuForTree(data: any): any[] {
        if (!Array.isArray(data)) {
            return [];
        }
        return data
            .filter((item) => item.label !== 'Privacy & Security')
            .map((item) => {
                // --- hapus item dari masterMenu kalau ada yang match ---
                this.masterMenu = this.masterMenu.filter((m) => m.nameMenu !== item.label);

                const newItem: any = {
                    key: `id${item.label}`,
                    label: item.label,
                };
                if (item.icon) {
                    newItem.icon = item.icon;
                }

                if (item.routerLink) {
                    newItem.path = item.routerLink;
                }

                if (item.roles && item.roles.length > 0) {
                    newItem.roles = [...item.roles];
                }

                // --- cek items ---
                if (item.items) {
                    let parsedItems: any[] = [];

                    if (typeof item.items === 'string') {
                        parsedItems = JSON.parse(item.items);
                    } else if (Array.isArray(item.items)) {
                        parsedItems = item.items;
                    }

                    if (parsedItems.length > 0) {
                        newItem.children = this.cleanMenuForTree(parsedItems);
                    }
                }

                return newItem;
            });
    }
}
interface GroupField {
    idgroup?: string | null;
    groupname?: string | null;
    menublob?: string | null;
    description?: string | null;
}
interface Column {
    field?: string | null;
    header?: string | null;
    class?: string | null;
    cellclass?: string | null;
}
interface RoleField {
    idRole?: string | null;
    roleName?: string | null;
    roleDescription?: string | null;
}
