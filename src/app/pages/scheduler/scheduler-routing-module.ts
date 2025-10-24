import { Routes } from '@angular/router';
import { SchedulerDetail } from './scheduler-detail/scheduler-detail';
import { SchedulerList } from './scheduler-list/scheduler-list';

export default [
    { path: '', component: SchedulerList },
    { path: 'view', component: SchedulerDetail },
    { path: 'create', component: SchedulerDetail },
    { path: 'edit', component: SchedulerDetail },
    { path: 'delete', component: SchedulerDetail },
    { path: 'start', component: SchedulerDetail },
    { path: 'stop', component: SchedulerDetail },
] as Routes;
