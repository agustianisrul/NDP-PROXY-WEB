import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { OnlyBrowserDirective } from "../../../directives/only-browser.directive";
import { ParentComponent } from "../../../components/parent-component";
import { RequestService } from "../../../services/request-service";
import { ResponseConfig } from "../../../../model/surrounding/ResponseConfig";
import { ServerConfig } from "../../../../model/surrounding/ServerConfig";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { ResponseCode } from "../../../../backend/utils/responseCode";
import { MenuItem } from "primeng/api";
import { BreadcrumbModule } from "primeng/breadcrumb";

@Component({
    selector: 'app-setting-component',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule, OnlyBrowserDirective, ToggleSwitchModule, BreadcrumbModule],
    templateUrl: './setting-component.html',
    styleUrl: './setting-component.css',
})
export class SettingComponent extends ParentComponent implements OnInit {
    private readonly requestService = inject(RequestService);
    private readonly formBuilder = inject(FormBuilder);

    home: MenuItem | undefined;
    breaditems: MenuItem[] | undefined;

    model: any = {};
    settingForm!: FormGroup;
    formSubmitted = false;

    constructor() {
        super();
        this.breaditems = [{ label: 'Profile' }];
        this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    }

    ngOnInit(): void {
        this.loadConfigs();
    }

    loadConfigs(): void {
        this.requestService.getBackend(`/v2/config-server/list-config/common-config`).subscribe({
            next: (res: any) => {
                if (res?.data && typeof res.data === 'object') {
                    this.model = res.data.length ? res.data[0] : {};
                    this.buildForms();
                }
            }
        });
    }

    private buildForms(): void {
        const group: Record<string, any> = {};
        group['keyGroup'] = [this.model.keyGroup];
        for (const row of this.model.configList) {
            if (['password_expiry_days', 'idle_timeout', 'password_min_length', 'retry_failed_login', 'waiting_time', 'dashboard_auto_refresh', 'port_email'].includes(row.keyName)) {
                row.componentType = 'p-inputnumber';
                group[row.keyName] = [row.value ? Number(row.value) : 0, Validators.required];
            }
            else if (['password_require_uppercase', 'password_require_lowercase', 'password_require_numbers', 'password_require_special_chars', 'smtp_auth_email', 'debug_email', 'starttls_enable_email', 'starttls_required_email'].includes(row.keyName)) {
                row.componentType = 'p-toggleswitch';
                group[row.keyName] = [row.value === 'true' ? true : false, Validators.required];
            } else {
                row.componentType = 'p-inputtext';
                group[row.keyName] = [row.value ? row.value : '', Validators.required];
            }
        }
        this.settingForm = this.formBuilder.group(group);
    }

    isInvalid(controlName: string) {
        const control = this.settingForm.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }

    onSaveConfig(): void {
        if (this.settingForm.invalid) {
            this.settingForm.markAllAsTouched();
            return;
        }
        this.formSubmitted = true;
        const payloadBody = this.settingForm.value;
        this.requestService.postBackend('/v2/config-server/edit-config', payloadBody).subscribe({
            next: (res: any) => {
                if (res.code === ResponseCode.SUCCESS) {
                    this.formSubmitted = false;
                    this.requestService.displayMessageService('info', 'Information', `Data edit successfully.`);
                }
            }
        });
    }
}
