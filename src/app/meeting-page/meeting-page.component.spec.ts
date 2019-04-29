import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingPageComponent } from './meeting-page.component';
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
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ListFilterSelectComponent } from '../list-filter-select/list-filter-select.component';
import { EventCardComponent } from '../event-card/event-card.component';

describe('MeetingPageComponent', () => {
  let component: MeetingPageComponent;
  let fixture: ComponentFixture<MeetingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingPageComponent , 
        HeaderComponent,
        MeetingCardComponent,
        LoadingSpinnerComponent,
        ListFilterSelectComponent,
        EventCardComponent,
        ],
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
    fixture = TestBed.createComponent(MeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
