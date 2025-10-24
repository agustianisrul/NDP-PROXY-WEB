import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Groupmanagement } from './pages/groupmanagement/groupmanagement';
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
            { path: 'group', component: Groupmanagement },
            { path: 'permission', component: Rolemanagement },
            { path: 'profile', component: Myprofile },
            { path: 'scheduler', loadChildren: () => import('./pages/scheduler/scheduler-routing-module') },
            { path: 'config', loadChildren: () => import('./pages/scheduler/scheduler-routing-module') },
            { path: 'prefix', loadChildren: () => import('./pages/prefix/prefix-routing-module') },
        ],
    },
    { path: 'login', component: Login },
    { path: 'registration', component: Registration },
];
