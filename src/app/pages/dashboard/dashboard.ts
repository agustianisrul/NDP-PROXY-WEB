import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartData } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { TableButton } from '../../../model/others/TableButton';
import { TableHeader } from '../../../model/others/TableHeader';
import { DashboardData } from '../../../model/surrounding/DashboardData';
import { DashboardDetail } from '../../../model/surrounding/DashboardDetail';
import { DashboardChart } from '../../components/dashboard-chart/dashboard-chart';
import { StatisticWidget } from '../../components/statistic-widget/statistic-widget';
import { TableUniversal } from '../../components/table-universal/table-universal';
import { DateService } from '../../services/date-service';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [StatisticWidget, ReactiveFormsModule, DatePickerModule, ButtonModule, MessageModule, DashboardChart, TableUniversal],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
    dashboardForm!: FormGroup;
    loading = false;
    dashboardData: DashboardData = {
        totalComplete: 0,
        totalDownload: 0,
        totalPending: 0,
        totalUpload: 0,
        detail: [],
        fileList: [],
    };
    chartData!: ChartData;
    // for table attribute
    columns!: TableHeader[];
    mainButtonList: TableButton[] = [];
    actionButtonList: TableButton[] = [];
    showCheckbox: boolean = false;
    reloadTableData: boolean = false;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly requestService: RequestService,
        private readonly dateService: DateService
    ) {
        const currentDate = this.dateService.currentDate();
        this.dashboardForm = this.formBuilder.group({
            selectedDate: [[currentDate, currentDate], Validators.required],
        });

        this.columns = [
            { label: 'File Name', key: 'fileName', sortable: true },
            { label: 'Action', key: 'action', sortable: true },
            { label: 'Status', key: 'status', sortable: true },
            { label: 'Processing Date', key: 'updatedDate', sortable: true, type: 'date', format: 'yyyy-MM-dd' },
        ];
    }

    ngOnInit(): void {
        this.reloadData();
    }

    private reloadData(): void {
        this.loading = true;
        this.requestService.postBackend('/v2/dashboard/list-dashboard', this.dashboardForm.value).subscribe({
            next: (res: any) => {
                this.dashboardData = res.data;
                if (this.dashboardData?.detail?.length > 1) {
                    this.chartData = {
                        labels: this.dashboardData.detail.map((item: DashboardDetail) => this.dateService.format(item.periode, 'yyyy-MM-dd')),
                        datasets: [
                            {
                                label: 'Total Uploaded',
                                data: this.dashboardData.detail.map((item: DashboardDetail) => item.totalUpload),
                                fill: true,
                                backgroundColor: '#3B82F6',
                                tension: 0.4,
                            },
                            {
                                label: 'Total Downloaded',
                                data: this.dashboardData.detail.map((item: DashboardDetail) => item.totalDownload),
                                fill: true,
                                backgroundColor: '#EF4444',
                                tension: 0.4,
                            },
                            {
                                label: 'Total Completed',
                                data: this.dashboardData.detail.map((item: DashboardDetail) => item.totalComplete),
                                fill: true,
                                backgroundColor: '#10B981',
                                tension: 0.4,
                            },
                            {
                                label: 'Total Pending Upload',
                                data: this.dashboardData.detail.map((item: DashboardDetail) => item.totalPending),
                                fill: true,
                                backgroundColor: '#F59E0B',
                                tension: 0.4,
                            },
                        ],
                    };
                } else if (this.dashboardData?.detail?.length === 1) {
                    this.chartData = {
                        labels: ['Total Uploaded', 'Total Downloaded', 'Total Completed', 'Total Pending Upload'],
                        datasets: [
                            {
                                data: [
                                    this.dashboardData.totalUpload,
                                    this.dashboardData.totalDownload,
                                    this.dashboardData.totalComplete,
                                    this.dashboardData.totalPending,
                                ],
                                backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
                            },
                        ],
                    };
                } else {
                    this.dashboardData = {
                        totalComplete: 0,
                        totalDownload: 0,
                        totalPending: 0,
                        totalUpload: 0,
                        detail: [],
                        fileList: [],
                    };
                    this.chartData = {
                        labels: ['Total Uploaded', 'Total Downloaded', 'Total Completed', 'Total Pending Upload'],
                        datasets: [
                            {
                                data: [0, 0, 0, 0],
                                backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
                            },
                        ],
                    };
                }
                this.loading = false;
            },
            error: () => {
                this.dashboardData = {
                    totalComplete: 0,
                    totalDownload: 0,
                    totalPending: 0,
                    totalUpload: 0,
                    detail: [],
                    fileList: [],
                };
                this.loading = false;
            },
        });
    }

    onSubmit() {
        if (this.dashboardForm.invalid) {
            this.dashboardForm.markAllAsTouched();
            return;
        }
        this.reloadData();
    }
}
