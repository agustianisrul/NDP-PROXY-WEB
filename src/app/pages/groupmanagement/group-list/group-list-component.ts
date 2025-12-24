import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { TableUniversal } from '../../../components/table-universal/table-universal';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { ParentTable } from '../../../components/parent-table';
import { GroupDetail } from '../../../../model/custom-entity/GroupDetail';
import { PermissionMode } from '../../../../model/others/TableButton';
import { ConfigParameter } from '../../../../model/surrounding/ConfigParameter';
import { GroupDetailComponent } from '../group-detail/group-detail-component';

@Component({
    standalone: true,
    selector: 'app-group-list',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './group-list-component.html',
    styleUrl: './group-list-component.css',
    providers: [ConfirmationService, DialogService],
})
export class GroupListComponent extends ParentTable<GroupDetail> implements OnInit {
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
                displayAt: ['create', 'edit', 'view', 'delete'],
                componentType: 'tree-menu-picker',
                optionsParameter: { url: '/v2/menu/list-menu-role', keyLabel: 'nameMenu' },
            },
        ];

        this.endpointList.set('create', '/v2/group/add-group');
        this.endpointList.set('edit', '/v2/group/edit-group');
        this.endpointList.set('delete', '/v2/group/delete-group');
    }

    override onMainTableButtonClick(btn: any) {
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
                    this.requestService.postBackend(this.endpointUrl, this.selectedRows).subscribe();
                },
            });
        }
    }

    override openDialogModal(mode: PermissionMode): void {
        const tempMode = mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
        const tempHeader = mode === 'create' ? `${tempMode}` : `${tempMode} ${this.selectedRow.groupname}`
        const dialogRef = this.dialogService.open(GroupDetailComponent, {
            header: `${tempHeader}`,
            width: '70rem',
            data: {
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

    override onRowTableButtonClick(event: any) {
        this.dialogVisible = true;
        this.dialogMode = event.type;
        this.selectedRow = event.row;
        this.endpointUrl = this.endpointList.get(event.type) || '';
        this.openDialogModal(event.type);
    }
}
