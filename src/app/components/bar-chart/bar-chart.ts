import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@Component({
    standalone: true,
    selector: 'app-bar-chart',
    imports: [ChartModule, CardModule],
    templateUrl: './bar-chart.html',
    styleUrl: './bar-chart.css',
})
export class BarChart implements OnInit {
    data: any;

    options: any;

    platformId = inject(PLATFORM_ID);

    constructor(private cd: ChangeDetectorRef) {}

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.data = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                    {
                        label: 'My First dataset',
                        backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                        borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                        data: [65, 59, 80, 81, 56, 55, 40],
                    },
                    {
                        label: 'My Second dataset',
                        backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
                        borderColor: documentStyle.getPropertyValue('--p-gray-500'),
                        data: [28, 48, 40, 19, 86, 27, 90],
                    },
                ],
            };

            this.options = {
                // indexAxis: 'y', // for horizontal, for vertical just comment this statement
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: {
                                weight: 500,
                            },
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false,
                        },
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false,
                        },
                    },
                },
            };
            this.cd.markForCheck();
        }
    }
}
