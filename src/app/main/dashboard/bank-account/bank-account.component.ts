import { Component, OnInit } from '@angular/core';
import { MiscService } from '../../../../services/misc.service';
import { PaymentService } from '../../../../services/payment.service';
import { FormsModule } from '@angular/forms';


export class AccountVerificatonModel{
   bankCode!:string
   accountNo!:string
   pin!:string
}

@Component({
  selector: 'app-bank-account',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bank-account.component.html',
})
export class BankAccountComponent implements OnInit {
  currentStep: string = 'step-one';
  banks:any = []
  accountVerificationDetails!:AccountVerificatonModel

  constructor(
    public miscService: MiscService,
    private paymentService: PaymentService
  ) {
    this.accountVerificationDetails =  new AccountVerificatonModel()
  }
  ngOnInit(): void {
    this.getBanks()
    this.accountVerificationDetails.bankCode = ""
  }

  getBanks() {
    this.paymentService.fetchBanksByCountry('GH').subscribe({
      next: (res) => {
        // console.log('banks:', res);
        this.banks = res.data
      },
    });
  }

  verifyBankAccount(payload:AccountVerificatonModel) {
    // console.log("payload:", payload)
    this.paymentService.validateBankAccount(payload.accountNo,payload.bankCode).subscribe({
      next: (res) => {
        // console.log('verified:', res);
        this.banks = res.data
      },
    });
  }
}
