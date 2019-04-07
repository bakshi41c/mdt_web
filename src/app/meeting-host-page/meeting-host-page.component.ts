import { Component, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Meeting, Patient, MeetingEvent, EventType, EventAction, StartContent, EventStreamError, AckContent, ErrorAckContent, JoinContent, CommentContent, PatientMeetingData, ReplyContent, PollContent, PatientDataChangeContent, VoteContent, DiscussionContent } from '../model';
import { MdtServerWsService } from '../mdt-server-ws.service';
import { PollResultsComponent } from '../poll-results/poll-results.component';
import { MdtServerService } from '../mdt-server.service';
import { EventsStorageService } from '../events-storage.service';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from "@angular/router"
import { Router } from '@angular/router';

import { Log } from '../logger';

@Component({
  selector: 'app-meeting-host-page',
  templateUrl: './meeting-host-page.component.html',
  styleUrls: ['./meeting-host-page.component.css']
})
export class MeetingHostPageComponent implements AfterViewInit {
  meetingId: string = "";
  meeting: Meeting;
  loading: boolean = true;
  otp: string = ""
  startEvent: MeetingEvent;
  patients: any = new Array(); // Local cache for all patients in this meeting - dictionary for O(1) access 
  showPatientChangeSelect: boolean = false; // Used to determine when to show the dropdown for patient select
  eventIds = []; // Events we are displaying
  currentPatientDisucussion: Patient = new Patient(); // The current patient under discussion, empty patient object if none
  currentSelectedAction = EventAction.UNKNOWN; // The view selected on the right panel (based on action selected)
  hosting = false;

  // Using ViewChildren insted of ViewChild because of *ngIf, also the reason why we use AfterViewInit instead of OnInit
  @ViewChildren('pollResultPanel') 
  public pollResultsComponents: QueryList<PollResultsComponent>

  private pollResultsComponent: PollResultsComponent;

  pollEvents = new Array(); // Cache of all poll end events and their acks (which contain all the votes)

  error : boolean = false;
  errorString: string = "";

  actionPanelConfig = { // config for all the action panels
    "commentReplyPanel" : {
      "isReply" : false,
      "replyTo" : "",
      "replyToEvent" : ""
    },
    "patientMeetingEditPanel" : {
      "patientMeetingData" : new PatientMeetingData()
    },
    "pollResultsPanel" : {
      "question" : "Meaning of Life?",  // Dummy data
      "results" : {
        "Yes" : 42,
        "Not" : 12 
      }
    },
    "votePanel" : {
      "question" : "Meaning of Life?",
      "options" : ["Yes", "No"],
      "pollEvent": "",
    }
  }

  constructor(private authService: AuthService, private mdtWsServer: MdtServerWsService,
     private mdtServerService: MdtServerService, private eventStorageService: EventsStorageService,
     private activatedRoute: ActivatedRoute, public router: Router) { }

  ngAfterViewInit() {
    // Getting the reference for pollResultComponent for the draw() function
    this.pollResultsComponents.changes.subscribe((comps: QueryList <PollResultsComponent>) =>
    {
        this.pollResultsComponent = comps.first;
    });

    this.loading = true;
    this.meetingId =  this.activatedRoute.snapshot.url[1].toString()
    this.hosting = this.activatedRoute.snapshot.url[2].toString() == 'host'
    Log.d(this, "Hosting meetingId: " + this.meetingId)
    this.mdtWsServer.connect();
    this.setupWebSocketListener();
    this.mdtServerService.getMeeting(this.meetingId).subscribe(
      (data) => {
        // Fetch the meeting
        this.meeting = data as Meeting;
        Log.ds(this, this.meeting);

        // Fetch and Cache all releavant patient data (name, dob etc.)
        this.fetchPatientsAsync();

        // IMPORTANT TODO: Remove following, and uncomment the start
        // this.loading = false;
        
        // Start the meeting
        if (this.hosting){
          this.start();
        } else {
          let otp = prompt("Please enter the meeting OTP", "");
          this.otp = otp;
          this.join
        }
      },
      (err) => {
        Log.e(this, "ERROR: Fetching Meeting " + this.meetingId)
        Log.dr(this, err)
      })
  }

  setupWebSocketListener() {
    this.mdtWsServer.getMeetingEventListener().subscribe(
      (eventJson) => {
        let event : MeetingEvent = JSON.parse(eventJson)

        // Update Current Discussed Patient if its a discussion event
        this.handleSpecialEvents(event)

        Log.i(this, "Recieved Event: " + "[" + event.type + "] " + event.eventId)
        // Store the event
        this.eventStorageService.storeEvent(event)

        if (event.type !== EventType.ACK && event.type !== EventType.ACK_ERR &&
          event.type !== EventType.ACK_JOIN && event.type !== EventType.ACK_POLL_END) {
            // Add the id to the list of events we are showing
            this.eventIds.push(event.eventId)
          }
        
      }
    )
  }

  commentBtnClicked(content){
    Log.i(this, "Commenting : ");
    Log.ds(this, content);
    let me = new MeetingEvent();
    if (this.actionPanelConfig.commentReplyPanel.isReply) {
      let rc = content as ReplyContent
      me.content = rc;
      me.refEvent = this.actionPanelConfig.commentReplyPanel.replyToEvent;
      me.meetingId = this.meetingId;
      me.type = EventType.REPLY;
    } else {
      let cc = content as CommentContent
      me.content = cc;
      me.refEvent = this.eventStorageService.getLastEventId();
      me.meetingId = this.meetingId;
      me.type = EventType.COMMENT;
    }
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
  }

  createPollBtnClicked(content) {
    Log.i(this, "Create Poll: ");
    Log.ds(this, content);
    let me = new MeetingEvent();
    let pc = content as PollContent
    me.content = pc;
    me.refEvent = this.eventStorageService.getLastEventId();
    me.meetingId = this.meetingId;
    me.type = EventType.POLL;
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
  }

  patientDataSaveBtnClicked(content){
    Log.i(this, "PDC!: ");
    Log.ds(this, content);
    let me = new MeetingEvent();
    let pdc = content as PatientDataChangeContent
    me.content = pdc;
    me.refEvent = this.eventStorageService.getLastEventId();
    me.meetingId = this.meetingId;
    me.type = EventType.PATIENT_DATA_CHANGE;
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
  }

  voteButtonClicked(content){
    Log.i(this, "Voting: ");
    Log.ds(this, content);
    let me = new MeetingEvent();
    let vc = content as VoteContent
    me.content = vc;
    me.refEvent = this.actionPanelConfig.votePanel.pollEvent;
    me.meetingId = this.meetingId;
    me.type = EventType.VOTE;
    this.sendEvent(me, (ackEventJson) => {
      let ok = this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
      if (ok) this.pollEvents[me.refEvent].voted = true; 
    });
  }

  pdiscussionChange(patient_id) {
    Log.i(this, "Discussed patient changed to " + patient_id)

    let me = new MeetingEvent();
    let dc = new DiscussionContent();
    dc.patient = patient_id
    me.content = dc;
    me.refEvent = this.eventStorageService.getLastEventId();
    me.meetingId = this.meetingId;
    me.type = EventType.DISCUSSION;
    this.sendEvent(me, (ackEventJson) => {
      let ok = this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
      if (ok) {
        this.currentPatientDisucussion = this.patients[patient_id];
        this.showPatientChangeSelect = false;
      } else {
        Log.e(this, "Error in ACK, error changing patient")
      }
      return;
    });
  }

  disagree(refEvent){
    Log.i(this, "Disagreeing with: " + refEvent)

    let me = new MeetingEvent();
    me.refEvent = refEvent;
    me.meetingId = this.meetingId;
    me.type = EventType.DISAGREEMENT;
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
  }

  endPoll(refEvent){
    Log.i(this, "Ending Poll: " + refEvent)
    let me = new MeetingEvent();
    me.refEvent = refEvent;
    me.meetingId = this.meetingId;
    me.type = EventType.POLL_END;
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
  }

  endMeeting(){
    Log.w(this, "Ending Meeting...")
    let me = new MeetingEvent();
    me.refEvent = this.eventStorageService.getLastEventId();;
    me.meetingId = this.meetingId;
    me.type = EventType.END;
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
  }

  checkAckAndStore(originalEvent : MeetingEvent, ackEvent: MeetingEvent){
    Log.d(this, "ACK for [" + originalEvent.type + "]: " + originalEvent.eventId)
    let ackVerified = false;
    let ack = ackEvent as MeetingEvent
    // TODO: Verify signature
    Log.d(this, "Checking ACK...");
    if (ackEvent.refEvent === originalEvent.eventId) { // Sanity check
      this.handleSpecialEvents(ackEvent);
      if (ack.type === EventType.ACK_ERR) { // We have an error ack
        this.error = true;
        Log.e(this, "ACK is invalid!")
        let ac = ackEvent.content as AckContent
        if (ac.details["errorCode"]) {
          Log.e(this, "Error: " + ac.details["errorCode"])
        }
        Log.ds(this, ackEvent);
      } else {
        Log.i(this, "ACK is fine!");
        ackVerified = true;
      }
    } else { // ACK Event does not refer to Original event
      Log.e(this, "ACK is invalid! Ref event mis-match!")
      Log.ds(this, ackEvent);
      this.error = true;
    }

    if (ackVerified) {
      this.eventStorageService.storeEvent(originalEvent);
      this.eventStorageService.storeEvent(ackEvent);
    } else {
      this.eventStorageService.storeErrorEvent(originalEvent);
      this.eventStorageService.storeErrorEvent(ackEvent);
    }

    return ackVerified;
  }

  handleSpecialEvents(event: MeetingEvent) {
    if (event.type === EventType.DISCUSSION) {
      Log.i(this, "Handling special event DISCUSSION")
      let dc = event.content as DiscussionContent
      this.currentPatientDisucussion = this.patients[dc.patient];
    }
    if (event.type === EventType.POLL) {
      Log.i(this, "Handling special event POLL")
      this.pollEvents[event.eventId] = {
        "voted" : false,
        "pollEndAck" : null,
      };   
    }

    if (event.type === EventType.ACK_POLL_END) {
      Log.i(this, "Handling special event ACK_POLL_END")
      // Fetch the poll end event first
      this.eventStorageService.getEvent(event.refEvent).subscribe(
        (pollEndEvent : MeetingEvent) => {
          if (this.pollEvents[pollEndEvent.refEvent]) {
            this.pollEvents[pollEndEvent.refEvent].pollEndAck = event.eventId;  
          } else {
            Log.w(this, "No poll event found with Id: " + pollEndEvent.refEvent)
          }
        },
        (err) => {
          Log.e(this, "Unable to fetch poll end event" + event.refEvent)
          Log.e(this, err)
        });
    }
    if (event.type === EventType.ACK_JOIN) {
      Log.i(this, "Handling special event ACK_JOIN")
      let ac = event.content as AckContent
      if (ac.details["startEvent"]){
        // Verify Start Event
        this.startEvent = ac.details["startEvent"] as MeetingEvent;
      } else {
        Log.e(this, "No start event in ACK_JOIN")
      }
    }
  }

  // Sends Event using the mdtWsServer service
  // Automatically timestamps, signs and puts the correct 'by' field
  sendEvent(event, callback : Function){
    Log.i(this, "Sending Event: ");
    Log.ds(this, event)
    event.timestamp = this.getUnixTimetstamp();
    this.authService.signEvent(event)
    this.mdtWsServer.sendMeetingEvent(event, callback)
  }

  // Handles actions generating from event cards (such as reply, disagree etc.)
  onEventCardAction(data) {
    let action: EventAction = data.action;
    let eventId = data.eventId;

    switch (action) {
      case EventAction.REPLY: {
        this.currentSelectedAction = EventAction.REPLY;
        this.actionPanelConfig.commentReplyPanel.isReply = true;
        this.actionPanelConfig.commentReplyPanel.replyToEvent = eventId;
        this.eventStorageService.getEvent(eventId).subscribe((event : MeetingEvent) => {
          let cc = event.content as CommentContent
          this.actionPanelConfig.commentReplyPanel.replyTo = cc.comment
        });
        break;
      }
      case EventAction.DISAGREE: {
        this.disagree(eventId)
        break;
      }

      case EventAction.VIEW_RESULTS: {
        this.countVotes(eventId, (results)=>{
          this.actionPanelConfig.pollResultsPanel.results = results
          this.currentSelectedAction = EventAction.VIEW_RESULTS;
          // this.pollResultsComponent.draw();
        },
        ()=>{
          Log.e(this, "Error viewing results")
        });

        this.eventStorageService.getEvent(eventId).subscribe((pollEndEvent : MeetingEvent) => {
          let pollEventId = pollEndEvent.refEvent;
          this.eventStorageService.getEvent(pollEventId).subscribe((pollEvent : MeetingEvent) => {
            let pc = pollEvent.content as PollContent
            this.actionPanelConfig.pollResultsPanel.question = pc.question
          });
        });
        break;
      }

      case EventAction.VOTE: {
        this.currentSelectedAction = EventAction.VOTE;
        this.actionPanelConfig.votePanel.pollEvent = eventId
        this.eventStorageService.getEvent(eventId).subscribe((pollEvent : MeetingEvent) => {
          let pc = pollEvent.content  as PollContent;
          this.actionPanelConfig.votePanel.question = pc.question;
          this.actionPanelConfig.votePanel.options = pc.options;
        });
        break;
      }

      case EventAction.POLL_END: {
        this.endPoll(eventId)
        break;
      }
    }

  }

  countVotes(pollEndEventId, callback, errCallback){
    Log.d(this, "Counting Votes: ")
    Log.ds(this, this.pollEvents)

    // Fetch the poll end event first
    this.eventStorageService.getEvent(pollEndEventId).subscribe(
      (pollEndEvent: MeetingEvent) => {
        Log.d(this, "Poll End event: ")
        Log.ds(this, pollEndEvent)

        let pollEventId = pollEndEvent.refEvent;
        let pollEndEventAckId = this.pollEvents[pollEventId].pollEndAck
        
        // Fetch the Poll end event ack
        this.eventStorageService.getEvent(pollEndEventAckId).subscribe(
          (pollEndAckEvent: MeetingEvent) => {
            let pec = pollEndAckEvent.content as AckContent
            let voteEvents = pec.details["votes"]
            let results = {}
            voteEvents.forEach(voteEvent => {
              let vc = voteEvent["content"] as VoteContent
              if (vc.vote in results) {
                results[vc.vote] += 1;
              } else {
                results[vc.vote] = 1;
              }
            });
            callback(results);
          },
          (err) => {
            Log.e(this, "Error getting the pollEndAckEvent");
            Log.e(this, err);
            errCallback();
          }
        );
      },
      (err) => {
        Log.e(this, "Error getting the pollEndEvent");
        Log.e(this, err);
        errCallback();
      }
    );
    return
  }

  getPatientsAsArray() {
    return Object.values(this.patients)
  }

  changeActionView(action : any){
    Log.i(this, "Changing view to :" + action.toString())
    let a = EventAction[action] as any
    this.currentSelectedAction = a;
  }

  getCurrentSelectedActionAsString(){
    return EventAction[this.currentSelectedAction]
  }

  parseEventJson(eventJson){
    return JSON.parse(eventJson) as MeetingEvent
  }
  
  start() {
    // Define the start meeting
    let startEvent = new MeetingEvent();
    let content = new StartContent();
    content.otp = this.genOTP().toString()
    startEvent.content = content;
    startEvent.meetingId = this.meetingId;
    startEvent.type = EventType.START;

    Log.d(this, "Sending Start Event...")
    // Send start event
    this.sendEvent(startEvent, (ackEventJson) => {
      let ackEvent = this.parseEventJson(ackEventJson);
      let ok = this.checkAckAndStore(startEvent, ackEvent)
      if (ok) {
        this.otp = content.otp
        Log.i(this, "Started Meeting Succesfully")
        this.join()
      } else {
        let ac = ackEvent.content as AckContent
        if (ac.details["errorCode"] === EventStreamError.MEETING_ALREADY_STARTED) {
          Log.i(this, "Meeting already started...")
          if (ac.details["otp"]) {
            this.otp = ac.details["otp"];
            Log.i(this, "Using Provided OTP: " + this.otp)
          } else {
            Log.e(this, "Meeting started but not otp found ERR_ACK contents");
            this.errorPromptAndNaviage('Meeting already started!')
          }
        } else {
          Log.e(this, "Error sending start event!")
          Log.ds(this, ac)
          this.errorPromptAndNaviage('Error starting the meeting')
        }
      }
    })
  }

  join() {
    // Define the join meeting
    let joinEvent = new MeetingEvent();
    let content = new JoinContent();
    content.otp = this.otp;
    joinEvent.content = content;
    joinEvent.meetingId = this.meetingId;
    joinEvent.type = EventType.JOIN;

    Log.d(this, "Sending Join Event...")
    // Send the join event
    this.sendEvent(joinEvent, (ackEventJson) => {

      let ackEvent = JSON.parse(ackEventJson)
      let ok = this.checkAckAndStore(joinEvent, ackEvent)

      if (ok) { // Successfully joined
        if (ackEvent.type === EventType.ACK_JOIN) {
          Log.i(this, "JOINED Meeting Succesfully")
          Log.d(this, "Parsing the start event from ACK_JOIN")

          let ac = ackEvent.content as AckContent
          if (ac.details["startEvent"]) {
            this.startEvent = this.parseEventJson(ac.details["startEvent"])
            Log.d(this, "Got start event from ACK_JOIN");
            Log.ds(this, this.startEvent);

            // Manually store the start event
            this.eventStorageService.storeEvent(this.startEvent);

            // Set Loading to false
            this.loading = false;
          } else {
            Log.ds(this, ackEvent)
            this.errorPromptAndNaviage('Error joining the meeting, please try again.')
          }
        } else { // Should never happen!
          Log.e(this, "ACK for JOIN was not of type ACK_JOIN!!!")
          this.errorPromptAndNaviage('Error joining the meeting, please try again.')
        }
      } else if (ackEvent.type === EventType.ACK_ERR) { // Error from WS server!
        // Store the events as errors
        this.eventStorageService.storeErrorEvent(joinEvent);
        this.eventStorageService.storeErrorEvent(ackEvent);
        Log.e(this, "Error sending JOIN event")
        Log.ds(this, ackEvent)
        this.errorPromptAndNaviage('Error joining the meeting, please make sure the OTP is correct.')
      }
    })
  }

  errorPromptAndNaviage(msg) {
    alert(msg);
    this.router.navigate(['/meeting']);
  }

  genOTP() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  getUnixTimetstamp() {
    return Math.round((new Date()).getTime() / 1000);
  }

  // Fetch info about all patients and cache them
  fetchPatientsAsync() {
    setTimeout(() => {
      Log.ds(this, this.meeting)
      this.meeting.patients.forEach(patientId => {
        this.mdtServerService.getPatient(patientId).subscribe(
          (data) => {
            this.patients[patientId] = Patient.parsePatient(data);
          },
          (error) => {
            Log.e(this, "Error fetching patient: " + patientId)
            Log.dr(this, error);
          }
        )
      });
    }, 0)
  }

}
