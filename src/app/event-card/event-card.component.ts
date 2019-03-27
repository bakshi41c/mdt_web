import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Log } from '../logger';
import { MeetingEvent, EventAction, EventType, CommentContent, ReplyContent, DiscussionContent, PatientDataChangeContent, Patient, Staff } from '../model';
import { EventsStorageService } from '../events-storage.service';
import { MdtServerService } from '../mdt-server.service';


@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent implements OnInit {

  @Input() popup?: boolean = false;
  @Input() eventId: string = "";
  @Input() isHost = true;

  @Output() onAction = new EventEmitter<any>();

  event: MeetingEvent = new MeetingEvent();
  avatar: string;
  slim: boolean = false;
  button: boolean = false;
  buttonTitle: string = "OK";
  buttonTwo : boolean = false;
  buttonTwoTitle: string = "Cancel";
  title: string = "Error getting title";
  refEventId: string = "ExampleRefEvent";
  showRefLinkPopup: boolean = false
  endPollButton: boolean = false;
  refLinkTitle = "..."
  referenceEvent = false;
  btnOneActionEvent : EventAction; 
  btnTwoActionEvent : EventAction;

  currentDiscussedPatient : Patient;

  staffNameUpdated = false;
  patientNameUpdated = false;

  staffName : string = "";
  patientName : string =  "";
  constructor(private eventStorageService : EventsStorageService, private mdtMeetingService : MdtServerService) {
  }

  formatLongString(s : string){
    return s.substring(0, 25) + "...";
  }

  ngOnInit() {
      this.eventStorageService.getEvent(this.eventId).subscribe(
      (event) => {
        this.event = event;
        this.staffName = "[Fetching Staff Name...]";
        this.patientName = "[Fetching Patient Name...]";
        this.render();
      },

      (err) => {
        Log.e(this, "Error fetching event " + this.eventId);
        Log.ds(this, err);
      }
    )
  }

  render(){
    this.avatar = "/assets/images/avatar" + (this.event["by"].charCodeAt(0) % 5) + ".png"
    if (!this.staffNameUpdated) this.updateStaffName();

    switch (this.event.type) {
      case EventType.START:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = false;
        this.title =  "Host has started the meeting";
        break;
      }
      case EventType.JOIN:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = false;
        this.title =  this.staffName + "  has joined the meeting";
        break;
      }
      case EventType.POLL:{
        this.slim = false;
        this.button = true;
        this.buttonTitle = "Vote";
        this.btnOneActionEvent = EventAction.VOTE;
        if (this.isHost) { 
          this.buttonTwo = true;
          this.buttonTwoTitle = "End Poll"
          this.btnTwoActionEvent = EventAction.POLL_END;
        }
        this.referenceEvent = false;
        this.title =  this.staffName + "  has started a poll";
        break;
      }
      case EventType.DISCUSSION:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = false;
        this.title =  this.patientName + "  is being discussed now";
        let c = this.event.content as DiscussionContent; 
        if (!this.patientNameUpdated) this.updatePatientName(c.patient);
        break;
      }
      case EventType.DISAGREEMENT:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = true;
        this.refLinkTitle = "Disagree with: " + this.formatLongString(this.event.refEvent);
        this.refEventId = this.event.refEvent;
        this.title =  this.staffName + "disagrees";
        break;
      }
      case EventType.POLL_END:{
        this.slim = false;
        this.button = true;
        this.buttonTitle = "See Results";
        this.btnOneActionEvent = EventAction.VIEW_RESULTS;
        this.referenceEvent = true;
        this.refLinkTitle = "Poll: "  + this.formatLongString(this.event.refEvent);
        this.refEventId = this.event.refEvent;
        this.title =  "Poll has ended";
        break;
      }
      case EventType.COMMENT:{
        this.slim = false;
        this.button = true;
        this.buttonTitle = "Reply";
        this.btnOneActionEvent = EventAction.REPLY;
        this.referenceEvent = false;
        let c = this.event.content as CommentContent;
        this.title =  c.comment
        break;
      }
      case EventType.REPLY:{
        this.slim = false;
        this.button = false;
        this.referenceEvent = true;
        this.refLinkTitle = "Reply To: " +  + this.formatLongString(this.event.refEvent);
        this.refEventId = this.event.refEvent;
        let c = this.event.content as ReplyContent;
        this.title =  c.reply
        break;
      }
      case EventType.PATIENT_DATA_CHANGE:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = false;
        this.title =  "Data changed for: " + this.patientName;
        let c = this.event.content as PatientDataChangeContent; 
        if (!this.patientNameUpdated) this.updatePatientName(c.patient);
        break;
      }
      case EventType.LEAVE:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = false;
        this.title =  this.staffName + "  has left the meeting";
        break;
      }
      case EventType.END:{
        this.slim = true;
        this.button = false;
        this.referenceEvent = false;
        this.title =  "Host has ended the meeting";
        break;
      }
    }
  }
   
  updatePatientName(patientId){
    this.mdtMeetingService.getPatient(patientId).subscribe(
      (data) => {
        let patient = data as Patient
        this.patientName = patient.name
        // this.render()
      },
      (error) => {
        Log.e(this, "Error fetching Patient name")
        Log.ds(this, error)
      }
    )
  }

  updateStaffName(){
    this.mdtMeetingService.getStaff(this.event.by).subscribe(
      (data) => {
        let staff = data as Staff
        this.staffName = staff.name
        // this.render()
      },
      (error) => {
        Log.e(this, "Error fetching Staff name")
        Log.ds(this, error)
      }
    )
  }

  disagreeClicked(){
    let data = {
      "action" : EventAction.DISAGREE,
      "eventId" : this.eventId
    }
    this.onAction.emit(data)

  }

  btnOneClicked(){
    let data = {
      "action" : this.btnOneActionEvent,
      "eventId" : this.eventId
    }
    this.onAction.emit(data)
  }

  btnTwoClicked(){
    let data = {
      "action" : this.btnTwoActionEvent,
      "eventId" : this.eventId
    }
    this.onAction.emit(data)
  }


}
