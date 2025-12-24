import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
import { ChartData } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { ResponseCode } from '../../../backend/utils/responseCode';
import { TableButton } from '../../../model/others/TableButton';
import { TableHeader } from '../../../model/others/TableHeader';
import { DashboardData } from '../../../model/surrounding/DashboardData';
import { DashboardDetail } from '../../../model/surrounding/DashboardDetail';
import { DashboardChart } from '../../components/dashboard-chart/dashboard-chart';
import { StatisticWidget } from '../../components/statistic-widget/statistic-widget';
import { TableUniversal } from '../../components/table-universal/table-universal';
import { DateService } from '../../services/date-service';
import { RequestService } from '../../services/request-service';
import { Subject, Subscription, interval, timer } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ParentComponent } from '../../components/parent-component';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [StatisticWidget, ReactiveFormsModule, DatePickerModule, ButtonModule, MessageModule, DashboardChart, TableUniversal, CommonModule],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
})
export class Dashboard extends ParentComponent implements OnInit, OnDestroy {
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
    actionButtonList: TableButton[] = [];
    showCheckbox: boolean = false;
    reloadTableData: boolean = false;
    
    // Auto-refresh properties
    autoRefreshEnabled: boolean = true; // Auto-start by default
    autoRefreshInterval: number = 30000; // 30 seconds
    autoRefreshSubscription?: Subscription;
    countdownSubscription?: Subscription;
    routerSubscription?: Subscription;
    refreshCountdown: number = 30; // Start at 30 seconds
    private destroy$ = new Subject<void>();
    private lastRefreshTime: Date = new Date();
    private nextRefreshTime: Date = new Date();

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly requestService: RequestService,
        private readonly dateService: DateService,
    ) {
        super();
        const currentDate = this.dateService.currentDate();
        this.dashboardForm = this.formBuilder.group({
            selectedDate: [[currentDate, currentDate], Validators.required],
        });

        this.columns = [
            { label: 'File Name', key: 'fileName', sortable: true },
            { label: 'Action', key: 'action', sortable: true },
            { label: 'Status', key: 'status', sortable: true },
            { label: 'Processing Date', key: 'updatedDate', sortable: true, dateFormat: 'yyyy-MM-dd' },
        ];
    }

    ngOnInit(): void {
        this.autoRefreshInterval = this.dashboardAutoRefresh || 30000;
        // Start auto-refresh immediately when component initializes
        this.startAutoRefresh();
        this.setupRouterListener();
        
        // Listen for form changes to detect date period changes
        this.dashboardForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                // Mark that form is dirty
                this.dashboardForm.markAsDirty();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopAutoRefresh();
        this.cleanupSubscriptions();
    }

    private setupRouterListener(): void {
        // Listen for navigation events to stop auto-refresh when leaving the page
        this.routerSubscription = this.router.events
            .pipe(
                filter(event => event instanceof NavigationStart),
                takeUntil(this.destroy$)
            )
            .subscribe((event: NavigationStart) => {
                // Check if we're navigating away from the dashboard
                if (!event.url.includes('/dashboard')) {
                    this.stopAutoRefresh();
                }
            });
    }

    private cleanupSubscriptions(): void {
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
        }
        if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
        }
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }

    private reloadData(): void {
        this.loading = true;
        this.lastRefreshTime = new Date();
        this.nextRefreshTime = new Date(this.lastRefreshTime.getTime() + this.autoRefreshInterval);
        
        const dateRange = this.dashboardForm.value;
        const payload = {
            selectedDate: [
                this.dateService.currentDateStartDay(dateRange.selectedDate[0], 'yyyy-MM-dd HH:mm:ss'),
                this.dateService.currentDateEndDay(dateRange.selectedDate[1], 'yyyy-MM-dd HH:mm:ss'),
            ]
        };
        
        this.requestService.postBackend('/v2/dashboard/list-dashboard', payload).subscribe({
            next: (res: any) => {
                this.dashboardData = res.data;
                this.updateChartData();
                this.loading = false;
            },
            error: (error) => {
                this.dashboardData = {
                    totalComplete: 0,
                    totalDownload: 0,
                    totalPending: 0,
                    totalUpload: 0,
                    detail: [],
                    fileList: [],
                };
                this.updateChartData();
                this.loading = false;
            },
        });
    }

    private updateChartData(): void {
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
    }

    // Auto-refresh methods
    startAutoRefresh(): void {
        if (this.autoRefreshEnabled) {
            // Load data immediately first
            this.reloadData();
            
            // Start the countdown timer
            this.startCountdownTimer();
            
            // Start auto-refresh interval
            this.autoRefreshSubscription = interval(this.autoRefreshInterval)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.reloadData();
                        // Reset countdown after each refresh
                        this.startCountdownTimer();
                    }
                });
        }
    }

    private startCountdownTimer(): void {
        // Clear existing countdown
        if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
        }
        
        this.refreshCountdown = this.autoRefreshInterval / 1000;
        
        this.countdownSubscription = interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.refreshCountdown--;
                if (this.refreshCountdown <= 0) {
                    this.refreshCountdown = this.autoRefreshInterval / 1000;
                }
            });
    }

    stopAutoRefresh(): void {
        this.autoRefreshEnabled = false;
        
        if (this.autoRefreshSubscription) {
            this.autoRefreshSubscription.unsubscribe();
            this.autoRefreshSubscription = undefined;
        }
        
        if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
            this.countdownSubscription = undefined;
        }
        
        this.refreshCountdown = 0;
    }

    toggleAutoRefresh(): void {
        if (this.autoRefreshEnabled) {
            this.stopAutoRefresh();
        } else {
            this.autoRefreshEnabled = true;
            this.startAutoRefresh();
        }
    }

    setRefreshInterval(seconds: number): void {
        this.autoRefreshInterval = seconds * 1000;
        if (this.autoRefreshEnabled) {
            this.restartAutoRefresh();
        }
    }

    restartAutoRefresh(): void {
        this.stopAutoRefresh();
        this.autoRefreshEnabled = true;
        this.startAutoRefresh();
    }

    getLastRefreshTime(): string {
        return this.lastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    getNextRefreshTime(): string {
        return this.nextRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    getTimeUntilNextRefresh(): number {
        const now = new Date();
        const diffMs = this.nextRefreshTime.getTime() - now.getTime();
        return Math.max(0, Math.floor(diffMs / 1000));
    }

    onSubmit() {
        if (this.dashboardForm.invalid) {
            this.dashboardForm.markAllAsTouched();
            return;
        }
        
        // Mark form as pristine since we're applying changes
        this.dashboardForm.markAsPristine();
        
        // Restart auto-refresh to reset the timer
        if (this.autoRefreshEnabled) {
            this.restartAutoRefresh();
        } else {
            // If auto-refresh is disabled, just reload data
            this.reloadData();
        }
    }

    // Manual refresh button handler
    onManualRefresh(): void {
        if (this.autoRefreshEnabled) {
            this.restartAutoRefresh();
        } else {
            this.reloadData();
        }
    }

    onRowTableButtonClick(event: any) {
        this.requestService.postBackend('/v2/dashboard/list-dashboard', event.row).subscribe({
            next: (res: any) => {
                const tempSeverity = res.code === ResponseCode.SUCCESS ? 'success' : 'error';
                const tempHeaderTitle = res.code === ResponseCode.SUCCESS ? 'Success' : 'Error';
                const tempDetailMessage = res.message;
                this.requestService.displayMessageService(tempSeverity, tempHeaderTitle, tempDetailMessage);
            },
            error: (error) => {
                this.requestService.displayMessageService('error', 'Request Failed', error?.error?.message || error?.message || 'Unknown error');
            },
        });
    }
}