import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableHeader } from '../../../../model/others/TableHeader';
import { PermissionMode } from '../../../../model/others/TableButton';
import { RequestService } from '../../../services/request-service';
import { DateService } from '../../../services/date-service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ConfigParameter } from '../../../../model/surrounding/ConfigParameter';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ResponseCode } from '../../../../backend/utils/responseCode';

@Component({
  standalone: true,
  selector: 'app-scheduler-detail',
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, SelectModule, MessageModule, ToggleSwitchModule, InputNumberModule],
  templateUrl: './scheduler-detail.html',
  styleUrl: './scheduler-detail.css',
})
export class SchedulerDetailComponent {
  model: any = {};
  mode: PermissionMode = 'view';
  endpoint?: string;
  configList: ConfigParameter[] = [];

  configForm!: FormGroup;
  formSubmitted = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly requestService: RequestService,
    private readonly dateService: DateService,
    public dynamicDialogRef: DynamicDialogRef,
    public dynamicDialogConfig: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this.model = this.dynamicDialogConfig.data.model;
    this.mode = this.dynamicDialogConfig.data.mode;
    this.endpoint = this.dynamicDialogConfig.data.endpoint;
    this.configList = this.dynamicDialogConfig.data.configList;

    if (this.mode === 'create') {
      this.model = {};
      const tempConfig = this.configList[0] ?? null;
      this.createForm(tempConfig);
      return;
    }

    if (this.mode === 'edit') {
      this.buildEditForm();
    }
  }

  private buildEditForm() {
    const group: Record<string, any> = {};
    group['keyGroup'] = [this.model.keyGroup];
    for (const row of this.model.configList) {
      if (['port', 'backup_retention', 'delete_retention', 'min_length', 'password_expiry_days'].includes(row.keyName)) {
        row.componentType = 'p-inputnumber';
      }
      if (['require_uppercase', 'require_lowercase', 'require_numbers', 'require_special_chars'].includes(row.keyName)) {
        row.componentType = 'p-toggleswitch';
      }
      group[row.keyName] = [row.value ?? null];
      group[`${row.keyName}_description`] = [row.description ?? null];
    }
    this.configForm = this.formBuilder.group(group);
  }

  private createForm(tempConfig: ConfigParameter) {
    this.model = {
      keyGroup: tempConfig.paramCode,
      typeForm: tempConfig.typeForm,
      configList: []
    }

    if (tempConfig.typeForm === '1') {
      this.model.configList = [
        { keyName: 'host', value: null, description: null },
        { keyName: 'port', value: null, description: null, componentType: 'p-inputnumber' },
        { keyName: 'username', value: null, description: null },
        { keyName: 'password', value: null, description: null },
        { keyName: 'outgoing', value: null, description: null },
        { keyName: 'incoming', value: null, description: null }
      ];
    } else if (tempConfig.typeForm === '2') {
      this.model.configList = [
        { keyName: 'host', value: null, description: null },
        { keyName: 'port', value: null, description: null, componentType: 'p-inputnumber' },
        { keyName: 'username', value: null, description: null },
        { keyName: 'password', value: null, description: null },
        { keyName: 'outgoing', value: null, description: null },
        { keyName: 'incoming', value: null, description: null },
        { keyName: 'backup_retention', value: null, description: 'in days', componentType: 'p-inputnumber' },
        { keyName: 'delete_retention', value: null, description: 'in days', componentType: 'p-inputnumber' }
      ];
    } else {
      this.model.configList = [
        { keyName: 'idle_timeout', value: 1800, description: 'in seconds', componentType: 'p-inputnumber' },
        { keyName: 'password_min_length', value: 12, description: null, componentType: 'p-inputnumber' },
        { keyName: 'password_require_uppercase', value: true, description: null, componentType: 'p-toggleswitch' },
        { keyName: 'password_require_lowercase', value: true, description: null, componentType: 'p-toggleswitch' },
        { keyName: 'password_require_numbers', value: true, description: null, componentType: 'p-toggleswitch' },
        { keyName: 'password_require_special_chars', value: true, description: null, componentType: 'p-toggleswitch' },
        { keyName: 'password_expiry_days', value: 30, description: 'in days', componentType: 'p-inputnumber' },
        { keyName: 'retry_failed_login', value: 3, description: null, componentType: 'p-inputnumber' }
      ];
    }

    const group: Record<string, any> = {};
    group['idConfigMain'] = [null];
    group['typeForm'] = [tempConfig, Validators.required];
    group['keyGroup'] = [{value: tempConfig.paramCode, disabled: true}];
    for (const tempConfig of this.model.configList) {
      group[tempConfig.keyName] = [tempConfig.value, Validators.required];
      group[`${tempConfig.keyName}_description`] = [tempConfig.description];
    }
    this.configForm = this.formBuilder.group(group);
  }

  onSave() {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }
    this.formSubmitted = true;
    const payloadBody = this.configForm.value;
    if (this.endpoint) {
      this.requestService.postBackend(this.endpoint, payloadBody).subscribe({
        next: (res) => {
          if (res.code === ResponseCode.SUCCESS) {
            this.formSubmitted = false;
            this.configForm.reset();
            this.requestService.displayMessageService('info', 'Information', `Data ${this.mode} successfully.`);
            this.dynamicDialogRef.close(res);
          }
        }
      });
    }
  }

  onCancel() {
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
      return header.optionsParameter?.data.find((item) => item[header.key] === cellValue)[header.optionsParameter.keyLabel];
      // return header.optionsParameter?.data.map((item) => item[header.optionsParameter?.keyLabel ?? cellValue]).join(', ');
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

  isInvalid(controlName: string) {
    const control = this.configForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  onSelectFormType(event: any) {
    const tempConfig: ConfigParameter = event.value as ConfigParameter;
    this.createForm(tempConfig);
  }
}
