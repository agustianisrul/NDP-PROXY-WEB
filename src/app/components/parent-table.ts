import { Directive } from '@angular/core';
import { PermissionMode, TableButton } from '../../model/others/TableButton';
import { TableHeader } from '../../model/others/TableHeader';
import { ParentComponent } from './parent-component';

@Directive({
    selector: '[appParentTable]',
})
export abstract class ParentTable<T> extends ParentComponent {
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

    override ngOnInit(): void {
        super.ngOnInit();

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
        this.dialogVisible = true;
        this.dialogMode = btn.type;
        this.endpointUrl = this.endpointList.get(btn.type) || '';
    }

    onRowTableButtonClick(event: any) {
        this.dialogVisible = true;
        this.dialogMode = event.type;
        this.selectedRow = event.row;
        this.endpointUrl = this.endpointList.get(event.type) || '';
    }

    protected handleSave() {
        this.reloadTableData = true;
    }
}
