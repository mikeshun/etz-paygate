import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { EnvironmentService } from '../environments/environment.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { authInterceptor } from './shared/core/auth.interceptor.service';
import { provideLottieOptions } from 'ngx-lottie';
// import { provideLottiePlayer } from 'ngx-lottie';
// import player from 'lottie-web';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    EnvironmentService,
    provideAnimations(),
    provideToastr(),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    // provideLottiePlayer(() => player),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    provideRouter(routes, withHashLocation()),
    DecimalPipe,
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ]
};
