import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MiscService } from '../../../services/misc.service';
import { ToastrService } from 'ngx-toastr';
import { AppStorageManager } from '../../shared/app-storage/storage-manager';
import { PaymentService } from '../../../services/payment.service';

export const PaymentMethod = {
  PayWithCard: "Pay with Card",
  PayWithXCEL: "Pay with XCEL",
  PayWithBankApp: "Pay with Bank App",
  PayWithBankAccount: "Pay with Bank Account",
  PayWithMobileMoney: "Pay with Mobile Money",
  PayWithUSSD: "Pay with USSD",
  PayWithQRCode: "Pay with QR Code",
  PayWithApplePay: "Pay with Apple Pay",
} as const;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ]
})
export class DashboardComponent implements OnInit {
  publicKey: string | undefined;
  amount: number = 0;
  alpha2CountryCode: string | undefined;
  currency: string | undefined;
  customer: { name: string, email: string } | undefined;
  description: string | undefined;
  reference: string | undefined;
  productId: string | undefined;
  products  = []
  merchantId: string | undefined;
  origin: string | undefined;
  redirectWhenCancelledUrl: string | undefined;
  redirectWhenSuccessfulUrl: string | undefined;
  merchantDetails: any | undefined;
  loading: boolean | undefined;
  totalAmount: number = 0;
  paymentCode :any | undefined
  MerchantsOptions:any = []
  transactionData:any
  totalFee:any
  merchant:any
  errorMessage:any
  paymentCodePassed = false

  menuItems = [
    {
      label: PaymentMethod.PayWithXCEL,
      icon: '/assets/icons/xcel.svg',
      route: '/main/xcel',
    },
    // {
    //   label: PaymentMethod.PayWithCard,
    //   icon: '/assets/icons/card.svg',
    //   route: '/main/card',
    // },
    // {
    //   label: PaymentMethod.PayWithBankApp,
    //   icon: '/assets/icons/bank-app.svg',
    //   route: '/main/bank-app',
    // },
    // {
    //   label: PaymentMethod.PayWithBankAccount,
    //   icon: '/assets/icons/bank-account.svg',
    //   route: '/main/bank-account',
    // },
    {
      label: PaymentMethod.PayWithMobileMoney,
      icon: '/assets/icons/mobile-money.svg',
      route: '/main/mobile-money',
    },
    {
      label: PaymentMethod.PayWithUSSD,
      icon: '/assets/icons/ussd.svg',
      route: '/main/ussd',
    },
    // {
    //   label: PaymentMethod.PayWithQRCode,
    //   icon: '/assets/icons/qr-code.svg',
    //   route: '/main/qr-code',
    // },
  ];

  constructor(
    public router: Router,
    public _router: ActivatedRoute,
    public miscService: MiscService,
    private toastr: ToastrService,
    private storageManager: AppStorageManager,
    private paymentService: PaymentService,
  ) { }
  
  ngOnInit(): void {
    this.paymentCode = this._router.snapshot.queryParamMap.get('code') || this.storageManager.getFromStorage('paymentCode');
    this.storageManager.storeToStorage('paymentCode',this.paymentCode)
    this.getTransactionData(this.paymentCode)

  }

  chargeCustomer = () => {
    const payload = {
      products: this.transactionData.products,
      payment_option: this.miscService.getCurrentPaymentMethod()
    }
    this.paymentService.chargeCustomer(payload, this.transactionData?.merchant_id!).subscribe({
      next: (res) => {
        // console.log('fees:', this.miscService.getTotalFees(res?.data?.productDetails))
        this.totalFee = this.miscService.getTotalFees(res?.data?.productDetails)
        if (res.success) {
          this.totalAmount = res.data.totalAmount;
          // console.log('true amt:',this.totalAmount)
          this.storageManager.storeToStorage('totalAmount', this.totalAmount);
        }
      },
      error: (err) => {
        // this.loading = false;
        this.toastr.error(err?.error?.message, 'Error');
      }
    });
  };

  fetchMerchantDetails = (id:any) => {
    this.loading = true;
    this.miscService.getMerchantDetails(id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status) {
          this.merchantDetails = res?.data?.data;
          this.MerchantsOptions = this.menuItems.filter(item =>
            this.merchantDetails.payment_options.includes(item.label)
          );
          this.storageManager.storeToStorage('merchant', this.merchantDetails);
          this.setDefaultRoute();
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message, 'Error');
        this.router.navigate(['/main/unauthorized']);
      }
    });
  };

  createMerchantCustomer = () => {
    this.loading = true;
    let requestBody: any = {
      firstName: this.customer!.name,
      lastName: this.customer!.name,
      password: '',
      email: this.customer!.email,
      phoneNumber: '',
      merchant_id: this.transactionData?.merchant_id
    }
    this.paymentService.createMerchantCustomer(requestBody).subscribe((response:any)=>{
      if(response.status) {
        this.loading = false;
        this.storageManager.storeToStorage('xs_access_token',response?.access_token )
      } else {
        this.toastr.error(response.message, 'Error');
        this.loading = false;
      }
    }, err => {
      this.toastr.error(err?.error?.message, 'Error');
      this.loading = false;
    })
  }

  transformLabel = (label: string) => {
    if(label.toLowerCase().includes('mobile money')) {
      return 'Pay with Momo';
    } else {
      return label;
    }
  }

  filterMenuItems = () => {
    if (this.merchantDetails?.payment_options) {
      this.menuItems = this.menuItems.filter(item =>
        this.merchantDetails.payment_options.includes(item.label)
      );
    }
  };


  getTransactionData(code:any){
    this.paymentService.fetchTransactionData(code).subscribe({
      next:(res)=>{
        this.transactionData = res?.data
        this.storageManager.storeToStorage('transactionInfo',this.transactionData)
        this.fetchMerchantDetails(this.transactionData?.merchant_id)
        this.validate(this.transactionData?.merchant_id,this.transactionData?.public_key)
        this.paymentCodePassed = true
      },
      error:(error)=>{
        // this.toastr.error("Sorry! couldn't fetch transaction Data")
        this.errorMessage = error
        this.paymentCodePassed = false
      }
    })
  }

  validate(id:any,pubKey:any){
    this.paymentService.validateMerchant(id,pubKey).subscribe({
      next:(res:any)=>{
        this.storageManager.storeToStorage('paymentToken',res?.data?.token)
        this.storageManager.storeAccessToken('xs_access_token',res?.data?.token)
        this.getMerchantDefaultProduct(res?.data?.details?.merchant_id,res?.data?.token)
      },
      error:(error)=>{
        this.toastr.error("Sorry! this merchant is not available on our system")
      }
    })
  }



  getMerchantDefaultProduct = (merchantId:string,token:string) => {
    this.loading = true;
    this.miscService.getMerchantDefaultProduct(merchantId,token).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status) {
     
        this.storageManager.storeToStorage('merchantDefaultProductDetails',res?.data)
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message, 'Error');
      }
    });
  };

  setDefaultRoute() {
    if (this.merchantDetails?.payment_options?.length > 0) {
      const defaultOption = this.merchantDetails.payment_options[0];
      const queryParams = this._router.snapshot.queryParams;

      this.miscService.setCurrentPaymentMethod(defaultOption);
      this.chargeCustomer();
  
      switch (defaultOption) {
        case 'Pay with XCEL':
          this.router.navigate(['/main/xcel'] );
          break;
        case 'Pay with Card':
          this.router.navigate(['/main/card'] );
          break;
        case 'Pay with Mobile Money':
          this.router.navigate(['/main/mobile-money']);
          break;
        case 'Pay with USSD':
          this.router.navigate(['/main/ussd']);
          break;
        case 'Pay with QR Code':
          this.router.navigate(['/main/qr-code']);
          break;
        case 'Pay with Bank Account':
          this.router.navigate(['/main/bank-account']);
          break;
        case 'Pay with Bank App':
          this.router.navigate(['/main/bank-app']);
          break;
        default:
          this.router.navigate(['/main/unauthorized'], { queryParams });
      }
    } else {
      this.router.navigate(['/main/unauthorized'], { queryParams: this._router.snapshot.queryParams });
    }
  }  

}
