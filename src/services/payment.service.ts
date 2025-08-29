import { Injectable } from '@angular/core';
import { EnvironmentService } from '../environments/environment.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthHeaderService } from './auth-header.service';
import { AppStorageManager } from '../app/shared/app-storage/storage-manager';

@Injectable({
  providedIn: 'root'
})

export class PaymentService {

  constructor(
    private http: HttpClient,
    private environment: EnvironmentService,
     private authHeaderService: AuthHeaderService,
     private storageManager: AppStorageManager,
  ) { }

  chargeCustomer = (payload: any, merchant_id: string): Observable<any> => this.http.post(`${this.environment.TRANSACTION_URL}/merchant/charge-customer/${merchant_id}`, payload);
  
  verifyWallet = (alpha2code: string, alpha3code: string, phone: string): Observable<any> => this.http.get(`${this.environment.XAS_URL}/accounts/users/${alpha2code}/${alpha3code}${phone}`);
  
  // dynamicLink = (payload: any): Observable<any> => this.http.post(`${this.environment.ESA_URL}/api/otp/generate/dynamic-link`, payload);
  
  // sendPosAuthorization = (payload: any): Observable<any> => this.http.post(`${this.environment.XAS_URL}/pos/create_transaction`, payload);

  sendPosAuthorization = (payload: any):Observable <any> => {
    const xAuthHeader = this.authHeaderService.generateAuthHeader(payload);
    const headers = new HttpHeaders()
    .set('X-Auth-Signature', xAuthHeader)
    .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
    .set('X-Api-Key', `${this.environment.X_API_KEY}`)
    .set('X-App-Id', `${this.environment.X_APP_ID}`)
    .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
    return this.http.post(`${this.environment.XAS_URL}/pos/create_transaction`,payload, {headers})
}

fetchMomoPayNetworks = ():Observable <any> => {
  const xAuthHeader = this.authHeaderService.generateAuthHeader({});
  const headers = new HttpHeaders()
  .set('X-Auth-Signature', xAuthHeader)
  .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
  .set('X-Api-Key', `${this.environment.X_API_KEY}`)
  .set('X-App-Id', `${this.environment.X_APP_ID}`)
  .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
  return this.http.get(`${this.environment.XAS_URL}/accounts/momo-mnos/GH`, {headers})
}

VerifyMomoNumber = (number:string,bank_code:string):Observable <any> => {
  const xAuthHeader = this.authHeaderService.generateAuthHeader({});
  const headers = new HttpHeaders()
  .set('X-Auth-Signature', xAuthHeader)
  .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
  .set('X-Api-Key', `${this.environment.X_API_KEY}`)
  .set('X-App-Id', `${this.environment.X_APP_ID}`)
  .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
  return this.http.get(`${this.environment.XAS_URL}/accounts/validate/GH/${number}/${bank_code}/external?is_xcel_sdk=true`, {headers})
}

MomoPay = (payload:any):Observable <any> => {
  const xAuthHeader = this.authHeaderService.generateAuthHeader(payload);
  const headers = new HttpHeaders()
  .set('X-Auth-Signature', xAuthHeader)
  .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
  .set('X-Api-Key', `${this.environment.X_API_KEY}`)
  .set('X-App-Id', `${this.environment.X_APP_ID}`)
  .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
  return this.http.post(`${this.environment.XAS_URL}/transactions/momo-pay?is_xcel_sdk=true`,payload ,{headers})
}
  
  createMerchantCustomer = (requestBody: any) => this.http.post(`${this.environment.TRANSACTION_URL}/merchant-customer/signup`, requestBody);

  fetchTransactionData = (code:any): Observable<any> => this.http.get(`${this.environment.TRANSACTION_URL}/paygate/get-transaction-data/${code}`);

  validateMerchant = (merchantId: any,publicKey:any): Observable<any> => {
    const headers = new HttpHeaders({
      'Authorization': `${publicKey}`  
    });
    return this.http.get(
      `${this.environment.BUSINESS_URL}/merchant/pay/validate/${merchantId}`,
      { headers }
    );
  }

  dynamicLink = (payload:any): Observable<any> => {
    const headers = new HttpHeaders({
      'Authorization': `${this.storageManager.getFromStorage('paymentToken')}`  
    });
    return this.http.post(
      `${this.environment.ESA_URL}/api/otp/generate/dynamic-link`,payload,
      { headers }
    );
  }

  checkTransactionStatus = (merchantId:any,reference:any):Observable <any> => {
    const xAuthHeader = this.authHeaderService.generateAuthHeader({});
    const headers = new HttpHeaders()
    .set('X-Auth-Signature', xAuthHeader)
    .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
    .set('X-Api-Key', `${this.environment.X_API_KEY}`)
    .set('X-App-Id', `${this.environment.X_APP_ID}`)
    .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
    return this.http.get(`${this.environment.XAS_URL}/pos/transaction/${merchantId}/${reference}`,{headers})
  }

  checkMomoTransactionStatus = (transactionId:any,countryCode:any):Observable <any> => {
    const xAuthHeader = this.authHeaderService.generateAuthHeader({});
    const headers = new HttpHeaders()
    .set('X-Auth-Signature', xAuthHeader)
    .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
    .set('X-Api-Key', `${this.environment.X_API_KEY}`)
    .set('X-App-Id', `${this.environment.X_APP_ID}`)
    .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
    return this.http.get(`${this.environment.XAS_URL}/transactions/verify-momo-payment/${transactionId}/${countryCode}?is_xcel_sdk=true`,{headers})
  }

  fetchBanksByCountry = (countryCode:any):Observable <any> => {
    const xAuthHeader = this.authHeaderService.generateAuthHeader({});
    const headers = new HttpHeaders()
    .set('X-Auth-Signature', xAuthHeader)
    .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
    .set('X-Api-Key', `${this.environment.X_API_KEY}`)
    .set('X-App-Id', `${this.environment.X_APP_ID}`)
    .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
    return this.http.get(`${this.environment.XAS_URL}/accounts/banks/${countryCode}`,{headers})
  }

  validateBankAccount = (accountNo:any,bankCode:any):Observable <any> => {
    const xAuthHeader = this.authHeaderService.generateAuthHeader({});
    const headers = new HttpHeaders()
    .set('X-Auth-Signature', xAuthHeader)
    .set('Authorization', `${this.storageManager.getFromStorage('paymentToken')}`)
    .set('X-Api-Key', `${this.environment.X_API_KEY}`)
    .set('X-App-Id', `${this.environment.X_APP_ID}`)
    .set('X-Issuer-Id', `${this.environment.X_ISSUER_ID}`);
    return this.http.get(`${this.environment.XAS_URL}/accounts/validate/GH/${accountNo}/${bankCode}/bank`,{headers})
  }
  private baseUrl = 'https://sandbox-api.xcelapp.com/cps/xcel/pg/v1';

  initiatePayment(payload: any): Observable<any> {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Accept': 'application/json',
    //   'X-API-Key': '3c7d84a1b29d459c9f2147c8c3d12fd4',
    //   'X-Auth': 'NogznkllkUjKoSUkEj+IJk9uWScBSO0EaBfEQCPvkPbctZdktX28eRq7YXphzf5cpu8dhEbQjiWLtu7CZKuM/bT/ev2u7Gd8tJPnZARYXmdJDT7ZfRll9qKw7nzmnLftypkYBiPk39JQV2OeZiGcqifbjD7hsvP2aKy+SLuuLJFP1OdZtA9/K7KGJqV9Hg58HLrxMFW84pwPCIV2cF+mfTF34t+LzW/sryveav9cHU9wKUx8GvheE8DoRO6HxqlfXqLBFQOLru0ubffLNOjpxR01xKYVhrLSEua0drcY7bg6EWtB3X+NywfQOHsAUYYwJizOq7j+6I4e+LW7xY4r4A==',
    //   'X-Nonce': '501b4f78ee494597b50ca22117cc7586'
    // });

    return this.http.post(`https://api.xcelapp.com/transactions-service/paygate/initiate-card-transaction`, payload,);
  }

  completeCardPayment = (session_id:string): Observable<any> => this.http.get(`https://api.xcelapp.com/transactions-service/paygate/complete-payment/${session_id}`);

  // const validateBankAccount = async (accountNo, bankCode, currencyCode) => {
	// 	try {
	// 		const response = await axios.get(
	// 			`/psp/validate/account/${currencyCode}/${bankCode}/${accountNo}`
	// 		);
	// 		return response.data.data;
	// 	} catch (e) {
	// 		throw new Error(e);
	// 	}
	// };

  // const validateBankAccount = async (accountNo, bankCode, currencyCode) => {
	// 	try {
	// 		const response = await axios.get(
	// 			`/psp/validate/account/${currencyCode}/${bankCode}/${accountNo}`
	// 		);
	// 		return response.data.data;
	// 	} catch (e) {
	// 		throw new Error(e);
	// 	}
	// };

  // fetchBanksByCountry = (countryCode:any): Observable<any> => this.http.get(`${this.environment.TRANSACTION_URL}/paygate/get-transaction-data/${code}`);

// chargeCustomer = (payload: any, merchant_id: string): Observable<any> => this.http.post(`${this.environment.TRANSACTION_URL}/merchant/charge-customer/${merchant_id}`, payload);
// https://api.xcelapp.com/transactions-service/transactions/payment-account

}
