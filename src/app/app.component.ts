import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common'; 

import { HttpService } from '../services/http.service';
import { HttpApiService } from '../services/http-api-service';
import { DatePipe } from '@angular/common';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { AuthService } from './services/auth.service';
import { SideBarComponent } from './shared/side-bar/side-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    NgIf,               
    SideBarComponent
  ],
  providers: [
    HttpService,
    HttpApiService,
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: false, zone: 'Asia/Karachi' }
    },
  ],
})
export class AppComponent {
  
  title = 'invoice';

  constructor(public authService: AuthService) {}
}
