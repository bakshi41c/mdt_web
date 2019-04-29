import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Staff } from '../model';
import { Log } from '../logger';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private authService: AuthService, public router: Router) { }
  avatar : string = "/assets/images/avatar0"
  loggedInStaff : Staff;

  ngOnInit() {
    this.loggedInStaff = this.authService.getLoggedInStaff()
    if (this.loggedInStaff){
      this.avatar = "/assets/images/avatar" + (this.loggedInStaff._id.charCodeAt(5) % 5) + ".png"
    } else {
      Log.e(this, "Error getting logged in staff!")
    }

  }

  logOut(){
    this.authService.logOut();
    this.router.navigate(['/login']);
  }

}
