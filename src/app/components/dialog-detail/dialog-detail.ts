import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { MenuRole } from '../../../model/custom-entity/MenuRole';
import { PermissionMode } from '../../../model/others/TableButton';
import { TableHeader } from '../../../model/others/TableHeader';
import { DateService } from '../../services/date-service';
import { RequestService } from '../../services/request-service';
import { createPasswordValidator } from '../password-validation';
import { TreeMenuPicker } from '../tree-menu-picker/tree-menu-picker';
import { ResponseCode } from '../../../backend/utils/responseCode';

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
    ],
})
export class DialogDetail implements OnInit {
    visible = false;
    title = 'Form';
    headers: TableHeader[] = [];
    model: any = {};
    mode: PermissionMode = 'view';
    endpoint?: string;

    form!: FormGroup;
    dataOptions = new Map<string, any[]>();

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly requestService: RequestService,
        private readonly dateService: DateService,
        public dynamicDialogRef: DynamicDialogRef,
        public dynamicDialogConfig: DynamicDialogConfig
    ) {}

    ngOnInit(): void {
        this.model = this.dynamicDialogConfig.data.model;
        this.headers = this.dynamicDialogConfig.data.headers;
        this.visible = this.dynamicDialogConfig.data.visible;
        this.mode = this.dynamicDialogConfig.data.mode;
        this.endpoint = this.dynamicDialogConfig.data.endpoint;

        this.buildForm();
    }

    private buildForm() {
        const group: Record<string, any> = {};
        for (const header of this.headers) {
            const isPrimaryKeyId = header.key.toLowerCase().includes('id');
            if (this.isDisplayInForm(header) || isPrimaryKeyId) {
                const validators: ValidatorFn[] = header.validators ? this.buildAllValidator(header) : [];
                const tempValue = this.mode !== 'create' ? this.model?.[header.key] : null;
                group[header.key] = [tempValue, validators];
                this.form = this.formBuilder.group(group);

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
                }
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
            this.form.markAllAsTouched();
            return;
        }
        const payloadBody = this.form.value;
        if (this.endpoint) {
            this.requestService.postBackend(this.endpoint, payloadBody).subscribe({
                next: (res: any) => {
                    if (res.code === ResponseCode.SUCCESS) {
                        this.form.reset();
                        this.requestService.displayMessageService('info', 'Information', `Data ${this.mode} successfully.`);
                        this.dynamicDialogRef.close(res);
                    }
                }
            });
        }
    }

    onCancel() {
        this.form.reset();
        this.dynamicDialogRef.close();
    }

    private getNestedValue(obj: any, path: string): any {
        if (!obj || !path) return '';
        return path.split('.').reduce((acc, part) => acc[part], obj);
    }

    getDisplayValue(header: TableHeader): any {
        // const cellValue = this.model[header.key];
        const cellValue = header.key.includes('.') ? this.getNestedValue(this.model, header.key) : this.model[header.key];

        if (header.dateFormat) {
            return cellValue ? this.dateService.format(cellValue, header.dateFormat) : this.dateService.format(cellValue);
        }

        if (header.optionsParameter?.data && header.optionsParameter?.data.length > 0) {
            const tempDataOptions = header.optionsParameter?.data || this.dataOptions.get(header.key) || [];
            const tempKeyCode = header.optionsParameter.keyCode || header.key;
            const tempItem = tempDataOptions.find((item) => item[tempKeyCode] === cellValue || (item[tempKeyCode] == null && cellValue == null));
            return tempItem ? tempItem[header.optionsParameter.keyLabel] : cellValue ?? '-';
        }

        return cellValue ?? '-';
    }

    isDisplayInForm(column: TableHeader): boolean {
        if (!column.displayAt) return true;
        return column.displayAt.includes(this.mode);
    }

    closeDialog() {
        this.dynamicDialogRef.close();
    }
}
