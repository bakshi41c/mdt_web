import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Patient } from '../model';
import { Log } from '../logger';

@Component({
  selector: 'app-patient-card',
  templateUrl: './patient-card.component.html',
  styleUrls: ['./patient-card.component.css']
})
export class PatientCardComponent implements OnInit {

  @Input() patient: Patient;
  @Output() onDiscuss = new EventEmitter<string>();
  @Input() discussedPatient: Patient;

  constructor() { }

  ngOnInit() {
  }

  onDiscussClicked() {
    Log.i(this, "Discuss clicked: " + this.patient._id);
    this.onDiscuss.emit(this.patient._id);
  }

}
