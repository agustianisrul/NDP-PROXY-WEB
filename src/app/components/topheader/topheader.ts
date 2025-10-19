import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../services/layout-service';
import { ParentComponent } from '../parent-component';

@Component({
    standalone: true,
    selector: 'app-topheader',
    imports: [ButtonModule],
    templateUrl: './topheader.html',
    styleUrl: './topheader.css',
})
export class Topheader extends ParentComponent {
    public layoutService = inject(LayoutService);
}
