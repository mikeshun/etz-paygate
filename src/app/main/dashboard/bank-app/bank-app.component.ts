import { Component, OnInit } from '@angular/core';
import { MiscService } from '../../../../services/misc.service';
import { PaymentService } from '../../../../services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { AppStorageManager } from '../../../shared/app-storage/storage-manager';
import { EnvironmentService } from '../../../../environments/environment.service';
import { CountryService } from '../../../shared/utils/countries.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bank-app',
  standalone: true,
  imports: [],
  templateUrl: './bank-app.component.html',
})
export class BankAppComponent implements OnInit {

  accountDetails:any
  merchantBankDetails:any

  constructor(
    public miscService: MiscService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private storageManager: AppStorageManager,
    private environmentService: EnvironmentService,
    private countryService: CountryService,
    private router: Router
  ) {}
  ngOnInit(): void {
    // this.getMerchantPaymentDetails()
    this.merchantBankDetails =  JSON.parse(sessionStorage.getItem('merchantBankDetails') || "")
    // console.log("hellooo", this.merchantBankDetails)
  }


 
  // getMerchantPaymentDetails(){
  //   const payload ={
  //     currency_code:'GHS',
  //     merchant_id:'j6ulbdt0c'
  //   }
  //   this.paymentService.getMerchantAccountDetails(payload).subscribe({
  //     next:(res)=>{
  //       // console.log("merchant-details:", res)
  //       this.accountDetails = res.data
  //     }
  //   })
  // }
}
