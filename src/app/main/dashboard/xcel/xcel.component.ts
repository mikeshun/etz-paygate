import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuid } from 'uuid';
import {
  catchError,
  delay,
  EMPTY,
  Observable,
  of,
  switchMap,
  timer,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgOtpInputComponent } from 'ng-otp-input';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { MiscService } from './../../../../services/misc.service';
import { PaymentService } from './../../../../services/payment.service';
import { AppStorageManager } from './../../../shared/app-storage/storage-manager';
import { EnvironmentService } from './../../../../environments/environment.service';
import { CountryService } from './../../../shared/utils/countries.service';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import animationData from '../../../../../public/assets/images/load2.json';

@Component({
  selector: 'app-xcel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOtpInputComponent,
    LottieComponent,

    // DecimalPipe
  ],
  templateUrl: './xcel.component.html',
})
export class XcelComponent implements OnInit, OnDestroy,AfterViewInit {
  @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;

  queryParams: any;
  loading = false;
  loadingPayment = false;
  loadingWallet = false;

  merchant: any;
  walletDetails: any;
  merchantDefaultProductDetails: any;
  walletForm: FormGroup;
  products = [];
  transactionInfo: any;
  step = 1;
  timeLeft: number = 120;
  private timer: any;
  paymentLoading = false;
  tnxRef: any;
  displayTime: string = '2:00';

  constructor(
    public miscService: MiscService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private storageManager: AppStorageManager,
    private environmentService: EnvironmentService,
    private countryService: CountryService,
    private router: Router,
    private decimalPipe: DecimalPipe
  ) {
    this.walletForm = new FormGroup({
      wallet_number: new FormControl('', Validators.required),
      country_code: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
    });
  }
  ngAfterViewInit(): void {
    const sessionStatus = this.storageManager.getFromStorage('sessionTransactionStatus')?.statusPending
    // console.log("PENDING::", sessionStatus)
    if(sessionStatus){
      // this.paymentLoading = true
      // this.openModal()
      const tsqData =  this.storageManager.getFromStorage('tsqPayload')
      // console.log("mike data:", tsqData)
      this.checkTransactionStatus(tsqData?.merchantId,  this.storageManager.getFromStorage('txn'));
    }
  }

  ngOnInit(): void {
    // this.router.navigate(['/success']);
    this.merchant = this.storageManager.getFromStorage('merchant');
    this.walletForm.patchValue({
      country_code: `+${this.merchant.country_code}`,
    });

    this.transactionInfo = this.storageManager.getFromStorage('transactionInfo')
    this.merchantDefaultProductDetails = this.storageManager.getFromStorage('merchantDefaultProductDetails');

  
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timeLeft = 120;
    this.paymentLoading = true;
    this.displayTime = this.formatTime(this.timeLeft);
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.displayTime = this.formatTime(this.timeLeft);
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  stopTimer() {
    clearInterval(this.timer);
    this.timer = null;
    this.paymentLoading = false;
    this.displayTime = '0:00';
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  verifyWallet = () => {
    this.walletDetails = null;
    this.loadingWallet = true;
    let walletNumber = this.walletForm.value.wallet_number!;

    if (walletNumber?.startsWith('0')) {
      walletNumber = walletNumber.substring(1);
      this.walletForm.patchValue(
        { wallet_number: walletNumber },
        { emitEvent: false }
      );
    }

    this.paymentService
      .verifyWallet(
        this.merchant.currency.iso_code_2,
        this.merchant.country_code,
        walletNumber
      )
      .subscribe({
        next: (res) => {
          this.loadingWallet = false;
          if (res.success) {
            this.walletDetails = res.data[0];
            this.storageManager.storeToStorage('walletInfo',this.walletDetails)
          } else {
            this.toastr.error(res.message, 'Invalid Account');
          }
        },
        error: (err) => {
          this.loadingWallet = false;
          this.toastr.error(err?.error?.message, 'Sorry! something went wrong');
        },
      });
  }


  proceed = () => {
    this.loadingPayment = true;

    const isUk = this.merchant.currency.iso_code_2 === 'GB';
    const payerId = isUk
      ? this.walletDetails?.account_id
      : this.walletDetails?.card_num;
    const payeeId = isUk
      ? this.merchantDefaultProductDetails?.account?.account_id
      : this.merchantDefaultProductDetails?.card_num;

    const payload = {
      config_preset: this.environmentService.CONFIG_PRESET,
      transaction_params: {
        src_amount: this.storageManager.getFromStorage('totalAmount'),
        des_amount: this.storageManager.getFromStorage('totalAmount'),
        payerId,
        payeeId,
      },
    };

    this.paymentService.dynamicLink(payload).subscribe({
      next: (res) => {
        this.loadingPayment = false;
        if (res.status) {
          this.sendPosAuthorization();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => {
        this.loadingPayment = false;
        this.toastr.error(err?.error?.message, 'Error');
      },
    });
  };

  sendPosAuthorization = () => {
    const isUk = this.merchant.currency.iso_code_2 === 'GB';
    const payerId = isUk
      ? this.walletDetails?.account_id
      : this.walletDetails?.card_num;
    const payeeId = isUk
      ? this.merchantDefaultProductDetails?.account?.account_id
      : this.merchantDefaultProductDetails?.card_num;

    const country = this.countryService.getCountryByCode(
      this.merchant!.currency!.iso_code_2!
    );
    const user_country = this.countryService.getCountryByCode(
      this.walletDetails?.country
    );

    this.products = this.transactionInfo?.products;

    const payload = {
      merchant_id: this.merchant.merchant_id,
      payer_wallet_no: this.walletDetails?.identifier,
      pos_wallet_no: payeeId,
      pos_scheme_code: '233',
      amount: JSON.stringify(this.storageManager.getFromStorage('totalAmount')),
      description: 'XCEL WEB payment',
      international: country?.alpha2Code !== user_country?.alpha2Code,
      merchant_country_code: country?.callingCodes[0] || '',
      payer_country_code: user_country?.callingCodes[0] || '',
      merchant_currency: this.transactionInfo?.currency,
      payer_currency: this.transactionInfo?.currency,
      trans_type: 'XCelPOS',
      products: this.transactionInfo.products,
      metadata: this.transactionInfo.metadata || {},
      reference_id: this.transactionInfo.client_transaction_id,
    };

    this.paymentService.sendPosAuthorization(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadingPayment = false;
          this.toastr.success(res.message, 'Success');
          this.tnxRef = res?.data?.external_reference;
          this.storageManager.storeToStorage('txn', this.tnxRef)
          this.checkTransactionStatus(
            this.merchant.merchant_id,
            res?.data?.external_reference
          );
        } else {
          this.loadingPayment = false;
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err) => {
        this.loadingPayment = false;
        this.toastr.error(err?.error?.message, 'Error');
      },
    });
  };

  checkAgain() {
    this.stopTimer();
    this.timeLeft = 120;
    this.paymentLoading = true;
    this.checkTransactionStatus(this.merchant.merchant_id, this.storageManager.getFromStorage('txn'));
  }

  checkTransactionStatus(merchantId: string, reference: string) {
    const tsqPayload  = {
      merchantId : this.merchant.merchant_id,
      tnxRef:this.tnxRef
    }
    this.storageManager.storeToStorage('tsqPayload', tsqPayload)
   const sessionInfo = {
      option:'xcel',
      statusPending:true
   }
    this.storageManager.storeToStorage('sessionTransactionStatus',sessionInfo )
    const initialIntervalMs = 15000; 
    const intervalIncrementMs = 10000; 
    const maxDurationMs = 120000; 
    const startTime = Date.now();
    let currentIntervalMs = initialIntervalMs;
  
    this.openModal();
    this.startTimer();
  
    const pollTransaction = (): Observable<any> => {
      return this.paymentService
        .checkTransactionStatus(merchantId, reference)
        .pipe(
          switchMap((response: any) => {
            if (response.data.paid) {
              this.stopTimer();
              this.closeModal();
            
              this.storageManager.storeToStorage('receiptData',response?.data)
              this.router.navigate(['/success']);
              const sessionInfo = {
                option:'xcel',
                statusPending:false
             }
              this.storageManager.storeToStorage('sessionTransactionStatus',sessionInfo )
              return EMPTY;
            } else if (Date.now() - startTime < maxDurationMs) {
              const delay = currentIntervalMs;
              currentIntervalMs += intervalIncrementMs; 
          
              return timer(delay).pipe(
                switchMap(() => pollTransaction())
              );
            } else {
              this.stopTimer();
              this.toastr.error('Transaction timeout. Please try again.');
              return EMPTY;
            }
          }),
          catchError((err) => {
            if (Date.now() - startTime < maxDurationMs) {
              const delay = currentIntervalMs;
              currentIntervalMs += intervalIncrementMs; 
              return timer(delay).pipe(
                switchMap(() => pollTransaction())
              );
            } else {
              this.stopTimer();
              this.toastr.error('Unable to confirm transaction status.');
              return EMPTY;
            }
          })
        );
    };
  
    pollTransaction().subscribe();
  }
  

  openModal() {
    this.modalRef?.nativeElement?.showModal();
  }

  closeModal() {
    this.modalRef?.nativeElement?.close();
  }

  options: AnimationOptions = {
    animationData: animationData,
    loop: true,
    autoplay: true,
  };
}
