import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {

  constructor(private authService: AuthService,  public router: Router) {}

  canActivate() {
    if(!this.authService.isLoggedIn()){
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}