import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AppStorageManager } from '../app-storage/storage-manager';

@Injectable({
    providedIn: 'root'
})

export class AuthGuardService implements CanActivate {
    constructor(
        private router: Router, 
        private storageManager: AppStorageManager,
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot
    ): boolean {
        if ((this.storageManager.isStoredInSession('xs_access_token') 
            && this.storageManager.getFromStorage('user').roles[0].slug === 'customer')) {
            return true
        } else { 
            this.router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
            this.storageManager.removeFromStorage('user');
            this.storageManager.removeFromStorage('xs_access_token');
            return false; 
        }
    }
}
