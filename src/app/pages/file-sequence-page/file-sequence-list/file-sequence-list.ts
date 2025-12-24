import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableUniversal } from '../../../components/table-universal/table-universal';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterModule } from '@angular/router';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ParentTable } from '../../../components/parent-table';
import { FileSequence } from '../../../../model/surrounding/FileSequence';

@Component({
  standalone: true,
  selector: 'app-file-sequence-list',
  imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
  templateUrl: './file-sequence-list.html',
  styleUrl: './file-sequence-list.css',
  providers: [ConfirmationService, DialogService],
})
export class FileSequenceList extends ParentTable<FileSequence> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idFileSequence', sortable: true, displayAt: 'none' },
            { label: 'File Name', key: 'fileName', sortable: true },
            { label: 'Priority', key: 'priority', sortable: true, componentType: 'p-inputnumber', align: 'center' },
        ];

        this.endpointList.set('create', '/v2/file-priority/add-file');
        this.endpointList.set('edit', '/v2/file-priority/edit-file');
        this.endpointList.set('delete', '/v2/file-priority/delete-file');
    }

    override onMainTableButtonClick(btn: any) {
        this.endpointUrl = this.endpointList.get(btn.type) || '';
        if (btn.type === 'create') {
            if (this.selectedRows.length > 1) {
                this.requestService.displayMessageService('info', 'Information', 'Record quota for this menu already exceed');
                return;
            }
            this.dialogVisible = true;
            this.dialogMode = btn.type;
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
}
