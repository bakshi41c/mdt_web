import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingListPageComponent } from './meeting-list-page.component';
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
import { HeaderComponent } from '../header/header.component';
import { MeetingCardComponent } from '../meeting-card/meeting-card.component';
import { Meeting } from '../model';

describe('MeetingListPageComponent', () => {
  let component: MeetingListPageComponent;
  let fixture: ComponentFixture<MeetingListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingListPageComponent, 
        HeaderComponent,
        MeetingCardComponent ],
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
    fixture = TestBed.createComponent(MeetingListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no meetings message, when list empty', () => {
    component.upcomingMeetings = [];
    fixture.detectChanges();

    const bannerElement: HTMLElement = fixture.nativeElement;
    const p = bannerElement.querySelector('#emptyUpcomingMessage');

    expect(p).toBeTruthy();
  });

  it('should hide no upcoming meeting message, when list not empty', () => {
    let meeting = new Meeting()
    component.upcomingMeetings = [meeting];
    fixture.detectChanges();

    const bannerElement: HTMLElement = fixture.nativeElement;
    const p = bannerElement.querySelector('#emptyUpcomingMessage');

    expect(p).toBeFalsy();
  });

  it('should render no past meeting message', () => {
    component.pastMeetings = [];
    fixture.detectChanges();

    const bannerElement: HTMLElement = fixture.nativeElement;
    const p = bannerElement.querySelector('#emptyPastMessage');

    expect(p).toBeTruthy();
  });

  it('should hide no past meeting message, when list not empty', () => {
    let meeting = new Meeting()
    component.pastMeetings = [meeting];
    fixture.detectChanges();

    const bannerElement: HTMLElement = fixture.nativeElement;
    const p = bannerElement.querySelector('#emptyPastMessage');

    expect(p).toBeFalsy();
  });

});

