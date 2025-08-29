import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MiscService } from '../../../../services/misc.service';
import { PaymentService } from '../../../../services/payment.service';
import { FormsModule } from '@angular/forms';
import { AppStorageManager } from '../../../shared/app-storage/storage-manager';
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
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import animationData from '../../../../../public/assets/images/load2.json';

export class NumberVerificationForm {
  number!: string;
  code!: string;
}

@Component({
  selector: 'app-mobile-money',
  standalone: true,
  imports: [FormsModule, CommonModule, LottieComponent],
  templateUrl: './mobile-money.component.html',
})
export class MobileMoneyComponent implements OnInit {
  @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;
  currentStep: string = 'step-one';
  momoNetworks: any = [];
  numberVerificationFormData: NumberVerificationForm;
  user: any;
  transactionInfo: any;
  merchant: any;
  timeLeft: number = 59;
  private timer: any;
  paymentLoading = false;
  tnxRef: any;
  momoReq: any;
  txnId: any;
  verifyLoading = false;

  constructor(
    public miscService: MiscService,
    private paymentService: PaymentService,
    private storageManager: AppStorageManager,
    private toastr: ToastrService,
    private router: Router,
    private decimalPipe: DecimalPipe
  ) {
    this.numberVerificationFormData = new NumberVerificationForm();
  }

  ngOnInit(): void {
    this.numberVerificationFormData.code = '';
    this.merchant = this.storageManager.getFromStorage('merchant');
    this.getMomoNetworks();
    this.transactionInfo = this.storageManager.getFromStorage('transactionInfo')
  }

  dropdownOpen = false;
  selectedProvider: any;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectProvider(provider: any) {
    this.selectedProvider = provider;
    this.numberVerificationFormData.code = provider.bank_code;
    this.dropdownOpen = false;
  }
  displayTime: string = '2:00';

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

  getMomoNetworks() {
    this.paymentService.fetchMomoPayNetworks().subscribe({
      next: (res: any) => {
      
        this.momoNetworks = res?.data;
      },
    });
  }

  triggerVerify() {
    this.verifyLoading = true;
    // console.log('sending:', this.numberVerificationFormData);
    this.paymentService
      .VerifyMomoNumber(
        this.numberVerificationFormData.number,
        this.numberVerificationFormData.code
      )
      .subscribe({
        next: (res: any) => {
         
          this.user = res?.data;
         
          this.storageManager.storeToStorage('walletInfo',res?.data)
        
          this.verifyLoading = false;
        },
        error: (error: any) => {
          this.verifyLoading = false;
          this.toastr.error(error?.error?.message)
        },
      });
  }

  triggerMomoPay() {
    const payload = {
      account_id: '',
      account_name: this.user?.name,
      amount: JSON.stringify(this.storageManager.getFromStorage('totalAmount')),
      channel: 'momo',
      client_transaction_id: '',
      country: 'GH',
      credit_data: {
        alpha2CountryCode: this.merchant?.currency?.iso_code_2,
        comments: {},
        customerEmail: this.transactionInfo?.customer_email || '',
        customerName: this.user?.name,
        description: JSON.stringify(
          this.miscService.convertProductsArrayToObject(
            this.transactionInfo.products
          )
        ),
        is_giving: false,
        merchant_id: this.transactionInfo?.merchant_id,
        metadata: this.transactionInfo?.metadata || {},
        paymentType: 'momo',
        reference: this.transactionInfo.client_transaction_id,
      },
      currency: this.transactionInfo?.currency,
      description: this.transactionInfo?.description || '',
      elevy_fee: '0',
      from_acct: this.user?.accounts[0]?.account_id.substring(3),
      from_provider_code: this.numberVerificationFormData.code,
      to_acct: this.merchant?.merchant_id,
      to_provider_code: this.numberVerificationFormData.code,
      transaction_fee: '0',
      type: 'paygate_momo_pay',
      user_id: this.merchant?.merchant_id,
    };

    const ticketInfo={
      transType:'paygate_momo_pay',
      reference:this.transactionInfo.client_transaction_id,
      date:Date.now()
    }

    this.storageManager.storeToStorage('receiptData',ticketInfo)
    this.paymentService.MomoPay(payload).subscribe({
      next: (res: any) => {
       
        this.momoReq = res?.data?.response;
        this.txnId = res?.data?.transaction_id;
        this.currentStep = 'step-two';
      },
    });
  }

  confirmPayment() {
    this.checkTransactionStatus(this.txnId, this.momoReq?.country_code);
  }

  checkAgain() {
    this.stopTimer();
    this.timeLeft = 120;
    this.paymentLoading = true;
    this.checkTransactionStatus(this.txnId, this.momoReq?.country_code);
  }

  checkTransactionStatus(transactionId: string, countryCode: string) {
    const initialIntervalMs = 15000; 
    const intervalIncrementMs = 5000; 
    const maxDurationMs = 120000; 
    const startTime = Date.now();
    let currentIntervalMs = initialIntervalMs;

    this.openModal();
    this.startTimer();

    const startLongPolling = (): Observable<any> => {
      return this.paymentService
        .checkMomoTransactionStatus(transactionId, countryCode)
        .pipe(
          switchMap((response: any) => {
            if (response?.data?.status == 'success') {
              this.stopTimer();
              this.closeModal();
              this.router.navigate(['/success']);
              return EMPTY;
            }
            else if (Date.now() - startTime < maxDurationMs) {
              currentIntervalMs += intervalIncrementMs;
              // console.log("incremented to:", currentIntervalMs)
              return timer(currentIntervalMs).pipe(
                switchMap(() => startLongPolling())
              );
            } else if(response?.data?.status == 'failed') {
              this.toastr.error('Sorry! the transaction was unsuccessful. Please try again.')
              return EMPTY;
            } else {
              this.stopTimer();
              this.toastr.error('Transaction timeout. Please try again.');
              return EMPTY;
            }
          }),
          catchError((err) => {
            if (Date.now() - startTime < maxDurationMs) {
              currentIntervalMs += intervalIncrementMs;
              return timer(currentIntervalMs).pipe(
                switchMap(() => startLongPolling())
              );
            } else {
              this.stopTimer();
              this.toastr.error('Unable to confirm transaction status.');
              return EMPTY;
            }
          })
        );
    };

    startLongPolling().subscribe();
  }

  openModal() {
    if (this.modalRef?.nativeElement?.showModal) {
      this.modalRef.nativeElement.showModal();
    } else {
    
    }
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
