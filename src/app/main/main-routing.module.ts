import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: '', component: MainComponent, 
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      {
        path: 'main',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      { path: 'success', component: SuccessComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
