import { Component } from '@angular/core';
import { BarChart } from '../../components/bar-chart/bar-chart';
import { StatisticWidget } from '../../components/statistic-widget/statistic-widget';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [StatisticWidget, BarChart],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
})
export class Dashboard {}
