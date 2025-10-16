import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { EMPTY, filter, Observable, of, Subscription, switchMap } from 'rxjs';
import { UserSession } from '../../../model/custom-entity/UserSession';
import { AuthenticationService } from '../../services/authentication-service';
import { LayoutService } from '../../services/layout-service';
import { RequestService } from '../../services/request-service';
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

    user$!: Observable<UserSession | null>;
    menuItem: MenuItem[] = [];

    constructor(
        private readonly layoutService: LayoutService,
        private readonly renderer: Renderer2,
        private readonly router: Router,
        private readonly authService: AuthenticationService,
        private readonly requestService: RequestService,
        @Inject(PLATFORM_ID) private readonly platformId: Object
    ) {
        this.user$ = this.authService.user$;

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
        // refresh menu whenever user changes
        this.user$
            .pipe(
                switchMap((user) => {
                    console.log('User changed, reloading menu:', user);
                    if (!user) {
                        this.menuItem = [];
                        return EMPTY;
                    }
                    if (user.isAdmin) {
                        this.menuItem = this.buildMenuAdmin();
                        return EMPTY;
                    }
                    if (isPlatformBrowser(this.platformId)) {
                        return this.requestService.getBackend(`/v2/group/get-group/${user.idgroup}`);
                    }
                    return of(null);
                })
            )
            .subscribe({
                next: (res: any) => (this.menuItem = res.data?.menublob ?? []),
                error: (err) => console.error(err),
            });
    }

    private buildMenuAdmin() {
        return [
            { label: 'User', icon: 'pi pi-id-card', routerLink: ['/user'] },
            { label: 'Menu', icon: 'pi pi-check-square', routerLink: ['/menus'] },
            { label: 'Group', icon: 'pi pi-mobile', routerLink: ['/group'] },
            { label: 'Role', icon: 'pi pi-table', routerLink: ['/role'] },
        ];
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
