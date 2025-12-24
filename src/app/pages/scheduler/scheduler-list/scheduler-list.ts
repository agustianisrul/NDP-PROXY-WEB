import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { Scheduler } from '../../../../model/surrounding/Scheduler';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { ParentTable } from '../../../components/parent-table';
import { TableUniversal } from '../../../components/table-universal/table-universal';
import { PermissionMode } from '../../../../model/others/TableButton';
import { DateService } from '../../../services/date-service';

@Component({
    standalone: true,
    selector: 'app-scheduler-list',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './scheduler-list.html',
    styleUrl: './scheduler-list.css',
    providers: [ConfirmationService, DialogService],
})
export class SchedulerList extends ParentTable<Scheduler> implements OnInit {
    protected readonly dateService = inject(DateService);
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
            { label: 'Label Name', key: 'idScheduler', sortable: true, displayAt: 'none' },
            { label: 'Parameter', key: 'typeName', optionsParameter: { url: '/v2/config-parameter/list-form-scheduler', keyLabel: 'paramName', keyCode: 'paramName' }, align: 'center', sortable: true, componentType: 'p-select', displayAt: ['create'] },
            { label: 'Scheduler Name', key: 'name', sortable: true },
            { label: 'Description', key: 'description', sortable: true },
            { label: 'Running Time (in Hour)', key: 'inHour', align: 'center', sortable: true },
            { label: 'Running Time (in Minute)', key: 'inMinute', align: 'center', sortable: true },
            { label: 'Running Time (in Second)', key: 'inSecond', align: 'center', sortable: true },
            { label: 'Status', key: 'status', optionsParameter: { data: dataOptionStatus, keyLabel: 'display', keyCode: 'status' }, align: 'center', sortable: true, componentType: 'p-select' },
        ];

        this.endpointList.set('create', '/v2/scheduler/add-scheduler');
        this.endpointList.set('edit', '/v2/scheduler/edit-scheduler');
        this.endpointList.set('delete', '/v2/scheduler/delete-scheduler');
        this.endpointList.set('start', '/v2/scheduler/start-scheduler');
        this.endpointList.set('stop', '/v2/scheduler/stop-scheduler');
    }

    override onMainTableButtonClick(btn: any) {
        this.endpointUrl = this.endpointList.get(btn.type) || '';
        if (btn.type === 'create') {
            this.dialogVisible = true;
            this.dialogMode = btn.type;
            this.getConfigParameter(btn.type);
            return;
        }
        if (this.selectedRows.length > 0) {
            this.confirmationService.confirm({
                header: 'Are you sure?',
                message: 'Please confirm to proceed.',
                accept: () => {
                    this.requestService.postBackend(this.endpointUrl, this.selectedRows).subscribe({
                        next: async () => {
                            await this.delay(500);
                            this.reloadTableData = true;
                        }
                    });
                },
            });
        }
    }

    private getConfigParameter(mode: PermissionMode): void {
        const payload = {
            keyParameter: 'SCHEDULE'
        }
        this.requestService.postBackend('/v2/config-parameter/list-form-type', payload).subscribe({
            next: (res: any) => {
                const tempConfigParameterList = res.data ?? [];
                if (tempConfigParameterList.length === 0) {
                    this.requestService.displayMessageService('info', 'Information', 'Record quota for this menu already exceed');
                    return;
                }
                const currentDate = this.dateService.currentDate()
                const tempParamCode = tempConfigParameterList[0].paramCode;
                this.selectedRow = {
                    createdBy: '',
                    createdDate: currentDate,
                    updatedBy: '',
                    updatedDate: currentDate,
                    idScheduler: '',
                    name: tempParamCode,
                    description: '',
                    inHour: '*',
                    inMinute: '*',
                    inSecond: '*',
                    status: true,
                    typeName: tempParamCode
                }
                this.openDialogModal(mode);
            }
        });
    }
}
