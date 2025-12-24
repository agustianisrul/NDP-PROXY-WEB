import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule, TabPanels, TabPanel } from 'primeng/tabs';
import { OnlyBrowserDirective } from '../../../directives/only-browser.directive';
import { ParentComponent } from '../../../components/parent-component';
import { RequestService } from '../../../services/request-service';
import { ServerConfig } from '../../../../model/surrounding/ServerConfig';
import { ResponseConfig } from '../../../../model/surrounding/ResponseConfig';
import { TableUniversal } from '../../../components/table-universal/table-universal';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterModule } from '@angular/router';
import { ConfirmDelete } from '../../../components/confirm-delete/confirm-delete';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ParentTable } from '../../../components/parent-table';
import { PermissionMode } from '../../../../model/others/TableButton';
import { DialogDetail } from '../../../components/dialog-detail/dialog-detail';
import { ConfigDetail } from '../config-detail/config-detail';
import { ConfigParameter } from '../../../../model/surrounding/ConfigParameter';
import { ResponseCode } from '../../../../backend/utils/responseCode';

@Component({
    selector: 'app-config-component',
    standalone: true,
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './config-component.html',
    styleUrl: './config-component.css',
    providers: [ConfirmationService, DialogService],
})
export class ConfigComponent extends ParentTable<ResponseConfig> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idConfigMain', sortable: true, displayAt: 'none' },
            { label: 'Key Group', key: 'keyGroup', sortable: true, validators: { required: true } },
        ];

        this.endpointList.set('create', '/v2/config-server/create-config');
        this.endpointList.set('edit', '/v2/config-server/edit-config');
        this.endpointList.set('delete', '/v2/config-server/delete-config');
    }

    override onMainTableButtonClick(btn: any) {
        this.endpointUrl = this.endpointList.get(btn.type) || '';
        if (btn.type === 'create') {
            this.dialogVisible = true;
            this.dialogMode = btn.type;
            this.getConfigParameter(btn);
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

    override openDialogModal(mode: PermissionMode, configList: ConfigParameter[] = []): void {
        const tempMode = mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
        const tempHeader = mode === 'create' ? `${tempMode}` : `${tempMode} ${this.selectedRow.keyGroup}`
        const dialogRef = this.dialogService.open(ConfigDetail, {
            header: `${tempHeader}`,
            data: {
                headers: this.columns,
                model: this.selectedRow,
                configList: configList,
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

    private getConfigParameter(btn: any): void {
        const payload = {
            keyParameter: 'CONFIG_SERVER'
        }
        this.requestService.postBackend('/v2/config-parameter/list-form-type', payload).subscribe({
            next: (res: any) => {
                const tempConfigParameterList = res.data ?? [];
                if (tempConfigParameterList.length === 0) {
                    this.requestService.displayMessageService('info', 'Information', 'Record quota for this menu already exceed');
                    return;
                }
                this.openDialogModal(btn.type, tempConfigParameterList);
            }
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
