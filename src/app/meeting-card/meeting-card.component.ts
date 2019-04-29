import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Meeting, Staff } from '../model';
import { AuthService } from '../auth.service';
import { Log } from '../logger';

@Component({
  selector: 'app-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.css']
})
export class MeetingCardComponent implements OnInit {

  constructor(private authService: AuthService) { }
  
  @Input() meeting: Meeting;
  @Input() historic: boolean;
  @Output() onJoin: EventEmitter<any> = new EventEmitter();
  @Output() onStart: EventEmitter<any> = new EventEmitter();
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onView: EventEmitter<any> = new EventEmitter();
  loggedInStaff : Staff;
  isHost : boolean;
  meetingAlreadyStarted: boolean;

  ngOnInit() {
    this.loggedInStaff = this.authService.getLoggedInStaff();

    if (!this.meeting){
      Log.e(this, "Meeting is falsy, unable to render meeting card")
      return;
    }

    if (!this.loggedInStaff){
      Log.e(this, "Cannot fetch logged in staff, unable to render meeting card")
      return;
    }

    this.isHost = this.meeting.host === this.loggedInStaff._id;
    this.meetingAlreadyStarted = this.meeting.started;
    Log.ds(this, this.meeting)
    Log.ds(this, this.isHost)
    Log.ds(this, this.meetingAlreadyStarted)

  }

  startBtnClicked(){
    this.onStart.emit(this.meeting);
  }

  joinBtnClicked(){
    this.onJoin.emit(this.meeting);
  }

  editBtnClicked(){
    this.onEdit.emit(this.meeting);
  }

  viewBtnClicked(){
    this.onView.emit(this.meeting);
  }

}
