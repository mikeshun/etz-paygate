import { Injectable } from '@angular/core';

@Injectable({
    providedIn : 'root'
})
export class AppStorageManager {
    // selectedItem: BehaviorSubject<any> = new BehaviorSubject({});

    constructor() { }

    public storeToStorage = (key: string, value: any) => {
        sessionStorage.setItem(key, btoa(unescape(encodeURIComponent(JSON.stringify(value)))));
    }

    public storeToLocal = (key: string, value: any) => {
        // console.log('value:',value)
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    public getFromLocalStore = (key: string) => {
        sessionStorage.getItem(key);
    }

    // public getFromStorage = (key: string) => {
    //     try {
    //         return JSON.parse(atob(sessionStorage.getItem(key)!));
    //     } catch (error) {
    //         return null
    //     }
    // }

    public getFromStorage = (key: string) => {
        const item = sessionStorage.getItem(key);
        if (!item) return null; 
      
        try {
          return JSON.parse(decodeURIComponent(escape(atob(item))));
        } catch (e) {
          console.error("Error decoding storage item:", e);
          return null;
        }
      }
      

    public isStoredInSession = (key: string) => {
        return sessionStorage.getItem(key) ? true : false;
    }

    public removeFromStorage = (key: string) => {
        sessionStorage.removeItem(key);
    }

    public clearAllStorage = () => {
        sessionStorage.clear();
        sessionStorage.clear();
    }

    public storeAccessToken = (key:string,value:string) => {
         sessionStorage.setItem(key,value);
    }

    public getAccessToken = () => {
        return sessionStorage.getItem('xs_access_token');
    }
}