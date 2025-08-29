import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppStorageManager } from '../../shared/app-storage/storage-manager';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import animationData from '../../../../public/assets/images/success1.json';

@Component({
  selector: 'app-bank-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LottieComponent
  ],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {

  receiptData:any
  walletDetails:any
  merchant:any
  appMerchant:any
  amount:any 
  transactionData:any
  today = new Date();
  constructor(private storageManager: AppStorageManager, private decimalPipe: DecimalPipe, private route:ActivatedRoute){}


  ngOnInit(): void {
    this.amount = this.storageManager.getFromStorage('totalAmount')
    this.merchant = this.storageManager.getFromStorage('merchant');
  this.receiptData  = this.storageManager.getFromStorage('receiptData')
  this.walletDetails  = this.storageManager.getFromStorage('walletInfo')
  // console.log("RR-dataa:", this.receiptData)
  // console.log('merchantmm:',this.appMerchant)
  this.transactionData = this.storageManager.getFromStorage('transactionInfo')
  // console.log('wallet details:', this.walletDetails)


  this.route.queryParams.subscribe(params => {
    const orderId = params['orderId'];
    const status = params['status'];

    // console.log('orderId::', orderId)
    // console.log('status::', status)


    
    // Verify payment with your backend
    // this.paymentService.verifyPayment(this.orderId).subscribe({
    //   next: (result) => {
    //     this.loading = false;
    //     this.paymentSuccess = result.success;
    //   },
    //   error: (err) => {
    //     this.loading = false;
    //     this.paymentSuccess = false;
    //   }
    // });
  });
  }

  print = () => {
    window.print();
  }


  options: AnimationOptions = {
    animationData: animationData,
    loop: false,
    autoplay: true,
  };
}
