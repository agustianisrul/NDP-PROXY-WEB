import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { GroupDetail } from '../../../model/custom-entity/GroupDetail';
import { ConfirmDelete } from '../../components/confirm-delete/confirm-delete';
import { DialogDetail } from '../../components/dialog-detail/dialog-detail';
import { ParentTable } from '../../components/parent-table';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-groupmanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, DialogDetail, ConfirmDelete],
    templateUrl: './groupmanagement.html',
    styleUrl: './groupmanagement.css',
    providers: [ConfirmationService],
})
export class Groupmanagement extends ParentTable<GroupDetail> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idgroup', sortable: true, displayAt: 'none' },
            { label: 'Group Name', key: 'groupname', sortable: true, validators: { required: true } },
            { label: 'Description', key: 'description', sortable: true },
            {
                label: 'Selected Menu',
                key: 'menublob',
                sortable: true,
                displayAt: 'detail',
                componentType: 'tree-menu-picker',
                optionsParameter: { url: '/v2/menu/list-menu-role', keyLabel: 'nameMenu' },
            },
        ];

        this.endpointList.set('create', '/v2/group/add-group');
        this.endpointList.set('edit', '/v2/group/edit-group');
        this.endpointList.set('delete', '/v2/group/delete-group');
    }
}
