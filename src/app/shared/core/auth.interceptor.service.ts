import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppStorageManager } from '../app-storage/storage-manager';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const toastr = inject(ToastrService);
    const router = inject(Router);
    const storageManager = inject(AppStorageManager);

    let token = storageManager.getAccessToken();

    let clonedRequest = req;

    // if (token) {
    //     clonedRequest = req.clone({
    //         headers: req.headers.set('Authorization', `Bearer ${token}`)
    //     });
    // }
    
    return next(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            switch (error.status) {
                case 400:
                    toastr.error(`${error.status}` || 'An error occurred while processing your request.', 'Bad Request');
                    break;
                case 401:
                    toastr.info('Login to continue', 'Your session has expired and you have been logged out');
                    storageManager.clearAllStorage();
                    router.navigate(['/auth']);
                    break;
                case 403:
                    toastr.warning('You do not have permission to perform this action.', 'Forbidden');
                    break;
                case 404:
                    toastr.error('The requested resource could not be found.', 'Not Found');
                    break;
                case 500:
                    toastr.error('An internal server error occurred. Please try again later.', 'Internal Server Error');
                    break;
                default:
                    toastr.error('An error occurred', `${error.status}` || 'An unexpected error occurred.');
                    break;
            }

            return throwError(error);
        })
    );
};
