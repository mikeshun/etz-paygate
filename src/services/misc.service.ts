import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { retry } from 'rxjs/operators';
import { AppStorageManager } from '../app/shared/app-storage/storage-manager';
import { AuthHeaderService } from './auth-header.service';
import { EnvironmentService } from '../environments/environment.service';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class MiscService {

    constructor(
        private appStorage: AppStorageManager, 
        private http: HttpClient, 
        private authHeaderService: AuthHeaderService,
        private environment: EnvironmentService,
    ) { }

    private currentPaymentMethod: string | null = null;

    setCurrentPaymentMethod(paymentMethod: string): void {
        this.currentPaymentMethod = paymentMethod;
    }

    getCurrentPaymentMethod(): string | null {
        return this.currentPaymentMethod;
    }

    public getMerchantDetailsFromStorage = () => this.appStorage.getFromStorage('merchant')

    setDecryptedParams = (paramsToStore: any, key: string) => {
        const secretKey = this.environment.CRYPTO_JS_URL;
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(paramsToStore), secretKey).toString();
        sessionStorage.setItem(key, encryptedData);
    }

    getDecryptedParams = (key: string) => {
        const secretKey = this.environment.CRYPTO_JS_URL;
        const encryptedData = sessionStorage.getItem(key);
      
        if (encryptedData) {
          const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
          const params = JSON.parse(decryptedData);
          return params;
        }
      
        return null;
    };

     getTotalFees(items: any[]): number {
        return items.reduce((sum, item) => sum + Number(item.fee), 0);
      }

    validateQueryParams(params: {
        publicKey?: string;
        amount?: number;
        alpha2CountryCode?: string;
        currency?: string;
        customer?: { name: string, email: string };
        description?: string;
        reference?: string;
        productId?: string;
        merchantId?: string;
        origin?: string;
        redirectWhenCancelledUrl?: string;
        redirectWhenSuccessfulUrl?: string;
      }): boolean {
        return Boolean(
          params.publicKey &&
          params.amount &&
          params.alpha2CountryCode &&
          params.currency &&
          params.customer &&
          params.description &&
          params.reference &&
          params.productId &&
          params.merchantId &&
          params.origin &&
          params.redirectWhenCancelledUrl &&
          params.redirectWhenSuccessfulUrl
        );
    }

    user = undefined;
    paymentCustomer=undefined
    userSubject = new BehaviorSubject(this.user)
    paymentCustomerSubject = new BehaviorSubject(this.paymentCustomer)

    updateUser = (update: any) => {
        this.user = update;
        this.userSubject.next(this.user);
        this.appStorage.storeToStorage('user', this.user);
    }

    preventLetter(evt: any): boolean {
        var charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
        return true;
    }

    preventLetterAllowPlus(evt: any): boolean {
        var charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 43) return false;
        return true;
    }

    updatePaymentCustomer = (customer: any) => {
        this.paymentCustomer = customer;
        this.paymentCustomerSubject.next(this.paymentCustomer);
        this.appStorage.storeToStorage('logged-in-customer', this.paymentCustomer);
    }

    genRandomString = (length: number) =>  Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1)

    // numberWithCommas = (number) => {
    //     if (!number) { return '0'; }
    //     const parts = number.toString().split('.');
    //     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    //     return  parseFloat(parts.join('.')).toFixed(2);
    //   }
    numberWithCommas = (x: any) => {
        if (!x) { return '0'; }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        parts = parts.join(".")
        if(parts.includes('.'))
            return parts
        else return parts + '.00'
      }

    formatDateAndTime = (date: string | null) => {
        if (!date) { return ''; }
        const dateToFormat = new Date(date);
        return dateToFormat.toDateString() + ' ' + dateToFormat.toLocaleTimeString()
    }
    formatDate = (date: string | null) => {
        if (!date) { return ''; }
        const dateToFormat = new Date(date);
        return dateToFormat.toDateString() 
    }
    formatTime = (date: string | null) => {
        if (!date) { return ''; }
        const dateToFormat = new Date(date);
        return dateToFormat.toLocaleTimeString()
    }

    formatTo2DecimalPlaces = (number: any) => {
        if (!number) { return; }
        number = number.toString()
        if(number.includes('.')){
            number = parseFloat(number)
            return parseFloat(number.toFixed(2)).toString()
        }
        else {
            return number + '.00'
        }
    }

     convertProductsArrayToObject(products: any[]): Record<string, string> {
        return Object.fromEntries(
          products.map(({ product_id, amount }) => [product_id, amount])
        );
      }

    updateProfilePic(file: any, merchant_id: string): Observable<any> {
        let form = new FormData();
        form.append('file', file);
        return this.http.put(`${this.environment.BUSINESS_URL}/merchant/upload-logo/${merchant_id}`, form).pipe(retry(3))
    }

    fetchImageUrl(file: any): Observable<any> {
        let form = new FormData();
        form.append('image', file);
        return this.http.post(`${this.environment.SERVER_URL}/transactions-service/bucket/upload`, form).pipe(retry(3))
    }

    transformBranchName(branchName: string): string {
        return branchName?.replace(/Winners Chapel International/i, 'WCI') || '';
    }

    fetchUtilityTypes(): Observable<any> {
        return this.http.get(`${this.environment.SERVER_URL}/transactions-service/utility-type`).pipe(retry(3))
    }
//    function formatTo2DecimalPlaces(number){
//         if (!number) { return; }
//         parseFloat(number).toFixed(2)
//     }

    validateXcelAccount = (walletNumber: any, schemeCode: any): Observable<any> => {
        return this.http.get(`${this.environment.XAS_URL}/merchant/accounts/validate/${walletNumber}/${schemeCode}`).pipe(retry(3))
    }
    // validateXcelAccount = (walletNumber, schemeCode): Observable<any> => {
    //     return this.http.get(`${this.environment.BUSINESS_URL}/source/details/${walletNumber}/${schemeCode}`).pipe(retry(3))
    //   }

    formatCountryCode = (countryCode: any) => countryCode.length == 1? '00' + countryCode : countryCode.length == 2? '0' + countryCode : countryCode

    getSettlementAccounts = () => this.http.get(`${this.environment.BUSINESS_URL}/merchant/banks/${this.getMerchantDetailsFromStorage().merchant_id}`)

    createSettlementAccount = (body: any) => this.http.post(`${this.environment.BUSINESS_URL}/merchant/add/bank`, body)

    getMerchantWallets = () => this.http.get(`${this.environment.BUSINESS_URL}/merchant/wallets/${this.getMerchantDetailsFromStorage().merchant_id}`)
    
    getMerchantDetails = (merchant_id: string): Observable<any> => this.http.get(`${this.environment.BUSINESS_URL}/merchant/details/${merchant_id}`)
    
    // getMerchantDefaultProduct = (merchant_id: string): Observable<any> => this.http.get(`${this.environment.BUSINESS_URL}/merchant/pos/${merchant_id}`)

    getMerchantDefaultProduct = (merchantId: any, token:string): Observable<any> => {
      
        // console.log('napoo:', token)
        const headers = new HttpHeaders({
          'Authorization': `${token}`  
        });
        return this.http.get(
          `${this.environment.BUSINESS_URL}/merchant/pos/${merchantId}`,
          { headers }
        );
      }

    createMerchantWallet = (body: any) => this.http.post(`${this.environment.BUSINESS_URL}/merchant/wallet`, body)

    createMerchantWalletUK1 = (body: any) => this.http.post(`${this.environment.BUSINESS_URL}/psp/account`, body)

    createMerchantWalletUK2 = (body: any) => this.http.post(`${this.environment.BUSINESS_URL}/merchants/modulr/account`, body)

    // validateAccount = (currencyCode, bankCode, accountNumber) => this.http.get(`${this.environment.BUSINESS_URL}/psp/validate/account/${currencyCode}/${bankCode}/${accountNumber}`)

    validateAccount = (bankCode: any, accountNumber: any, countryCode: any):Observable <any> => {
        const xAuthHeader = this.authHeaderService.generateAuthHeader({});
        const headers = new HttpHeaders()
        .set('X-Auth-Signature', xAuthHeader)
        .set('X-APP-ID', `${this.environment.X_APP_ID}`)
        .set('X-ISSUER-ID', `${this.environment.X_ISSUER_ID}`);
        return this.http.get(`${this.environment.XAS_URL}/merchant/accounts/validate/${countryCode}/${accountNumber}/${bankCode}/external`, {headers})
    }

    getBanks = () => {
        if(this.getMerchantDetailsFromStorage().currency.iso_code_2 === 'GB'){
            return of([]);
    } else {
           return this.http.get(`${this.environment.BUSINESS_URL}/banks/${this.getMerchantDetailsFromStorage().country_code}`)
        }
    }

    getCountries = () => this.http.get(`${this.environment.BUSINESS_URL}/business/countries`)

    validateSortCode = (countryCode: any, sort_code: any) => {
        const xAuthHeader = this.authHeaderService.generateAuthHeader({});
        const headers = new HttpHeaders()
        .set('X-Auth-Signature', xAuthHeader)
        .set('X-APP-ID', `${this.environment.X_APP_ID}`)
        .set('X-ISSUER-ID', `${this.environment.X_ISSUER_ID}`);
        return this.http.get(`${this.environment.XAS_URL}/merchant/accounts/validate-bank-code/${countryCode}/${sort_code}`, {headers})
    }

    getCountryDetails = (iso_2: string): Observable<any> => this.http.get(`${this.environment.SERVER_URL}/administrator/countries/${iso_2}`)

    performBalanceInquiry = (accountIdentifier: any) => {
        if(this.getMerchantDetailsFromStorage().currency.iso_code_2 === 'GB'){
            return this.http.get(`${this.environment.BUSINESS_URL}/psp/account/balance/${accountIdentifier}`) 
        } else{
            return this.http.get(`${this.environment.BUSINESS_URL}/source/wallet/balance/${accountIdentifier}`)
        }
    }

    requestTransactionOTP = (accountIdentifier: any) => {
        const schemeCode = this.getMerchantDetailsFromStorage().country_code + '004'
        return this.http.get(`${this.environment.BUSINESS_URL}/source/otp/${accountIdentifier}/${schemeCode}?group=true`)
    }
    requestTransactionOTP2 = (payload: any) => {
        return this.http.post(`${this.environment.ESA_URL}/api/otp/generate/payment-authorization`, payload)
    }
    verifyOTP = (payload: any) => {
        return this.http.post(`${this.environment.ESA_URL}/api/otp/verify/payment-authorization`, payload)
    }

    fetchSubMerchants(merchantId:string): Observable<any>{
        return this.http.get(`${this.environment.TRANSACTION_URL}/merchant/${merchantId}/sub-merchants`).pipe(retry(3))
    }
}
