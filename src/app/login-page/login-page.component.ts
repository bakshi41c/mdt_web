import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Staff } from '../model';
import { Log } from '../logger';
import { Router } from '@angular/router';
import * as QRious from 'QRious'

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  errorString : string;
  error: boolean = false;
  constructor(private authService: AuthService, public router: Router) { }

  ngOnInit() {
    this.login();
  }
  login(){
    let ok = this.authService.login(
      (data) => {
        Log.d(this, "Showing QR Code")
        Log.ds(this, data)
        this.showQRCode(data)
      },
      (success) => {
        if (success) {
          this.error = false;
          this.router.navigate(['/meeting']);
        } else {
          this.error = true;
          this.errorString = "Error Logging in! Please refresh and try again"
        }
      }
    )
    if (!ok) {
      this.error = true;
      this.errorString = "Error Connecting to Server!"
    }

  }

  showQRCode(data){
    let qr = new QRious({
        element: document.getElementById('qrCodeCanvas'),
        size: 200,
        value: data
      });
  }

}
