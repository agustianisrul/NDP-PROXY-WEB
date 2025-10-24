import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuRole } from '../../../model/custom-entity/MenuRole';
import { DialogDetail } from '../../components/dialog-detail/dialog-detail';
import { ParentTable } from '../../components/parent-table';
import { TableUniversal } from '../../components/table-universal/table-universal';

@Component({
    standalone: true,
    selector: 'app-menumanagement',
    imports: [CommonModule, TableUniversal, BreadcrumbModule, RouterModule, DialogDetail],
    templateUrl: './menumanagement.html',
    styleUrl: './menumanagement.css',
})
export class Menumanagement extends ParentTable<MenuRole> implements OnInit {
    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    override ngOnInit(): void {
        super.ngOnInit();

        this.breaditems = [{ label: 'Management' }, { label: 'Menus' }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };

        this.columns = [
            { label: 'Label Name', key: 'idMenu', sortable: true, displayAt: 'none' },
            { label: 'Label Name', key: 'nameMenu', sortable: true, validators: { required: true } },
            { label: 'URL Link', key: 'pathMenu', sortable: true },
            {
                label: 'Icon Code',
                key: 'iconMenu',
                sortable: true,
                type: 'icon',
                optionsParameter: { url: '/v2/menu/list-icon', multiSelect: false, keyLabel: 'description', keyCode: 'code' },
            },
            {
                label: 'Permission Available',
                key: 'roleList',
                displayAt: 'detail',
                optionsParameter: { url: '/v2/role/list-role', multiSelect: true, keyLabel: 'rolename' },
            },
        ];
        this.endpointList.set('create', '/v2/menu/add-menu');
        this.endpointList.set('edit', '/v2/menu/edit-menu');
        this.endpointList.set('delete', '/v2/menu/delete-menu');
    }
}
