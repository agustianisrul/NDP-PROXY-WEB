import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PermissionMode } from '../../../../model/others/TableButton';
import { TableHeader } from '../../../../model/others/TableHeader';
import { DialogDetail } from '../../../components/dialog-detail/dialog-detail';

@Component({
    standalone: true,
    selector: 'app-scheduler-detail',
    imports: [DialogDetail, RouterModule],
    templateUrl: './scheduler-detail.html',
    styleUrl: './scheduler-detail.css',
})
export class SchedulerDetail implements OnInit {
    private readonly router = inject(Router);
    private readonly platformId = inject(PLATFORM_ID);
    dialogVisible = false;
    dialogTitle = 'Scheduler';
    dialogMode: PermissionMode = 'create';
    selectedRow!: SchedulerDetail;
    tableHeaders: TableHeader[] = [];

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const record = sessionStorage.getItem('record');
            this.selectedRow = record ? JSON.parse(record) : {};
            const tempMode = sessionStorage.getItem('mode') as PermissionMode;
            this.dialogMode = tempMode || 'edit';
            const tempColumnInfo = sessionStorage.getItem('columnInfo');
            this.tableHeaders = tempColumnInfo ? JSON.parse(tempColumnInfo) : [];
        }
    }

    handleSave(data: any) {
        console.log(this.dialogMode, 'data saved:', data);
    }
}
