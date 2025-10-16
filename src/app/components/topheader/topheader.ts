import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../services/layout-service';

@Component({
    standalone: true,
    selector: 'app-topheader',
    imports: [RouterModule, ButtonModule],
    templateUrl: './topheader.html',
    styleUrl: './topheader.css',
})
export class Topheader {
    @Input() fullName: string = '';

    constructor(protected layoutService: LayoutService) {}
}
