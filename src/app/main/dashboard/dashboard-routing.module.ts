import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { XcelComponent } from './xcel/xcel.component';
import { CardComponent } from './card/card.component';
import { DashboardComponent } from './dashboard.component';
import { MobileMoneyComponent } from './mobile-money/mobile-money.component';
import { UssdComponent } from './ussd/ussd.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { BankAccountComponent } from './bank-account/bank-account.component';
import { BankAppComponent } from './bank-app/bank-app.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'xcel', pathMatch: 'full' },
      {
        path: 'xcel',
        component: XcelComponent,
        data: { requiredOption: 'Pay with XCEL' }
      },
      {
        path: 'card',
        component: CardComponent,
        data: { requiredOption: 'Pay with Card' }
      },
      {
        path: 'mobile-money',
        component: MobileMoneyComponent,
        data: { requiredOption: 'Pay with Mobile Money' }
      },
      {
        path: 'ussd',
        component: UssdComponent,
        data: { requiredOption: 'Pay with USSD' }
      },
      {
        path: 'qr-code',
        component: QrCodeComponent,
        data: { requiredOption: 'Pay with QR Code' }
      },
      {
        path: 'bank-account',
        component: BankAccountComponent,
        data: { requiredOption: 'Pay with Bank Account' }
      },
      {
        path: 'bank-app',
        component: BankAppComponent,
        data: { requiredOption: 'Pay with Bank App' }
      },
      { path: 'unauthorized', component: UnauthorizedComponent },
      { path: '**', redirectTo: 'unauthorized' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
