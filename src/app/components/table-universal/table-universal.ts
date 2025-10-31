import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TableButton } from '../../../model/others/TableButton';
import { TableHeader } from '../../../model/others/TableHeader';
import { DateService } from '../../services/date-service';
import { RequestService } from '../../services/request-service';

@Component({
    selector: 'app-table-universal',
    imports: [TableModule, CommonModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, TooltipModule],
    templateUrl: './table-universal.html',
    styleUrl: './table-universal.css',
})
export class TableUniversal<T> implements OnInit, OnChanges {
    @Input() url?: string;
    @Input() data?: T[] = [];
    @Input() columns: TableHeader[] = [];
    @Input() rowsPerPage: number = 10;
    @Input() dataKey!: string;
    @Input() mainTableButtons: TableButton[] = [];
    @Input() rowTableButtons: TableButton[] = [];
    @Input() selectedRows: T[] = [];
    @Input() reloadTrigger: boolean = false;
    @Input() viewEnabled?: boolean = true;

    @Output() selectedRowsChange = new EventEmitter<T[]>();
    @Output() mainTableButtonClick = new EventEmitter<TableButton>();
    @Output() rowTableButtonClick = new EventEmitter<{ type: string; row: T }>();

    totalRecords = 0;
    first = 0;
    loading = false;
    filterKeys: string[] = [];

    constructor(private readonly requestService: RequestService, private readonly dateService: DateService) {}

    ngOnInit(): void {
        this.fetchData();
        this.filterKeys = this.columns.map((col) => col.key);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['reloadTrigger'] && !changes['reloadTrigger'].firstChange) {
            this.fetchData();
        }
    }

    fetchData(): void {
        if (this.url) {
            this.loading = true;
            this.requestService.getBackend(this.url).subscribe({
                next: (res: any) => {
                    this.data = res.data ?? [];
                    this.totalRecords = res.data.length;
                    this.loading = false;
                    this.reloadTrigger = false;
                },
                error: () => {
                    this.data = [];
                    this.loading = false;
                    this.reloadTrigger = false;
                },
            });
        }
    }

    next() {
        this.first = this.first + this.rowsPerPage;
    }

    prev() {
        this.first = this.first - this.rowsPerPage;
    }

    reset() {
        this.first = 0;
    }

    pageChange(event: any) {
        this.first = event.first;
        this.rowsPerPage = event.rows;
    }

    isLastPage(): boolean {
        return this.data ? this.first + this.rowsPerPage >= this.data.length : true;
    }

    isFirstPage(): boolean {
        return this.data ? this.first === 0 : true;
    }

    private getNestedValue(obj: any, path: string): any {
        if (!obj || !path) return '';
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    getDisplayValue(row: any, header: TableHeader): any {
        const cellValue = header.key.includes('.') ? this.getNestedValue(row, header.key) : row[header.key];

        if (header.dateFormat) {
            return cellValue ? this.dateService.format(cellValue, header.dateFormat) : this.dateService.format(cellValue);
        }

        if (header.optionsParameter?.data && header.optionsParameter?.data.length > 0) {
            return header.optionsParameter?.data.map((item) => item[header.optionsParameter?.keyLabel ?? cellValue]).join(', ');
        }

        return cellValue ?? '-';
    }

    isDisplayInTable(header: TableHeader) {
        if (!header.displayAt) return true;

        return 'table' === header.displayAt;
    }

    onMainTableButtonClick(btn: TableButton) {
        this.mainTableButtonClick.emit(btn);
    }

    onRowTableButtonClick(btn: TableButton, row: T) {
        this.rowTableButtonClick.emit({ type: btn.type, row });
    }

    onSelectionChange(event: T[]) {
        this.selectedRows = event;
        this.selectedRowsChange.emit(event);
    }

    isButtonDisabled(btn: TableButton): boolean {
        // only 'delete' is always enabled
        return btn.type === 'delete' && this.selectedRows.length === 0;
    }

    isButtonDeleteExist(): boolean {
        return this.mainTableButtons.some((a) => a.type === 'delete');
    }
}
