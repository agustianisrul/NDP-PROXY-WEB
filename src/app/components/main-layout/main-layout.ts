import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication-service';
import { LayoutService } from '../../services/layout-service';
import { LoadingPanel } from '../loading-panel/loading-panel';
import { Sidebar } from '../sidebar/sidebar';
import { Topheader } from '../topheader/topheader';

@Component({
    standalone: true,
    selector: 'app-main-layout',
    imports: [CommonModule, RouterModule, Topheader, Sidebar, LoadingPanel],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
    overlayMenuOpenSubscription!: Subscription;
    menuOutsideClickListener: any;

    @ViewChild(Sidebar) appSidebar!: Sidebar;
    @ViewChild(Topheader) appTopBar!: Topheader;

    menuItem: MenuItem[] = [];

    constructor(
        private readonly layoutService: LayoutService,
        private readonly renderer: Renderer2,
        private readonly router: Router,
        public readonly authService: AuthenticationService,
        @Inject(PLATFORM_ID) private readonly platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
                if (!this.menuOutsideClickListener) {
                    this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                        if (this.isOutsideClicked(event)) {
                            this.hideMenu();
                        }
                    });
                }

                if (this.layoutService.layoutState().staticMenuMobileActive) {
                    this.blockBodyScroll();
                }
            });

            this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
                this.hideMenu();
            });
        }
    }

    ngOnInit() {
        this.menuItem = this.authService.menuItemList ?? [];
    }

    logout() {
        this.authService.logout().subscribe(() => {
            this.router.navigateByUrl('/login');
        });
    }

    isOutsideClicked(event: MouseEvent) {
        if (!isPlatformBrowser(this.platformId)) return false;

        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(
            sidebarEl?.isSameNode(eventTarget) ||
            sidebarEl?.contains(eventTarget) ||
            topbarEl?.isSameNode(eventTarget) ||
            topbarEl?.contains(eventTarget)
        );
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev: any) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
        }));
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    blockBodyScroll(): void {
        if (isPlatformBrowser(this.platformId)) {
            document.body.classList.add('blocked-scroll');
        }
    }

    unblockBodyScroll(): void {
        if (isPlatformBrowser(this.platformId)) {
            document.body.classList.remove('blocked-scroll');
        }
    }

    get containerClass() {
        return {
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive':
                this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive,
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }
}
