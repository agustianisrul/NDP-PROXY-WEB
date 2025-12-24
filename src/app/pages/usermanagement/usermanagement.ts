import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { UserGroup } from '../../../model/custom-entity/UserGroup';
import { ConfirmDelete } from '../../components/confirm-delete/confirm-delete';
import { ParentTable } from '../../components/parent-table';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-usermanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './usermanagement.html',
    styleUrl: './usermanagement.css',
    providers: [ConfirmationService, DialogService],
})
export class Usermanagement extends ParentTable<UserGroup> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
        const accountStatusOptions = [
            { label: 'OFFLINE', account_status: null },
            { label: 'ONLINE', account_status: 'ONLINE' },
            { label: 'LOCKED', account_status: 'LOCKED' },
        ];
        const environmentOptions = [
            { label: 'Production', envi_user: 'prod' },
            { label: 'Non Production', envi_user: 'non-prod' },
        ];

        this.columns = [
            { label: 'User ID', key: 'iduser', sortable: true, displayAt: 'none' },
            { label: 'User', key: 'username', sortable: true, componentType: 'p-label' },
            { label: 'Fullname', key: 'fullname', sortable: true },
            { label: 'Group', key: 'group.groupname', sortable: true, displayAt: 'table' },
            {
                label: 'Group',
                key: 'idgroup',
                sortable: true,
                displayAt: ['create', 'edit', 'view', 'delete'],
                componentType: 'p-select',
                optionsParameter: { url: '/v2/group/list-group', keyLabel: 'groupname', keyCode: 'idgroup' },
            },
            { label: 'Email', key: 'email', sortable: true, validators: { email: true } },
            {
                label: 'Status',
                key: 'account_status',
                align: 'center',
                sortable: true,
                componentType: 'p-select',
                optionsParameter: { data: accountStatusOptions, keyLabel: 'label', keyCode: 'account_status' },
            },
            {
                label: 'Environment User',
                key: 'envi_user',
                align: 'center',
                sortable: true,
                componentType: 'p-select',
                optionsParameter: { data: environmentOptions, keyLabel: 'label', keyCode: 'envi_user' },
            },
            {
                label: 'Password',
                key: 'password',
                sortable: true,
                displayAt: ['create'],
                validators: { passwordPolicy: true, required: true },
                componentType: 'p-password',
            },
        ];

        this.endpointList.set('create', '/v2/user/add-user');
        this.endpointList.set('edit', '/v2/user/edit-user');
        this.endpointList.set('delete', '/v2/user/delete-user');
    }
}
