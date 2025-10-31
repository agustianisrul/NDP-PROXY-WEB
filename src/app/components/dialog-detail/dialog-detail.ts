import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { PermissionMode } from '../../../model/others/TableButton';
import { TableHeader } from '../../../model/others/TableHeader';
import { DateService } from '../../services/date-service';
import { RequestService } from '../../services/request-service';
import { createPasswordValidator } from '../password-validation';
import { TreeMenuPicker } from '../tree-menu-picker/tree-menu-picker';
import { availableMenu, selectedTreeMenus, selectedTreeNode } from '../tree.store';

interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
}

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
        PasswordModule,
        TreeMenuPicker,
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

    constructor(private readonly fb: FormBuilder, private readonly requestService: RequestService, private readonly dateService: DateService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['headers'] || changes['model'] || changes['mode']) {
            this.buildForm();
        }
    }

    private buildForm() {
        const group: Record<string, any> = {};
        for (const header of this.headers) {
            const isPrimaryKeyId = header.key.toLowerCase().includes('id');
            if (this.isDisplayInForm(header) || isPrimaryKeyId) {
                const validators: ValidatorFn[] = header.validators ? this.buildAllValidator(header) : [];
                group[header.key] = [this.model?.[header.key] ?? null, validators];
                this.form = this.fb.group(group);

                if (header.componentType && ['p-multiselect', 'p-select', 'tree-menu-picker'].includes(header.componentType)) {
                    this.fetchDataOptions(header);
                }
            }
        }
    }

    private buildAllValidator(header: TableHeader): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        // Required
        if (header.validators?.required) validators.push(Validators.required);

        // Email
        if (header.validators?.email) validators.push(Validators.email);

        // password policy
        if (header.validators?.passwordPolicy) {
            const policy = {
                minLength: 8,
                requireUppercase: true,
                requireNumber: true,
                requireSpecialChar: true,
                allowedSpecialChars: '!@#$%^&*()_+[]{}|;:,.?~-',
            };
            validators.push(createPasswordValidator(policy));
        }

        return validators;
    }

    private fetchDataOptions(header: TableHeader): void {
        const optionsConfig = header.optionsParameter;
        if (!optionsConfig?.data && !optionsConfig?.url) return;
        // Avoid re-fetching if already cached
        if (this.dataOptions.has(header.key)) return;

        if (optionsConfig.data) {
            this.dataOptions.set(header.key, optionsConfig.data || []);
            return;
        }

        if (optionsConfig.url) {
            this.requestService.getBackend(optionsConfig.url).subscribe({
                next: (res: any) => {
                    this.dataOptions.set(header.key, res.data || []);
                    if (header.componentType === 'tree-menu-picker') {
                        availableMenu.set(res.data);
                        selectedTreeNode.set(this.model?.[header.key] ?? []);
                    }
                },
                error: (err) => console.error(`Failed to load options for ${header.key}`, err),
            });
        }
    }

    get passwordErrors(): string[] {
        const control = this.form.get('password');
        const errors = control?.errors?.['passwordPolicy'] as string[] | undefined;
        return errors ?? [];
    }

    onSave() {
        if (this.form.invalid) {
            console.log('form invalid');
            this.form.markAllAsTouched();
            return;
        }
        const payloadBody = this.form.value;
        const headerTreeMenu = this.headers.find((item: TableHeader) => item.componentType === 'tree-menu-picker');
        if (headerTreeMenu) {
            payloadBody[headerTreeMenu.key] = selectedTreeMenus();
        }
        if (this.endpoint) {
            this.requestService.postBackend(this.endpoint, payloadBody).subscribe({
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

    private getNestedValue(obj: any, path: string): any {
        if (!obj || !path) return '';
        return path.split('.').reduce((acc, part) => acc[part], obj);
    }

    getDisplayValue(header: TableHeader): any {
        const cellValue = this.model[header.key];

        if (header.dateFormat) {
            return cellValue ? this.dateService.format(cellValue, header.dateFormat) : this.dateService.format(cellValue);
        }

        if (header.optionsParameter?.data && header.optionsParameter?.data.length > 0) {
            return header.optionsParameter?.data.map((item) => item[header.optionsParameter?.keyLabel ?? cellValue]).join(', ');
        }

        return cellValue ?? '-';
    }

    isDisplayInForm(column: TableHeader): boolean {
        if (!column.displayAt) return true;
        return 'detail' === column.displayAt;
    }
}
