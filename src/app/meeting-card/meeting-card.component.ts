import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Meeting } from '../model';

@Component({
  selector: 'app-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.css']
})
export class MeetingCardComponent implements OnInit {

  constructor() { }
  
  @Input() meeting: Meeting;
  @Input() readOnly: boolean;
  @Output() onStart: EventEmitter<any> = new EventEmitter();
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onView: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
  }

  startBtnClicked(){
    this.onStart.emit(this.meeting);
  }

  editBtnClicked(){
    this.onEdit.emit(this.meeting);
  }

  viewBtnClicked(){
    this.onView.emit(this.meeting);
  }

}
