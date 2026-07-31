import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations'; 


import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers:
    [provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(routes,
      withHashLocation()),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(
      withInterceptorsFromDi() // <== Don't forget to import the interceptors
    ), 
    provideAnimationsAsync()]
};