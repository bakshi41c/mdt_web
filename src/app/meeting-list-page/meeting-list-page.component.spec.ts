import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingListPageComponent } from './meeting-list-page.component';

describe('MeetingListPageComponent', () => {
  let component: MeetingListPageComponent;
  let fixture: ComponentFixture<MeetingListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingListPageComponent ]
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
});
