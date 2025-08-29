import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { SuccessComponent } from './success/success.component';

@NgModule({
  declarations: [
    MainComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
  ]
})
export class MainModule {}
