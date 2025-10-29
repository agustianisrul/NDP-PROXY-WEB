import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Scheduler } from '../../../../model/surrounding/Scheduler';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { DialogDetail } from '../../../components/dialog-detail/dialog-detail';
import { ParentTable } from '../../../components/parent-table';
import { TableUniversal } from '../../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-scheduler-list',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, DialogDetail, ConfirmDelete],
    templateUrl: './scheduler-list.html',
    styleUrl: './scheduler-list.css',
    providers: [ConfirmationService],
})
export class SchedulerList extends ParentTable<Scheduler> implements OnInit {
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
            { label: 'Scheduler Name', key: 'name', sortable: true },
            { label: 'Description', key: 'description', sortable: true },
            { label: 'Running Time (in Hour)', key: 'inHour', align: 'center', sortable: true },
            { label: 'Running Time (in Minute)', key: 'inMinute', align: 'center', sortable: true },
            { label: 'Running Time (in Second)', key: 'inSecond', align: 'center', sortable: true },
            { label: 'Status', key: 'status', optionsParameter: { data: dataOptionStatus, keyLabel: 'keyLabel' }, align: 'center', sortable: true },
        ];
    }
}
