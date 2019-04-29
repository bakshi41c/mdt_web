import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { AuthorizeGuard } from './authorize.guard';
import { ConfirmDeactivateGuard } from './meeting.guard';

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      BrowserModule,
      FormsModule,
      AppRoutingModule,
      HttpClientModule,
      OwlDateTimeModule,
      OwlNativeDateTimeModule,
      BrowserAnimationsModule,
      Ng2SmartTableModule,
      NgxSmartModalModule.forRoot(),
    ],
    providers: [
      AuthorizeGuard, ConfirmDeactivateGuard
    ]
  }));

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});
