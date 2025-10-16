import { ApplicationConfig, inject, mergeApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { AuthenticationService } from './services/authentication-service';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(withRoutes(serverRoutes)),
        provideAppInitializer(() => {
            // injection happens inside the initializer's injection context
            const authenticationService = inject(AuthenticationService);
            console.log('inside app.config.server.ts');
            // if loadCurrentUser returns a Promise, Angular will wait for it
            return authenticationService.loadCurrentUser();
        }),
    ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
