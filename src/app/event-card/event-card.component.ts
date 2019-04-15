import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Log } from '../logger';
import { MeetingEvent, EventAction, EventType, CommentContent, ReplyContent, DiscussionContent, PatientDataChangeContent, Patient, Staff, PollContent } from '../model';
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

  readonly BTN_TYPE_DANGER : string = 'btn btn-danger'
  readonly BTN_TYPE_NORMAL : string = 'btn btn-primary'
  readonly BTN_TYPE_WARNING : string = 'btn btn-warning'
  readonly BTN_TYPE_INFO : string = 'btn btn-info'

  event: MeetingEvent = new MeetingEvent();
  avatar: string;
  slim: boolean = false;
  button: boolean = false;
  buttonTitle: string = "OK";
  buttonTwo : boolean = false;
  buttonTwoTitle: string = "Cancel";
  btnOneActionEvent : EventAction; 
  btnTwoActionEvent : EventAction;
  btnOneType : string;
  btnTwoType : string;

  grayLink : boolean = false;
  grayLinkTitle : string = "?";
  grayLinkAction : EventAction;

  title: string = "Error getting title";
  refEventId: string = "ExampleRefEvent";
  showRefLinkPopup: boolean = false
  endPollButton: boolean = false;
  refLinkTitle = "..."
  referenceEvent = false;
  

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
    this.event = this.eventStorageService.getEvent(this.eventId)
    this.staffName = "☐☐☐☐☐☐";
    this.patientName = "☐☐☐☐☐☐";
    this.render();
  }

  render(){
    this.avatar = "/assets/images/avatar" + (this.event["by"].charCodeAt(5) % 5) + ".png"
    if (!this.staffNameUpdated) this.updateStaffName();

    Log.d(this, "Rendering Event Card: " + this.event.type)

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
        this.btnOneType = this.BTN_TYPE_NORMAL
        this.btnOneActionEvent = EventAction.VOTE;

        if (this.isHost) { 
          this.buttonTwo = true;
          this.buttonTwoTitle = "End Poll"
          this.btnTwoType = this.BTN_TYPE_DANGER
          this.btnTwoActionEvent = EventAction.POLL_END;
        }

        this.referenceEvent = false;
        let pc = this.event.content as PollContent
        this.title =  "Poll: " + pc.question;
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
        this.title =  this.staffName + " disagrees!";
        break;
      }
      case EventType.POLL_END:{
        this.slim = false;
        this.button = true;
        this.buttonTitle = "See Results";
        this.btnOneType = this.BTN_TYPE_NORMAL
        this.btnOneActionEvent = EventAction.VIEW_RESULTS;

        this.buttonTwo = true;
        this.buttonTwoTitle = "Includes my vote?"
        this.btnTwoType = this.BTN_TYPE_INFO
        this.btnTwoActionEvent = EventAction.VOTE_INCLUSION_CHECK;

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
        this.btnOneType = this.BTN_TYPE_NORMAL
        this.btnOneActionEvent = EventAction.REPLY;

        this.referenceEvent = false;
        let c = this.event.content as CommentContent;
        this.title =  c.comment
        break;
      }
      case EventType.REPLY:{
        this.slim = false;
        this.button = true;
        this.buttonTitle = "Reply";
        this.btnOneType = this.BTN_TYPE_NORMAL
        this.btnOneActionEvent = EventAction.REPLY;

        this.referenceEvent = true;
        this.refLinkTitle = "Reply To: " + this.formatLongString(this.event.refEvent);
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
      case EventType.VOTE:{
        this.slim = true;
        this.button = false;
        this.title =  this.staffName + "  voted";

        this.referenceEvent = true;
        this.refLinkTitle = "Poll: " + this.formatLongString(this.event.refEvent);
        this.refEventId = this.event.refEvent;

        this.grayLink = true;
        this.grayLinkTitle = "See Vote"
        this.grayLinkAction = EventAction.SEE_VOTE;
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
        this.patientNameUpdated = true;
        this.render()
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
        this.staffNameUpdated = true;
        this.render()
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

  grayLinkClicked(){
    let data = {
      "action" : this.grayLinkAction,
      "eventId" : this.eventId
    }
    this.onAction.emit(data)
  }

  rawEventButtonClicked(){
    this.copyToClipboard(JSON.stringify(this.event, null, 4))
  }

  copyToClipboard(item) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (item));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }


}
