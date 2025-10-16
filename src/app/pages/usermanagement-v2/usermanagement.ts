import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableHeader } from '../../../model/others/TableHeader';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-usermanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule],
    templateUrl: './usermanagement.html',
    styleUrl: './usermanagement.css',
})
export class Usermanagement implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;
    columns: TableHeader[] = [
        { label: 'Username', key: 'username' },
        { label: 'Full Name', key: 'fullname' },
        { label: 'Mobile Number', key: 'mobile' },
        { label: 'E-Mail', key: 'email' },
        { label: 'User Admin', key: 'isAdmin', type: 'number', values: { 0: '❌', 1: '✅' }, align: 'center' },
    ];

    constructor() {}

    ngOnInit(): void {
        this.breaditems = [{ label: 'Users' }];
        this.home = { icon: 'pi pi-home', routerLink: '/' };
    }
}
