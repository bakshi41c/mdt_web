import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingHostPageComponent } from './meeting-host-page.component';
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
import { PatientCardComponent } from '../patient-card/patient-card.component';
import { StaffCardComponent } from '../staff-card/staff-card.component';
import { CreatePollComponent } from '../create-poll/create-poll.component';
import { CommentReplyComponent } from '../comment-reply/comment-reply.component';
import { PatientDataEditComponent } from '../patient-data-edit/patient-data-edit.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { PollResultsComponent } from '../poll-results/poll-results.component';
import { PollVoteComponent } from '../poll-vote/poll-vote.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

describe('MeetingHostPageComponent', () => {
  let component: MeetingHostPageComponent;
  let fixture: ComponentFixture<MeetingHostPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingHostPageComponent,  
        HeaderComponent,
        MeetingCardComponent,
        PatientCardComponent,
        StaffCardComponent,
        CreatePollComponent,
        CommentReplyComponent,
        PatientDataEditComponent,
        EventCardComponent,
        PollResultsComponent,
        PollVoteComponent,
        LoadingSpinnerComponent ],

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
    fixture = TestBed.createComponent(MeetingHostPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
