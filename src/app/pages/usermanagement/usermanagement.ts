import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { UserGroup } from '../../../model/custom-entity/UserGroup';
import { ConfirmDelete } from '../../components/confirm-delete/confirm-delete';
import { DialogDetail } from '../../components/dialog-detail/dialog-detail';
import { ParentTable } from '../../components/parent-table';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-usermanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, DialogDetail, ConfirmDelete],
    templateUrl: './usermanagement.html',
    styleUrl: './usermanagement.css',
    providers: [ConfirmationService],
})
export class Usermanagement extends ParentTable<UserGroup> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
        const dataOptionStatus: any[] = [
            { status: false, display: '❌ Inactive' },
            { status: true, display: '✅ Active' },
        ];

        this.columns = [
            { label: 'User ID', key: 'iduser', sortable: true, displayAt: 'none' },
            { label: 'User', key: 'username', sortable: true, validators: { required: true } },
            { label: 'Fullname', key: 'fullname', sortable: true },
            { label: 'Group', key: 'group.groupname', sortable: true, displayAt: 'table' },
            {
                label: 'Group',
                key: 'idgroup',
                sortable: true,
                displayAt: 'detail',
                componentType: 'p-select',
                optionsParameter: { url: '/v2/group/list-group', keyLabel: 'groupname', keyCode: 'idgroup' },
            },
            { label: 'Email', key: 'email', sortable: true, validators: { email: true } },
            {
                label: 'Status',
                key: 'status',
                align: 'center',
                sortable: true,
                displayAt: 'table',
                optionsParameter: { data: dataOptionStatus, keyLabel: 'keyLabel' },
            },
            {
                label: 'Password',
                key: 'password',
                sortable: true,
                displayAt: 'detail',
                validators: { passwordPolicy: true, required: true },
                componentType: 'p-password',
            },
        ];

        this.endpointList.set('create', '/v2/user/add-user');
        this.endpointList.set('edit', '/v2/user/edit-user');
        this.endpointList.set('delete', '/v2/user/delete-user');
    }
}
