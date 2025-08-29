import { Injectable } from '@angular/core';
import { environment } from './app-config';
import { environment as prodEnvironment } from './app-config.prod';

@Injectable({
    providedIn: 'root',
})
export class EnvironmentService {
    private env = environment;

    constructor() {
        if (this.isProduction()) {
            this.env = prodEnvironment;
        }
    }

    isProduction(): boolean {
        return window.location.hostname !== 'localhost';
    }

    get SERVER_URL(): string {
        return this.env.SERVER_URL;
    }

    get BUSINESS_URL(): string {
        return this.env.BUSINESS_URL;
    }

    get TRANSACTION_URL(): string {
        return this.env.TRANSACTION_URL;
    }

    get XAS_URL(): string {
        return this.env.XAS_URL;
    }

    get MERCHANT_AUTH_URL(): string {
        return this.env.MERCHANT_AUTH_URL;
    }

    get X_APP_ID(): string {
        return this.env.X_APP_ID;
    }

    get X_AUTH_SIGNATURE(): string {
        return this.env.X_AUTH_SIGNATURE;
    }
    get X_API_KEY(): string {
        return this.env.X_API_KEY;
    }

    get X_ISSUER_ID(): string {
        return this.env.X_ISSUER_ID;
    }

    get PUBLIC_KEY(): string {
        return this.env.PUBLIC_KEY;
    }

    get ESA_URL(): string {
        return this.env.ESA_URL;
    }

    get CRYPTO_JS_URL(): string {
        return this.env.CRYPTO_JS_URL;
    }

    get CONFIG_PRESET(): string {
        return this.env.CONFIG_PRESET;
    }

}
  