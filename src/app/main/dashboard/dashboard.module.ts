import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
  ]
})
export class DashboardModule {}
