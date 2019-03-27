import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingPatientComponent } from './meeting-patient.component';

describe('MeetingPatientComponent', () => {
  let component: MeetingPatientComponent;
  let fixture: ComponentFixture<MeetingPatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingPatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
