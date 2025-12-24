import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuRole } from '../../../model/custom-entity/MenuRole';
import { ConfirmDelete } from '../../components/confirm-delete/confirm-delete';
import { ParentTable } from '../../components/parent-table';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-menumanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, ConfirmDelete],
    templateUrl: './menumanagement.html',
    styleUrl: './menumanagement.css',
    providers: [ConfirmationService, DialogService],
})
export class Menumanagement extends ParentTable<MenuRole> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: this.currentMenuLabel }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idMenu', sortable: true, displayAt: 'none' },
            { label: 'Label Name', key: 'nameMenu', sortable: true, validators: { required: true } },
            { label: 'URL Link', key: 'pathMenu', sortable: true, displayAt: 'table' },
            {
                label: 'Icon Code',
                key: 'iconMenu',
                sortable: true,
                labelUsingIcon: true,
                componentType: 'p-select',
                optionsParameter: { url: '/v2/menu/list-icon', keyLabel: 'description', keyCode: 'code' },
            },
            {
                label: 'Permission Available',
                key: 'roleList',
                displayAt: ['create', 'edit'],
                componentType: 'p-multiselect',
                optionsParameter: { url: '/v2/role/list-role', keyLabel: 'rolename' },
            },
        ];
        this.endpointList.set('create', '/v2/menu/add-menu');
        this.endpointList.set('edit', '/v2/menu/edit-menu');
        this.endpointList.set('delete', '/v2/menu/delete-menu');
    }
}
