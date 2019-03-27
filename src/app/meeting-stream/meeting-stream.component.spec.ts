import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingStreamComponent } from './meeting-stream.component';

describe('MeetingStreamComponent', () => {
  let component: MeetingStreamComponent;
  let fixture: ComponentFixture<MeetingStreamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
