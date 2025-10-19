import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class TableUniversal implements OnInit {
    @Input() url!: string;
    @Input() columns: TableHeader[] = [];
    @Input() rowsPerPage: number = 10;
    @Input() dataKey!: string;
    @Input() mainTableButtons: TableButton[] = [];
    @Input() rowTableButtons: TableButton[] = [];
    @Input() showCheckbox: boolean = false;
    @Input() selectedRows: any[] = [];

    @Output() selectionChange = new EventEmitter<any[]>();

    data: any[] = [];
    totalRecords = 0;
    first = 0;
    loading = false;
    filterKeys: string[] = [];

    constructor(private readonly requestService: RequestService, private readonly dateService: DateService) {}

    ngOnInit(): void {
        this.fetchData();
        this.filterKeys = this.columns.map((col) => col.key);
    }

    fetchData(): void {
        this.loading = true;
        this.requestService.getBackend(this.url).subscribe({
            next: (res: any) => {
                this.data = res.data.data;
                this.totalRecords = res.data.data.total;
                this.loading = false;
            },
            error: () => {
                this.data = [];
                this.loading = false;
            },
        });
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

    formatValue(cellValue: any, col: TableHeader): any {
        switch (col.type) {
            case 'date': {
                const dateFormat = col.format ?? 'DD/MM/YYYY';
                return cellValue ? this.dateService.format(cellValue, dateFormat) : '';
            }
            case 'boolean': {
                const resultConvert = this.convertUsingEnumOrOptions(cellValue, col);
                if (resultConvert !== null) return resultConvert;
                return cellValue ? 'True' : 'False';
            }
            case 'number': {
                const resultConvert = this.convertUsingEnumOrOptions(cellValue, col);
                if (resultConvert !== null) return resultConvert;
                return cellValue;
            }
            default: {
                return cellValue;
            }
        }
    }

    private convertUsingEnumOrOptions(cellValue: any, col: TableHeader): any {
        if (col.values) {
            return col.values[cellValue] ?? cellValue;
        }
        if (col.options) {
            return col.options.find((opt: any) => opt.id === cellValue)?.label ?? cellValue;
        }
        return null;
    }
}
