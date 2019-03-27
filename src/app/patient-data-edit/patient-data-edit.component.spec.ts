import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataEditComponent } from './patient-data-edit.component';

describe('PatientDataEditComponent', () => {
  let component: PatientDataEditComponent;
  let fixture: ComponentFixture<PatientDataEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientDataEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDataEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
