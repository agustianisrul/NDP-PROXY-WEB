import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationService } from './authentication-service';

export const authenticationGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return of(true);

    if (auth.isLoading) return of(false); // wait until loaded

    if (auth.currentUser) return of(true);

    auth.redirectUrl = state.url;
    return of(router.createUrlTree(['/login']));

    // if (!isPlatformBrowser(platformId)) {
    //     return of(true); // SSR: skip redirect
    // }

    // return combineLatest([auth.user$, auth.loading$]).pipe(
    //     filter(([_, loading]) => !loading), // wait until loadCurrentUser() finishes
    //     take(1),
    //     map(([user]) => {
    //         if (user) {
    //             return true;
    //         }
    //         auth.redirectUrl = state.url;
    //         return router.createUrlTree(['/login']);
    //     })
    // );
};
