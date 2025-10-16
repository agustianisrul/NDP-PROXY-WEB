import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
    standalone: true,
    selector: 'app-statistic-widget',
    imports: [CommonModule, CardModule],
    templateUrl: './statistic-widget.html',
    styleUrl: './statistic-widget.css',
})
export class StatisticWidget {
    @Input() label: string = '';
    @Input() value: number | string = '';
    @Input() icon: string = '';
    @Input() color: string = 'blue';
}
