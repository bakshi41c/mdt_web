import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Staff } from '../model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  staffId : string;
  error: boolean = false;
  constructor(private authService: AuthService, public router: Router) { }

  ngOnInit() {
  }

  login(){
    this.authService.login(this.staffId, (success) => {
        if (success) {
          this.error = false;
          this.router.navigate(['/meeting']);
        } else {
          this.error = true;
        }
      }
    )
  }

}
