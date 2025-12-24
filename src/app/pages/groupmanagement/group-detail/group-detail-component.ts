import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableHeader } from '../../../../model/others/TableHeader';
import { PermissionMode } from '../../../../model/others/TableButton';
import { RequestService } from '../../../services/request-service';
import { DateService } from '../../../services/date-service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TreeMenuPicker } from '../../../components/tree-menu-picker/tree-menu-picker';
import { MenuRole } from '../../../../model/custom-entity/MenuRole';
import { TreeNode } from 'primeng/api';
import { createPasswordValidator } from '../../../components/password-validation';
import { PickListModule } from 'primeng/picklist';
import { TreeModule } from 'primeng/tree';
import { ResponseCode } from '../../../../backend/utils/responseCode';

@Component({
  standalone: true,
  selector: 'app-group-detail',
  imports: [CommonModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, PickListModule, TreeModule, TreeMenuPicker],
  templateUrl: './group-detail-component.html',
  styleUrl: './group-detail-component.css',
})
export class GroupDetailComponent {
  model: any = {};
  mode: PermissionMode = 'view';
  endpoint?: string;
  headers: TableHeader[] = [];

  groupForm!: FormGroup;
  formSubmitted = false;
  dataOptions = new Map<string, any[]>();
  availableTreeMenus: MenuRole[] = [];
  treeMenuList: TreeNode[] = [];

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
    this.headers = this.dynamicDialogConfig.data.headers;

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
        this.groupForm = this.formBuilder.group(group);

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
            this.availableTreeMenus = res.data;
            this.treeMenuList = this.mode !== 'create' ? this.model?.[header.key] : [];
          }
        }
      });
    }
  }

  get passwordErrors(): string[] {
    const control = this.groupForm.get('password');
    const errors = control?.errors?.['passwordPolicy'] as string[] | undefined;
    return errors ?? [];
  }

  onSave() {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }
    const payloadBody = this.groupForm.value;
    const headerTreeMenu = this.headers.find((item: TableHeader) => item.componentType === 'tree-menu-picker');
    if (headerTreeMenu && this.treeMenuList?.length > 0) {
      const treeMenuList = this.removeCircularReferences(this.treeMenuList);
      payloadBody[headerTreeMenu.key] = treeMenuList;
    }
    if (this.endpoint) {
      this.requestService.postBackend(this.endpoint, payloadBody).subscribe({
        next: (res: any) => {
          if (res.code === ResponseCode.SUCCESS) {
            this.groupForm.reset();
            this.dynamicDialogRef.close(res);
            this.requestService.displayMessageService('info', 'Information', `Data ${this.mode} successfully.`);
          }
        }
      });
    }

    this.groupForm.reset();
    this.dynamicDialogRef.close();
  }

  private removeCircularReferences(nodes: TreeNode[]): TreeNode[] {
    for (const node of nodes) {
      // 🧹 remove circular reference
      if ('parent' in node) {
        delete (node as any).parent;
      }

      // 🔁 recurse through children
      if (node.children?.length) {
        this.removeCircularReferences(node.children);
      }
    }
    return nodes;
  }

  onCancel() {
    this.groupForm.reset();
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

  onTreeSelectionChange(selectedData: any) {
    this.treeMenuList = selectedData;
  }
}
