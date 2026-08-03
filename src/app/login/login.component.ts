import { CommonModule } from '@angular/common';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../services/local-storage.service';
import { ToastrService } from 'ngx-toastr'; 
import { HttpApiService } from '../../services/http-api-service';
import { environment } from '../../../environments/environtment';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  UserModel: any = {};  
  User: any = {};
  IsLoader: boolean = false;

  private googleClientId = environment.googleClientId;

  constructor(
    private api: HttpApiService,
    private route: Router,
    private Store: StorageService,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    this.User = this.Store.getItem("User");
  }

  ngOnInit(): void {
    if (this.User) this.route.navigate(['dashboard']);
    this.loadGoogleScript();
  }

  async onSubmit() {
    this.IsLoader = true;
    let res: any = await this.api.Login(this.UserModel);
    if (res.statusCode == 200) {
      this.Store.setItem("User", res.data);
      this.Store.setItem("Token", res.data.token);
      location.href = "/#/dashboard";
      location.reload();
    } else this.toastr.error(res.message);
    this.IsLoader = false;
  }

  signInWithGoogle() {
    const redirectUri = window.location.origin + '/assets/google-callback.html';
    const scope = 'openid email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token id_token&scope=${encodeURIComponent(scope)}&nonce=${this.generateNonce()}`;

    const width = 500, height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const popup = window.open(url, 'GoogleLogin', `width=${width},height=${height},top=${top},left=${left}`);

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.idToken) {
        popup?.close();
        this.handleGoogleCallback(event.data.idToken);
      }
    }, { once: true });
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  private loadGoogleScript() {
    // No longer needed for OAuth2 popup flow
  }

  private async handleGoogleCallback(idToken: string) {
    this.ngZone.run(async () => {
      this.IsLoader = true;
      try {
        const res: any = await this.api.GoogleLogin({ idToken: idToken });
        if (res.statusCode == 200) {
          this.Store.setItem("User", res.data);
          this.Store.setItem("Token", res.data.token);
          location.href = "/#/dashboard";
          location.reload();
        } else {
          this.toastr.error(res.message || 'Google login failed');
        }
      } catch (err) {
        this.toastr.error('Google login failed. Please try again.');
      }
      this.IsLoader = false;
    });
  }
}
