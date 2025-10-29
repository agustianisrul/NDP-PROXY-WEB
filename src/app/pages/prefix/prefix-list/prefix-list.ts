import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Prefix } from '../../../../model/surrounding/Prefix';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { DialogDetail } from '../../../components/dialog-detail/dialog-detail';
import { ParentTable } from '../../../components/parent-table';
import { TableUniversal } from '../../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-prefix-list',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, DialogDetail, ConfirmDelete],
    templateUrl: './prefix-list.html',
    styleUrl: './prefix-list.css',
    providers: [ConfirmationService],
})
export class PrefixList extends ParentTable<Prefix> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Prefix Name', key: 'prefixName', sortable: true },
            { label: 'Path Structure', key: 'pathStructure', sortable: true },
            { label: 'Delimiter', key: 'delimiter', sortable: true, align: 'center' },
        ];
    }
}
