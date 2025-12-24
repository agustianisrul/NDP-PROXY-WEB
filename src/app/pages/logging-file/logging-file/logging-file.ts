import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { OnlyBrowserDirective } from '../../../directives/only-browser.directive';
import { ResponseCode } from '../../../../backend/utils/responseCode';
import { TableButton } from '../../../../model/others/TableButton';
import { TableHeader } from '../../../../model/others/TableHeader';
import { FileActivity, FileLogging } from '../../../../model/surrounding/ReportLogging';
import { ParentComponent } from '../../../components/parent-component';
import { TableUniversal } from '../../../components/table-universal/table-universal';
import { DateService } from '../../../services/date-service';
import { RequestService } from '../../../services/request-service';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ExcelService } from '../../../services/excell-service';

@Component({
    selector: 'app-logging-file',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DatePickerModule, ButtonModule, TableUniversal, MessageModule, OnlyBrowserDirective, BreadcrumbModule],
    templateUrl: './logging-file.html',
    styleUrl: './logging-file.css',
})
export class LoggingFile extends ParentComponent implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    reportLoggingForm!: FormGroup;
    loading = false;

    data?: FileActivity[] = [];
    columns!: TableHeader[];
    selectedRows: FileActivity[] = [];
    mainButtonList: TableButton[] = [
        { label: 'Export', icon: 'pi pi-file-excel', severity: 'info', type: 'export' }
    ];
    actionButtonList: TableButton[] = [
        { label: 'View Log', icon: 'pi pi-eye', severity: 'primary', type: 'view' },
        { label: 'Resend', icon: 'pi pi-send', severity: 'primary', type: 'create' },
    ];
    showCheckbox: boolean = false;
    reloadTableData: boolean = false;

    dataLogging?: FileLogging[] = [];
    columnsLogging!: TableHeader[];
    actionButtonLoggingList: TableButton[] = [];
    reloadTableLoggingData: boolean = false;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly requestService: RequestService,
        private readonly dateService: DateService,
        private readonly excellService: ExcelService<FileActivity>
    ) {
        super();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        const currentDate = this.dateService.currentDate();
        this.reportLoggingForm = this.formBuilder.group({
            selectedDate: [[currentDate, currentDate], Validators.required],
        });

        this.columns = [
            { label: 'File Name', key: 'file_name', sortable: true },
            { label: 'Action', key: 'action', sortable: true },
            { label: 'Status', key: 'status', sortable: true },
        ];

        this.columnsLogging = [
            { label: 'Created By', key: 'fullname', sortable: true },
            { label: 'Action Log', key: 'action_log', sortable: true },
            { label: 'Source Path', key: 'source_path', sortable: true },
            { label: 'Target Path', key: 'target_path', sortable: true },
            { label: 'Created Date', key: 'updated_date', sortable: true, dateFormat: 'yyyy-MM-dd' },
        ];
    }

    ngOnInit(): void {
        this.reloadData();
    }

    private reloadData(): void {
        this.loading = true;
        const dateRange = this.reportLoggingForm.value;
        const payload = {
            selectedDate: [
                this.dateService.currentDateStartDay(dateRange.selectedDate[0], 'yyyy-MM-dd HH:mm:ss'),
                this.dateService.currentDateEndDay(dateRange.selectedDate[1], 'yyyy-MM-dd HH:mm:ss'),
            ]
        };
        this.requestService.postBackend('/v2/report-file/file-list', payload).subscribe({
            next: (res: any) => {
                if (res.code === ResponseCode.SUCCESS) {
                    this.data = res.data.fileList;
                    this.dataLogging = this.data?.length ? this.data[0].file_logging : [];
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
        if (this.reportLoggingForm.invalid) {
            this.reportLoggingForm.markAllAsTouched();
            return;
        }
        this.reloadData();
    }

    onRowTableButtonClick(event: any) {
        if (event.type === 'create') {
            if (event.row.file_logging.length === 0) {
                this.requestService.displayMessageService('warn', 'Information', 'No logs available to resend.');
                return;
            }
            const isBackupOrDelete = event.row.file_logging.find((item: FileLogging) => ['BACKUP', 'DELETE'].includes(item.action_log));
            if (isBackupOrDelete) {
                this.requestService.displayMessageService('warn', 'Information', 'Cannot resend a deleted or backed up file.');
                return;
            }
            this.requestService.postBackend('/v2/report-file/resend', event.row).subscribe({
                next: (res: any) => {
                    if (res.code === ResponseCode.SUCCESS) {
                        this.requestService.displayMessageService('success', 'Success', res.message);
                    }
                }
            });
        } else {
            this.dataLogging = event.row.file_logging;
        }
    }

    async onMainTableButtonClick(btn: any) {
        const tempColumnsLogging = this.columnsLogging.map(col => ({ ...col, key: `file_logging.${col.key}`}));
        const columnHeaders = [...this.columns, ...tempColumnsLogging];
        await this.excellService.exportToExcel(columnHeaders, this.selectedRows, this.currentMenuLabel, 'file_logging');
    }
}
