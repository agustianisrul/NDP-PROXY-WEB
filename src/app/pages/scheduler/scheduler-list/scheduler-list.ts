import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableButton } from '../../../../model/others/TableButton';
import { TableHeader } from '../../../../model/others/TableHeader';
import { ParentComponent } from '../../../components/parent-component';
import { TableUniversal } from '../../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-scheduler-list',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule],
    templateUrl: './scheduler-list.html',
    styleUrl: './scheduler-list.css',
})
export class SchedulerList extends ParentComponent implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;
    columns: TableHeader[] = [
        { label: 'Scheduler Name', key: 'name' },
        { label: 'Description', key: 'description' },
        { label: 'Running Time (in Hour)', key: 'inHour', align: 'center' },
        { label: 'Running Time (in Minute)', key: 'inMinute', align: 'center' },
        { label: 'Running Time (in Second)', key: 'inSecond', align: 'center' },
        { label: 'Status', key: 'status', type: 'boolean', values: { false: '❌', true: '✅' }, align: 'center' },
    ];
    stateData = signal<any>(null);
    mainButtonList: TableButton[] = [];
    actionButtonList: TableButton[] = [];

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: 'Scheduler' }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.actionButtonList = [
            {
                label: 'View',
                icon: 'pi pi-eye',
                severity: 'primary',
                alwaysEnabled: true,
                action: (row) => this.onViewActionRecord(row),
            },
        ];

        if (this.hasRole('CREATE')) {
            this.mainButtonList.push({
                label: 'Create',
                icon: 'pi pi-plus',
                severity: 'success',
                alwaysEnabled: true,
                action: () => this.onCreateRecord(),
            });
        }

        if (this.hasRole('EDIT')) {
            this.actionButtonList.push({
                label: 'Edit',
                icon: 'pi pi-pencil',
                severity: 'warn',
                alwaysEnabled: true,
                action: (row) => this.onEditActionRecord(row),
            });
        }

        if (this.hasRole('DELETE')) {
            this.mainButtonList.push({
                label: 'Delete',
                icon: 'pi pi-trash',
                severity: 'danger',
                alwaysEnabled: false,
                action: () => this.onDeleteRecord(),
            });
            this.actionButtonList.push({
                label: 'Delete',
                icon: 'pi pi-trash',
                severity: 'danger',
                alwaysEnabled: false,
                action: (row) => this.onDeleteActionRecord(row),
            });
        }

        if (this.hasRole('START')) {
            this.actionButtonList.push({
                label: 'Start',
                icon: 'pi pi-play',
                severity: 'success',
                alwaysEnabled: false,
                action: (row) => this.onStartActionRecord(row),
            });
        }

        if (this.hasRole('STOP')) {
            this.actionButtonList.push({
                label: 'Stop',
                icon: 'pi pi-stop',
                severity: 'warn',
                alwaysEnabled: false,
                action: (row) => this.onStopActionRecord(row),
            });
        }
    }

    onCreateRecord() {
        console.log('Create clicked');
    }

    onDeleteRecord() {
        console.log('Delete clicked');
    }

    onViewActionRecord(row: any) {}

    onEditActionRecord(row: any) {}

    onDeleteActionRecord(row: any) {}

    onStartActionRecord(row: any) {}

    onStopActionRecord(row: any) {}
}
