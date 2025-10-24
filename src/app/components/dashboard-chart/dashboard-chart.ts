import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@Component({
    standalone: true,
    selector: 'app-dashboard-chart',
    imports: [ChartModule, CardModule],
    templateUrl: './dashboard-chart.html',
    styleUrl: './dashboard-chart.css',
})
export class DashboardChart implements OnChanges {
    @Input() type: ChartType = 'bar'; // default type
    @Input() data: ChartData = { labels: [], datasets: [] };
    @Input() options?: ChartOptions;

    chartType!: ChartType;
    chartData!: ChartData;
    chartOptions!: ChartOptions;

    ngOnChanges(changes: SimpleChanges): void {
        this.chartType = this.type;
        this.chartData = this.data;
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: false, text: 'Dynamic Chart Example' },
            },
            ...this.options,
        };
    }
}
