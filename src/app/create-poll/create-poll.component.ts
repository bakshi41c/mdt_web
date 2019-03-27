import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Log } from '../logger';
import { PollContent, Patient } from '../model';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent implements OnInit {

  question = "";
  potentialOption = "";
  options = [];

  @Input() currentPatientDisucussion : Patient;
  @Input() patients = {};  
  @Output() createPollBtnClicked = new EventEmitter<PollContent>();

  selectedPatientId : string;
  constructor() { }

  ngOnInit() {
    Log.ds(this, this.currentPatientDisucussion)
  }

  addOption() {
    Log.d(this, "Adding Option: " + this.potentialOption)
    if (this.potentialOption === "") {Log.w(this, "Potential option empty"); return};
    this.options.push(this.potentialOption);
    this.potentialOption = "";
    Log.ds(this, this.options)
  }

  onCreatePollClicked() {
    let pc = new PollContent()
    if (this.selectedPatientId) {
      pc.patient = this.selectedPatientId;
    }
    pc.question = this.question;
    pc.options = this.options;
    this.createPollBtnClicked.emit(pc)
  }

  getPatientsAsArray() {
    return Object.values(this.patients)
  }

  patientSelected(patientId) {
    if (patientId) {
      this.selectedPatientId = patientId;
    } else {
      this.selectedPatientId = null;
    }
  }

}
