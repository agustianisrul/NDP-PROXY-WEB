import { Directive, inject, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { PermissionMode, TableButton } from '../../model/others/TableButton';
import { TableHeader } from '../../model/others/TableHeader';
import { RequestService } from '../services/request-service';
import { DialogDetail } from './dialog-detail/dialog-detail';
import { ParentComponent } from './parent-component';

@Directive({
    selector: '[appParentTable]',
})
export abstract class ParentTable<T> extends ParentComponent implements OnInit {
    // global service
    protected readonly confirmationService = inject(ConfirmationService);
    protected readonly requestService = inject(RequestService);
    protected readonly dialogService = inject(DialogService);
    // for table attribute
    protected columns!: TableHeader[];
    protected mainButtonList: TableButton[] = [];
    protected actionButtonList: TableButton[] = [];
    protected showCheckbox: boolean = true;
    protected reloadTableData: boolean = false;
    // for detail attribute
    protected dialogVisible = false;
    protected dialogMode: PermissionMode = 'create';
    protected selectedRow!: T;
    protected selectedRows: T[] = [];
    protected endpointUrl: string = '';
    // global attribute
    protected endpointList = new Map<string, string>();

    ngOnInit(): void {
        this.actionButtonList = [{ label: 'View', icon: 'pi pi-eye', severity: 'primary', type: 'view' }];

        if (this.hasRole('CREATE')) {
            this.mainButtonList.push({ label: 'Create', icon: 'pi pi-plus', severity: 'success', type: 'create' });
        }

        if (this.hasRole('EDIT')) {
            this.actionButtonList.push({ label: 'Edit', icon: 'pi pi-pencil', severity: 'warn', type: 'edit' });
        }

        if (this.hasRole('DELETE')) {
            this.mainButtonList.push({ label: 'Delete', icon: 'pi pi-trash', severity: 'danger', type: 'delete' });
            this.actionButtonList.push({ label: 'Delete', icon: 'pi pi-trash', severity: 'danger', type: 'delete' });
        }

        if (this.hasRole('START')) {
            this.actionButtonList.push({ label: 'Start', icon: 'pi pi-play', severity: 'success', type: 'start' });
        }

        if (this.hasRole('STOP')) {
            this.actionButtonList.push({ label: 'Stop', icon: 'pi pi-stop', severity: 'warn', type: 'stop' });
        }
    }

    onMainTableButtonClick(btn: any) {
        this.endpointUrl = this.endpointList.get(btn.type) || '';
        if (btn.type === 'create') {
            this.dialogVisible = true;
            this.dialogMode = btn.type;
            this.openDialogModal(btn.type);
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

    openDialogModal(mode: PermissionMode): void {
        const tempMode = mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
        const dialogRef = this.dialogService.open(DialogDetail, {
            header: `${tempMode} ${this.currentMenuLabel}`,
            data: {
                visible: true,
                headers: this.columns,
                model: this.selectedRow,
                mode: mode,
                endpoint: this.endpointList.get(mode) || '',
            },
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            dismissableMask: true,
            closeOnEscape: true,
            modal: true,
        });

        // Handle dialog close if needed
        dialogRef?.onClose.subscribe(async () => {
            await this.delay(500);
            this.reloadTableData = true;
        });
    }

    protected delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onRowTableButtonClick(event: any) {
        this.dialogVisible = true;
        this.dialogMode = event.type;
        this.selectedRow = event.row;
        this.endpointUrl = this.endpointList.get(event.type) || '';
        this.openDialogModal(event.type);
    }

    protected onReloadComplete() {
        this.reloadTableData = false;
    }
}
