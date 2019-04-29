import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingCardComponent } from './meeting-card.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { AuthorizeGuard } from '../authorize.guard';
import { ConfirmDeactivateGuard } from '../meeting.guard';
import { Meeting } from '../model';

describe('MeetingCardComponent', () => {
  let component: MeetingCardComponent;
  let fixture: ComponentFixture<MeetingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingCardComponent ],
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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingCardComponent);
    component = fixture.componentInstance;
    component.meeting = new Meeting()
    component.meeting._id = "0x81s8db79sd64bv5asdb4s6d5aa2a0"
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
