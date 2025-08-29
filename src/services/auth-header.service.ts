import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { EnvironmentService } from '../environments/environment.service';

@Injectable({
  providedIn: 'root'
})

export class AuthHeaderService {

  constructor(
    private environment: EnvironmentService,
  ) { }

  

  generateAuthHeader(payload: any): string {
    const APP_ID = `${this.environment.X_APP_ID}`;
    const ISSUER_ID = `${this.environment.X_ISSUER_ID}`;
    const PUBLIC_KEY = `${this.environment.PUBLIC_KEY}`;
    
    const payloadStr = JSON.stringify(payload);
    const hashStr = `${payloadStr}etz${APP_ID}etz${PUBLIC_KEY}etz${ISSUER_ID}`;
    const xAuthHeader = CryptoJS.HmacSHA512(hashStr, PUBLIC_KEY).toString(CryptoJS.enc.Base64);

    return xAuthHeader;
  }

}
