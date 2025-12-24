import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { RoleDetail } from '../../../model/custom-entity/RoleDetail';
import { ConfirmDelete } from '../../components/confirm-delete/confirm-delete';
import { ParentTable } from '../../components/parent-table';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-rolemanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './rolemanagement.html',
    styleUrl: './rolemanagement.css',
    providers: [ConfirmationService, DialogService],
})
export class Rolemanagement extends ParentTable<RoleDetail> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idRole', sortable: true, displayAt: 'none' },
            { label: 'Role Name', key: 'rolename', sortable: true, validators: { required: true } },
            { label: 'Description', key: 'roledescription', sortable: true },
        ];

        this.endpointList.set('create', '/v2/role/add-role');
        this.endpointList.set('edit', '/v2/role/edit-role');
        this.endpointList.set('delete', '/v2/role/delete-role');
    }
}
