import { Directive, inject, TemplateRef, ViewContainerRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
    standalone: true,
    selector: '[appOnlyBrowser]',
})
export class OnlyBrowserDirective {
    private readonly platformId = inject(PLATFORM_ID);

    constructor(private readonly templateRef: TemplateRef<any>, private readonly viewContainer: ViewContainerRef) {
        if (isPlatformBrowser(this.platformId)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}
