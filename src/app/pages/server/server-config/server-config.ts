import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ParentComponent } from '../../../components/parent-component';
import { RequestService } from '../../../services/request-service';

@Component({
    selector: 'app-server-config',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './server-config.html',
    styleUrl: './server-config.css',
})
export class ServerConfig extends ParentComponent implements OnInit {
    private readonly requestService = inject(RequestService);

    override ngOnInit(): void {}
}
