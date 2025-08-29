import { Component, OnInit } from '@angular/core';
import { AppStorageManager } from '../../../shared/app-storage/storage-manager';

@Component({
  selector: 'app-ussd',
  standalone: true,
  imports: [],
  templateUrl: './ussd.component.html',
})
export class UssdComponent  implements OnInit{
  appMerchant:any

   constructor(private storageManager: AppStorageManager){}

  ngOnInit(): void {
    this.appMerchant = this.storageManager.getFromStorage('merchant')
    // console.log('ussd:', this.appMerchant.ussd_code)
  }

}
