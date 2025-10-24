import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { PermissionMode } from '../../../model/others/TableButton';
import { TableHeader } from '../../../model/others/TableHeader';
import { RequestService } from '../../services/request-service';

@Component({
    standalone: true,
    selector: 'app-dialog-detail',
    templateUrl: './dialog-detail.html',
    styleUrl: './dialog-detail.css',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        InputTextModule,
        DatePickerModule,
        CheckboxModule,
        SelectModule,
        ButtonModule,
        MultiSelectModule,
    ],
})
export class DialogDetail implements OnChanges {
    @Input() visible = false;
    @Input() title = 'Form';
    @Input() headers: TableHeader[] = [];
    @Input() model: any = {};
    @Input() mode: PermissionMode = 'view';
    @Input() endpoint?: string;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saveClick = new EventEmitter<void>();
    @Output() cancelClick = new EventEmitter<void>();

    form!: FormGroup;
    dataOptions = new Map<string, any[]>();

    constructor(private readonly fb: FormBuilder, private readonly requestService: RequestService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['headers'] || changes['model'] || changes['mode']) {
            this.buildForm();
        }
    }

    private buildForm() {
        const group: Record<string, any> = {};
        for (const header of this.headers) {
            const validators: ValidatorFn[] = [];

            // Required
            if (header.validators?.required) validators.push(Validators.required);

            // Email
            if (header.validators?.email) validators.push(Validators.email);

            // Custom
            if (header.validators?.custom) {
                validators.push((control: AbstractControl) => {
                    return header.validators!.custom!(control.value) ? null : { custom: header.validators!.customMessage || 'Invalid value' };
                });
            }
            group[header.key] = [this.model?.[header.key] ?? null, validators];
            this.fetchDataOptions(header);
        }
        this.form = this.fb.group(group);
    }

    private fetchDataOptions(header: TableHeader): void {
        const optionsConfig = header.optionsParameter;
        if (!optionsConfig?.url) return;

        // Avoid re-fetching if already cached
        if (this.dataOptions.has(header.key)) return;

        this.requestService.getBackend(optionsConfig.url).subscribe({
            next: (res: any) => {
                this.dataOptions.set(header.key, res.data || []);
            },
            error: (err) => console.error(`Failed to load options for ${header.key}`, err),
        });
    }

    onSave() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        if (this.endpoint) {
            this.requestService.postBackend(this.endpoint, this.form.getRawValue()).subscribe({
                next: () => {
                    this.saveClick.emit();
                    this.visibleChange.emit(false);
                    this.form.reset();
                },
                error: (err) => {
                    this.form.reset();
                },
            });
        } else {
            this.saveClick.emit();
            this.visibleChange.emit(false);
            this.form.reset();
        }
    }

    onCancel() {
        this.cancelClick.emit();
        this.visibleChange.emit(false);
        this.form.reset();
    }

    getDisplayValue(header: TableHeader): any {
        const value = this.model ? this.model[header.key] : null;

        // ENUM / VALUES
        if (header.values && value !== null && value !== undefined) {
            return header.values[value] ?? value;
        }

        // OPTIONS ARRAY
        // if (header.optionsParameter && value !== null && value !== undefined) {
        //     const found = header.optionsParameter.find((o: any) => o.id === value);
        //     return found ? found.label : value;
        // }

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

    isDisplayInForm(column: TableHeader): boolean {
        if (!column.displayAt) return true;
        return ['detail', 'both'].includes(column.displayAt);
    }
}
