import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TableUniversal } from '../../../components/table-universal/table-universal';
import { ParentComponent } from '../../../components/parent-component';
import { TableHeader } from '../../../../model/others/TableHeader';
import { TableButton } from '../../../../model/others/TableButton';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../../../services/request-service';
import { DateService } from '../../../services/date-service';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { OnlyBrowserDirective } from '../../../directives/only-browser.directive';
import { ResponseCode } from '../../../../backend/utils/responseCode';
import { RequestDetail } from '../../../../model/custom-entity/RequestDetail';
import { ExcelService } from '../../../services/excell-service';

@Component({
    standalone: true,
    selector: 'app-request-activity-list',
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, ButtonModule, TableUniversal, MessageModule, OnlyBrowserDirective, BreadcrumbModule],
    templateUrl: './request-activity-list.html',
    styleUrl: './request-activity-list.css',
})
export class RequestActivityList extends ParentComponent implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    requestLoggingForm!: FormGroup;
    loading = false;

    data?: RequestDetail[] = [];
    columns!: TableHeader[];
    reloadTableData: boolean = false;
    actionButtonList: TableButton[] = [];
    selectedRows: RequestDetail[] = [];
    mainButtonList: TableButton[] = [
        { label: 'Export', icon: 'pi pi-file-excel', severity: 'info', type: 'export' }
    ];

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly requestService: RequestService,
        private readonly dateService: DateService,
        private readonly excellService: ExcelService<RequestDetail>
    ) {
        super();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        const dateRange = this.dateService.getDateRangeWithTime(7);
        this.requestLoggingForm = this.formBuilder.group({
            selectedDate: [dateRange, Validators.required],
        });

        this.columns = [
            { label: 'Label Name', key: 'idaudit', sortable: true, displayAt: 'none' },
            { label: 'Username', key: 'username', sortable: true },
            { label: 'HTTP Method', key: 'httpmethod', sortable: true },
            { label: 'Response Status', key: 'responsestatus', sortable: true },
            { label: 'URL Request', key: 'requesturl', sortable: true },
            { label: 'Source Request', key: 'sourceRequest', sortable: true },
            { label: 'Requested Date', key: 'created_date', sortable: true, dateFormat: 'yyyy-MM-dd HH:mm:ss' },
        ];
    }

    ngOnInit(): void {
        this.reloadData();
    }

    private reloadData(): void {
        this.loading = true;
        const dateRange = this.requestLoggingForm.value;
        const payload = {
            selectedDate: [
                this.dateService.format(dateRange.selectedDate[0], 'yyyy-MM-dd HH:mm:ss'),
                this.dateService.format(dateRange.selectedDate[1], 'yyyy-MM-dd HH:mm:ss'),
            ]
        };
        this.requestService.postBackend('/v2/report-file/request-list', payload).subscribe({
            next: (res: any) => {
                if (res.code === ResponseCode.SUCCESS) {
                    this.data = res.data;
                    this.loading = false;
                    return;
                }
                const tempSeverity = res.code === ResponseCode.SUCCESS ? 'success' : 'error';
                const tempHeaderTitle = res.code === ResponseCode.SUCCESS ? 'Success' : 'Error';
                const tempDetailMessage = res.message;
                this.requestService.displayMessageService(tempSeverity, tempHeaderTitle, tempDetailMessage);
            },
        });
    }

    onSubmit() {
        if (this.requestLoggingForm.invalid) {
            this.requestLoggingForm.markAllAsTouched();
            return;
        }
        this.reloadData();
    }

    async onMainTableButtonClick(btn: any) {
        const headerColumns = this.columns.filter(col => !col.displayAt || col.displayAt !== 'none');
        await this.excellService.exportToExcel(headerColumns, this.selectedRows, this.currentMenuLabel);
    }
}
