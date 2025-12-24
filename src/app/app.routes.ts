import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Menumanagement } from './pages/menumanagement/menumanagement';
import { Myprofile } from './pages/myprofile/myprofile';
import { Registration } from './pages/registration/registration';
import { Rolemanagement } from './pages/rolemanagement/rolemanagement';
import { Usermanagement } from './pages/usermanagement/usermanagement';
import { authenticationGuard } from './services/authentication-guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        canActivate: [authenticationGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'dashboard', component: Dashboard },
            { path: 'user', component: Usermanagement },
            { path: 'menus', component: Menumanagement },
            { path: 'group', loadChildren: () => import('./pages/groupmanagement/group-routing-module').then(m => m.default) },
            { path: 'permission', component: Rolemanagement },
            { path: 'profile', component: Myprofile },
            { path: 'scheduler-config', loadChildren: () => import('./pages/scheduler/scheduler-routing-module').then(m => m.default) },
            { path: 'scheduler-admin', loadChildren: () => import('./pages/scheduler/scheduler-routing-module').then(m => m.default) },
            { path: 'prefix', loadChildren: () => import('./pages/prefix/prefix-routing-module').then(m => m.default) },
            { path: 'logging-file', loadChildren: () => import('./pages/logging-file/logging-file-routing-module').then(m => m.default) },
            { path: 'logging-request', loadChildren: () => import('./pages/request-activity/request-activity-routing-module').then(m => m.default) },
            { path: 'server-config', loadChildren: () => import('./pages/server/server-routing-module').then(m => m.default) },
            { path: 'portal-setting', loadChildren: () => import('./pages/setting/setting-routing-module').then(m => m.default) },
            { path: 'file-sequence', loadChildren: () => import('./pages/file-sequence-page/file-sequence-page-routing-module').then(m => m.default) },
        ],
    },
    { path: 'login', component: Login },
    { path: 'registration', component: Registration },
];
