import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableHeader } from '../../../model/others/TableHeader';

@Component({
    standalone: true,
    selector: 'app-dialog-detail',
    templateUrl: './dialog-detail.html',
    styleUrl: './dialog-detail.css',
    imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, DatePickerModule, CheckboxModule, SelectModule, ButtonModule],
})
export class DialogDetail implements OnChanges {
    @Input() visible = false;
    @Input() title = 'Form';
    @Input() headers: TableHeader[] = [];
    @Input() model: any = {};
    @Input() mode: 'create' | 'edit' | 'view' | 'delete' = 'view';

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saveEmit = new EventEmitter<any>();
    @Output() cancelEmit = new EventEmitter<void>();

    form!: FormGroup;

    constructor(private readonly fb: FormBuilder) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['headers'] || changes['model'] || changes['mode']) {
            this.buildForm();
        }
    }

    private buildForm() {
        const group: Record<string, any> = {};
        this.headers.forEach((h) => {
            group[h.key] = [this.model ? this.model[h.key] ?? null : null];
        });
        this.form = this.fb.group(group);
    }

    onSave() {
        this.saveEmit.emit(this.form.getRawValue());
        this.visibleChange.emit(false);
    }

    onCancel() {
        this.cancelEmit.emit();
        this.visibleChange.emit(false);
    }

    getDisplayValue(header: TableHeader): any {
        const value = this.model ? this.model[header.key] : null;

        // ENUM / VALUES
        if (header.values && value !== null && value !== undefined) {
            return header.values[value] ?? value;
        }

        // OPTIONS ARRAY
        if (header.options && value !== null && value !== undefined) {
            const found = header.options.find((o: any) => o.id === value);
            return found ? found.label : value;
        }

        // DATE formatting (basic, you can inject DatePipe if needed)
        if (header.type === 'date' && value) {
            return new Date(value).toLocaleDateString();
        }

        // BOOLEAN formatting
        if (header.type === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return value ?? '-';
    }
}
