import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MiscService } from '../../../../services/misc.service';
import { ScriptLoaderService } from '../../../../services/script-loader.service';
import { PaymentService } from '../../../../services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import animationData from '../../../../../public/assets/images/load2.json';
import { AppStorageManager } from '../../../shared/app-storage/storage-manager';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare var PaymentSession: any;
declare var ThreeDS: any;

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [LottieComponent,FormsModule],
  templateUrl: './card.component.html',
})
export class CardComponent implements OnInit,AfterViewInit {
   @ViewChild('modalRef') modalRef!: ElementRef<HTMLDialogElement>;

  sessionId!: string;
  orderId!: string;
  transactionId!: string;
  merchantId!: string;
  paymentLoading = false
  status = ''
  retry = false
  accountName = ""
  initStatus = false

  constructor(
    private paymentService: PaymentService,
    private scriptLoader: ScriptLoaderService,
    public mscService: MiscService,
    private zone: NgZone,
    private route : ActivatedRoute,
    private storageManager: AppStorageManager,
    private router:Router,
    private toastService:ToastrService
  ) {}

  ngAfterViewInit(): void {
    if(this.status == 'SUCCESS' && this.paymentLoading){
      this.openModal()
    }else if(this.status == 'SUCCESS' && !this.paymentLoading){ 
      this.openModal()
    }
  }

 ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const orderId = params['orderId'];
    this.status = params['status'];

    // console.log('orderId::', orderId);
    // console.log('status::', this.status);

    // Load Mastercard scripts only if there is NO orderId and NO status in URL
    if (!orderId && !this.status) {
      this.loadMastercardScripts();
    }

    // You can also handle your payment verification flow here if needed
    // if (orderId && this.status) {
    //   this.verifyPayment(orderId, this.status);
    // }
  });
}


  finalCardPaymentLeg(session_id:string){
    this.paymentLoading = true
    this.paymentService.completeCardPayment(session_id).subscribe({
      next: (res) => {
      // console.log("card payment success:", res)
      this.paymentLoading = false
      if(res.status == "SUCCESS"){
        this.router.navigate(['/success'])
      }else
       if(res.status == "FAILED"){
        // console.log('ike')
        this.retry = true 
      }
      },
      error: (err) => {
       // console.log("there was an error with card payment!!")
      }
    });
  }

  loadMastercardScripts() {
    Promise.all([
      this.scriptLoader.loadScript('https://eu-gateway.mastercard.com/form/version/100/merchant/GTB107503B02/session.js'),
      this.scriptLoader.loadScript('https://eu-gateway.mastercard.com/static/threeDS/1.3.0/three-ds.min.js')
    ])
      .then(() => this.initiatePaymentSession())
      .catch(err => console.error('Script loading failed:', err));
  }

  initiatePaymentSession() { 
    const payload = {
      amount: "1",
      transaction_id:'XPG250828TBDOS60CC',
      phone_number:'233598390289',
      // redirect_url:'https://test-server.free.beeceptor.com/webhook'
      // clientTransactionId: this.generateClientTransactionId(),
      // currency: "GHS",
      // description: "Payment for Order #4567",
      // email: "customer@example.com",
      // phoneNumber: "233554538775",
      // channel: "WEB",
      // threeDSAuthRedirectUrl: "http://localhost:8383/Mastercard/hosted_session_3ds_final.html",
      // notificationUrl: "https://webhook.site/66a35982-8777-4414-bd69-6947dfac4069"
    };

    this.paymentService.initiatePayment(payload).subscribe({
      next: (data) => {
        // console.log("initiate resp:", data)
        if(data.status == "PENDING"){
          this.initStatus = true 
        }
        this.sessionId = data.sessionId;
        this.storageManager.storeToStorage('session_id',this.sessionId)
        this.orderId = data.orderId;
        this.transactionId = data.txnId;
        this.merchantId = data.merchantId;
        this.configurePaymentSession();
      },
      error: (err) => console.error('Error initiating session:', err)
    });

    const receiptData ={
      type:'Card',
      reference:payload.transaction_id
    }

    this.storageManager.storeToStorage('receiptData',receiptData)

    const walletInfo ={
      type:'Card',
      name:"eshun"
    }
    this.storageManager.storeToStorage('walletInfo',walletInfo)

  }

  generateClientTransactionId(): string {
    const prefix = "TRX";
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${datePart}${randomSuffix}`;
  }

  configurePaymentSession() {
    if (typeof PaymentSession === 'undefined') {
      console.error('PaymentSession SDK not loaded!');
      return;
    }
  
    PaymentSession.configure({
      session: this.sessionId,
      fields: {
        card: {
          number: "#card-number",
          securityCode: "#security-code",
          expiryMonth: "#expiry-month",
          expiryYear: "#expiry-year",
          nameOnCard: "#cardholder-name"
        }
      },
      // 👇 frameEmbeddingMitigation should be here, not under interaction
      frameEmbeddingMitigation: ["javascript", "x-frame-options"],
  
      interaction: {
        displayControl: {
          formatCard: "EMBOSSED",
          invalidFieldCharacters: "REJECT"
        }
      },
  
      callbacks: {
        initialized: (response: any) => {
          this.zone.run(() => {
            // console.log("PaymentSession initialized:", response);
          });
        },
        formSessionUpdate: (response: any) => {
          this.zone.run(() => {
            if (response.status === "ok") {
              this.trigger3DSAuthentication();
            } else {
              if (response.errors) {
                const errorMessages: string[] = [];
        
                if (response.errors.cardNumber) {
                  errorMessages.push("The card number is not valid");
                }
                if (response.errors.expiryYear) {
                  errorMessages.push("The expiry year is not valid");
                }
                if (response.errors.expiryMonth) {
                  errorMessages.push("The expiry month is not valid");
                }
                if (response.errors.securityCode) {
                  errorMessages.push("The CVV/security code is not valid");
                }
                if (response.errors.cardholderName) {
                  errorMessages.push("The cardholder name is not valid");
                }
        
                // Show all errors in one toast (or multiple if you prefer)
                this.toastService.error(errorMessages.join(", "), "Payment Error");
              } else {
                this.toastService.error("Payment form validation failed. Please try again.", "Payment Error");
              }
            }
          });
        }
        
      }
    });
  }
  

  trigger3DSAuthentication() {
    if (typeof ThreeDS === 'undefined') {
      console.error('ThreeDS SDK not loaded!');
      return;
    }

    ThreeDS.configure({
      merchantId: this.merchantId,
      sessionId: this.sessionId,
      containerId: "3DSUI",  
      callback: () => {
        this.zone.run(() => console.log());
      },
      configuration: { userLanguage: "en-US", wsVersion: 100 }
    });

    ThreeDS.initiateAuthentication(this.orderId, this.transactionId, (data: any) => {
      this.zone.run(() => {
        if (data.gatewayRecommendation === "PROCEED") {
          this.authenticatePayer();
        } else {
          console.error("3DS recommendation:", data.gatewayRecommendation);
        }
      });
    });
  }

  authenticatePayer() {
    ThreeDS.authenticatePayer(
      this.orderId,
      this.transactionId,
      (data: any) => {
        this.zone.run(() => {
          // console.log("Auth Payer response:", data);
        });
      },
      { fullScreenRedirect: true }
    );
  }

  pay() {
    if (typeof PaymentSession === 'undefined') {
      console.error('PaymentSession SDK not loaded!');
      return;
    }
    PaymentSession.updateSessionFromForm('card');
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