import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingHostPageComponent } from './meeting-host-page.component';

describe('MeetingHostPageComponent', () => {
  let component: MeetingHostPageComponent;
  let fixture: ComponentFixture<MeetingHostPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingHostPageComponent ]
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
