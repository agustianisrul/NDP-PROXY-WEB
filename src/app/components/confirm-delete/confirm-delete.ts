import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
    selector: 'app-confirm-delete',
    standalone: true,
    imports: [ConfirmDialog, ButtonModule],
    templateUrl: './confirm-delete.html',
    styleUrl: './confirm-delete.css',
})
export class ConfirmDelete<T> {
    @Input() selectedRows: T[] = [];
    @Input() keyLabel: keyof T | string = '';

    trackByIndex(index: number): number {
        return index;
    }

    getValue(row: T): any {
        return row[this.keyLabel as keyof T];
    }
}
