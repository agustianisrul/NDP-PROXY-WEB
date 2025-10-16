import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppMenuitem } from '../app.menuitem';

@Component({
    standalone: true,
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule, ConfirmDialogModule, AppMenuitem],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
    providers: [ConfirmationService],
})
export class Sidebar {
    private _model: MenuItem[] = [];

    @Input()
    set model(value: MenuItem[]) {
        this._model = value || [];
        this.mergeWithExtraMenu();
    }
    get model(): MenuItem[] {
        return this._model;
    }
    @Output() logout = new EventEmitter<void>();

    private readonly extraMenu: MenuItem[] = [
        {
            label: 'Profile',
            icon: 'pi pi-book',
            routerLink: ['/profile'],
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.confirmLogout(),
        },
    ];

    constructor(private readonly confirmationService: ConfirmationService) {}

    private mergeWithExtraMenu(): void {
        if (this._model && this._model.length > 0) {
            this._model = [{ label: '', items: [...this._model, ...this.extraMenu] }];
        } else {
            this._model = [{ label: '', items: this.extraMenu }];
        }
        console.log('✅ Final sidebar menu:', this._model);
    }

    private confirmLogout() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to logout?',
            header: 'Logout Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.logout.emit(),
        });
    }
}
