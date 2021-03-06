import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Log } from '../logger';
import { PatientDataChangeContent, Patient, PatientMeetingData } from '../model';

@Component({
  selector: 'app-patient-data-edit',
  templateUrl: './patient-data-edit.component.html',
  styleUrls: ['./patient-data-edit.component.css']
})
export class PatientDataEditComponent implements OnInit {

  @Input() patient : Patient;
  @Input() patientMeetingData : PatientMeetingData = new PatientMeetingData();
  @Output() saveBtnClicked = new EventEmitter<PatientDataChangeContent>();

  oldData : string = ""
  showPatientDetails : boolean = false;
  
  constructor() { }

  ngOnInit() {
    if (!this.patient) {
      Log.e(this, "patient missing in input! unable to render!")
      this.patient = new Patient()
      return;
    }

    if (!this.patientMeetingData) {
      Log.e(this, "patient data missing in input! unable to render!")
      this.patientMeetingData = new PatientMeetingData()
      return;
    }

    this.oldData = JSON.stringify(this.patientMeetingData)
  }

  onSaveClicked() {
    Log.i(this, "Save Button Clicked!")
    let pdc = new PatientDataChangeContent()
    pdc.patient = this.patient._id;
    pdc.from = this.oldData;
    pdc.to = JSON.stringify(this.patientMeetingData)
    this.saveBtnClicked.emit(pdc);
  }

}
