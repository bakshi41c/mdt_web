import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxSmartModalModule } from 'ngx-smart-modal';

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


const appRoutes: Routes = [
  { path: 'create', component: MeetingPageComponent },
  { path: 'meeting/:id', component: MeetingPageComponent },
  // { path: 'hero/:id',      component: HeroDetailComponent },
  // {
  //   path: 'heroes',
  //   component: HeroListComponent,
  //   data: { title: 'Heroes List' }
  // },
  { path: 'meeting',
    component: MeetingListPageComponent
  },
  { path: '',
    redirectTo: '/meeting',
    pathMatch: 'full'
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    BrowserAnimationsModule,
    Ng2SmartTableModule,
    NgxSmartModalModule.forRoot(),
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
