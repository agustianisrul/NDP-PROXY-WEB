import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { Prefix } from '../../../../model/surrounding/Prefix';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { ParentTable } from '../../../components/parent-table';
import { TableUniversal } from '../../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-prefix-list',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './prefix-list.html',
    styleUrl: './prefix-list.css',
    providers: [ConfirmationService, DialogService],
})
export class PrefixList extends ParentTable<Prefix> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idPrefixName', sortable: true, displayAt: 'none' },
            { label: 'Prefix Name', key: 'prefixName', sortable: true, validators: { required: true } },
            { label: 'Path Structure', key: 'pathStructure', sortable: true, validators: { required: true } },
            { label: 'Delimiter', key: 'delimiter', sortable: true, align: 'center', validators: { required: true } },
        ];

        this.endpointList.set('create', '/v2/Prefix/add-Prefix');
        this.endpointList.set('edit', '/v2/Prefix/edit-Prefix');
        this.endpointList.set('delete', '/v2/Prefix/delete-Prefix');
    }
}
