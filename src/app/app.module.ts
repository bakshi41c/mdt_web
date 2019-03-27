import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxSmartModalModule } from 'ngx-smart-modal';

import { AuthorizeGuard } from './authorize.guard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MeetingListPageComponent } from './meeting-list-page/meeting-list-page.component';
import { MeetingCardComponent } from './meeting-card/meeting-card.component';
import { HttpClientModule } from '@angular/common/http';
import { ListFilterSelectComponent } from './list-filter-select/list-filter-select.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MeetingHostPageComponent } from './meeting-host-page/meeting-host-page.component';
import { MeetingPageComponent } from './meeting-page/meeting-page.component';
import { MeetingStreamComponent } from './meeting-stream/meeting-stream.component';
import { MeetingPatientComponent } from './meeting-patient/meeting-patient.component';
import { CreatePollComponent } from './create-poll/create-poll.component';
import { PollResultsComponent } from './poll-results/poll-results.component';
import { EventCardComponent } from './event-card/event-card.component';
import { CommentReplyComponent } from './comment-reply/comment-reply.component';
import { PatientDataEditComponent } from './patient-data-edit/patient-data-edit.component';
import { PollVoteComponent } from './poll-vote/poll-vote.component';


const appRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', canActivate:[AuthorizeGuard], children: [
    // { path: 'meeting/card', component: EventCardComponent },
    { path: 'meeting/create', component: MeetingPageComponent },
    { path: 'meeting/:id', component: MeetingPageComponent },
    { path: 'meeting/:id/host', component: MeetingHostPageComponent },
    { path: 'meeting', component: MeetingListPageComponent,},
  ]},
  { path: '',
    redirectTo: '/meeting',
    pathMatch: 'full',
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MeetingListPageComponent,
    MeetingCardComponent,
    ListFilterSelectComponent,
    PageNotFoundComponent,
    LoadingSpinnerComponent,
    MeetingHostPageComponent,
    MeetingPageComponent,
    MeetingStreamComponent,
    MeetingPatientComponent,
    CreatePollComponent,
    PollResultsComponent,
    EventCardComponent,
    CommentReplyComponent,
    PatientDataEditComponent,
    PollVoteComponent,
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
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [
    AuthorizeGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
