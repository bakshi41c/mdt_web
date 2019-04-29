import { Component, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Meeting, Patient, MeetingEvent, EventType, EventAction, StartContent, EventStreamError, JoinContent, CommentContent, PatientMeetingData, ReplyContent, PollContent, PatientDataChangeContent, VoteContent, DiscussionContent, AckJoinContent, AckErrorContent, AckPollEndContent, PollEndContent } from '../model';
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
  patients: any = {}; // Local cache for all patients in this meeting - dictionary for O(1) access 
  patientList: Patient[] = []; // Patients we are displaying for user, angular is not happy with object (patients)
  joinedStaff= new Set() // Set of participant who are currently in meeting

  showPatientChangeSelect: boolean = false; // Used to determine when to show the dropdown for patient select
  eventIds = new Set(); // Events we are displaying
  currentPatientDisucussion: Patient = new Patient(); // The current patient under discussion, empty patient object if none
  currentSelectedAction = EventAction.UNKNOWN; // The view selected on the right panel (based on action selected)
  hosting = false;  // Whether the user is hosting or joining (NOTE: a host can also join, e.g. page refresh)
  isHost = false; // Whether the user thats logged in is the host of the meeting
  manuallyLeftMeeting = false; // The meeting guard will check this flag to decide whether to prmpt user for leaving

  // Events that can't be displayed like ACKS
  undisplayableEvents = [EventType.ACK, EventType.ACK_END, EventType.ACK_ERR, EventType.ACK_JOIN, EventType.ACK_POLL_END]


  // Using ViewChildren insted of ViewChild because of *ngIf, also the reason why we use AfterViewInit instead of OnInit
  @ViewChildren('pollResultPanel') 
  public pollResultsComponents: QueryList<PollResultsComponent>

  private pollResultsComponent: PollResultsComponent;

  pollEvents = {}; // Cache of all poll end events and their acks (which contain all the votes)

  pollKeys = {} //  Stores voting keys for any polls created by the user

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
      },
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

    this.eventStorageService.clearAll() // We clear any events that were there in the storage

    this.loading = true;

    if (this.activatedRoute.snapshot.url.length < 3){
      Log.e(this, "Error parsing URL! URL doesn't have enough components, Unable to render!")
      return;
    }

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

        this.isHost = this.meeting.host === this.authService.getLoggedInStaff()._id

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
          this.join();
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

        Log.i(this, "Recieved Event: " + "[" + event.type + "] " + event._id)
        // Store the event
        this.eventStorageService.storeEvent(event)

        if (!this.undisplayableEvents.includes(event.type)) {
            // Add the id to the list of events we are showing
            this.eventIds.add(event._id)
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
    this.currentSelectedAction = EventAction.UNKNOWN;
  }

  createPollBtnClicked(content) {
    Log.i(this, "Create Poll: ");
    Log.ds(this, content);
    let me = new MeetingEvent();
    let pc = content as PollContent
    let keyPair = this.authService.generateNewEncyrptionKeyPair()
    this.pollKeys[keyPair[0]] = keyPair[1]
    pc.votingKey = keyPair[0]
  
    me.content = pc;
    me.refEvent = this.eventStorageService.getLastEventId();
    me.meetingId = this.meetingId;
    me.type = EventType.POLL;

    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
    });
    this.currentSelectedAction = EventAction.UNKNOWN;
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
    this.currentSelectedAction = EventAction.UNKNOWN;
  }

  async voteButtonClicked(content){
    Log.i(this, "Voting: ");
    Log.ds(this, content);
    let me = new MeetingEvent();
    let vc = content as VoteContent
    me.content = vc;
    me.refEvent = this.actionPanelConfig.votePanel.pollEvent;
     // Encrypt the vote using the key provided by the host
    Log.d(this, "Encyrpting vote using " + this.pollEvents[me.refEvent].encryptKey)

    let voteWithRandomData = this.addRandomDataToVote(vc.vote)
    vc.vote = await this.authService.encryptUsingKey(this.pollEvents[me.refEvent].encryptKey, voteWithRandomData)
    me.meetingId = this.meetingId;
    me.type = EventType.VOTE;
    this.sendEvent(me, (ackEventJson) => {
      let ok = this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
      if (ok) this.pollEvents[me.refEvent].voted = true; 
    });
    this.currentSelectedAction = EventAction.UNKNOWN;
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

    let pollEvent = this.eventStorageService.getEvent(refEvent)
    let pc = pollEvent.content as PollContent

    let pec = new PollEndContent()
    pec.decryptKey = this.pollKeys[pc.votingKey]

    me.content = pec
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
    return;
  }

  leaveMeeting(){
    Log.w(this, "Leaving Meeting...")
    let me = new MeetingEvent();
    me.refEvent = this.eventStorageService.getLastEventId();;
    me.meetingId = this.meetingId;
    me.type = EventType.LEAVE;
    this.sendEvent(me, (ackEventJson) => {
      this.checkAckAndStore(me, this.parseEventJson(ackEventJson))
      this.eventStorageService.initiateDownloadAsync();
      this.manuallyLeftMeeting = true
      this.displayAlert("Left Meeting", true)
    });
    return;
  }

  // Checks the ACK reutrned from server and stores both events in appropriate storage
  checkAckAndStore(originalEvent : MeetingEvent, ackEvent: MeetingEvent, silent=false){
    Log.d(this, "ACK for [" + originalEvent.type + "]: " + originalEvent._id)
    let ackVerified = false;
    let ack = ackEvent as MeetingEvent
    // TODO: Verify signature
    Log.d(this, "Checking ACK...");
    if (ackEvent.refEvent === originalEvent._id) { // Sanity check
      // this.handleSpecialEvents(ackEvent);
      if (ack.type === EventType.ACK_ERR) { // We have an error ack
        this.error = true;
        Log.e(this, "ACK is invalid!")
        let ac = ackEvent.content as AckErrorContent
        let errorMessage = ''
        if (ac.errorCode) {
          errorMessage = ac.errorCode
        }
        if (!silent) this.displayAlert("Error! " + errorMessage)
        Log.d(this, "Error: " + errorMessage);
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

    if (event.type === EventType.JOIN) {
      Log.i(this, "Handling special event JOIN")
      this.joinedStaff.add(event.by)
    }

    if (event.type === EventType.LEAVE) {
      Log.i(this, "Handling special event LEAVE")
      this.joinedStaff.delete(event.by)
    }

    if (event.type === EventType.POLL) {
      Log.i(this, "Handling special event POLL")
      let pc = event.content as PollContent
      this.pollEvents[event._id] = {
        "pollEndAck" : null,
        "encryptKey" : pc.votingKey,
        "decryptKey" : null,
        "voteEvent" : null
      };   
    }

    if (event.type === EventType.POLL_END) {
      Log.i(this, "Handling special event POLL_END")
      // Fetch the poll end event first
      let pec = event.content as PollEndContent
      let pollEvent = this.eventStorageService.getEvent(event.refEvent)
      if (pollEvent) {
        this.pollEvents[pollEvent._id].decryptKey = pec.decryptKey
        Log.d(this, "Decryption Key: " + this.pollEvents[pollEvent._id].decryptKey)
      } else {
        Log.e(this, "Unable to fetch poll event" )
      }
    }

    if (event.type === EventType.ACK_POLL_END) {
      Log.i(this, "Handling special event ACK_POLL_END")
      // Fetch the poll end event first
      
      let pollEndEvent = this.eventStorageService.getEvent(event.refEvent)
      if (pollEndEvent) {
        if (this.pollEvents[pollEndEvent.refEvent]) {
          this.pollEvents[pollEndEvent.refEvent].pollEndAck = event._id;  
        } else {
          Log.w(this, "No poll event found with Id: " + pollEndEvent.refEvent)
        }  
      } else {
        Log.e(this, "Unable to fetch poll end event" )
      }
    }
    if (event.type === EventType.ACK_JOIN) {
      Log.i(this, "Handling special event ACK_JOIN")
      let ac = event.content as AckJoinContent
      if (ac.startEvent){
        // Verify Start Event
        this.startEvent = ac.startEvent;
      } else {
        Log.e(this, "No start event in ACK_JOIN")
      }
    }

    if (event.type === EventType.VOTE) {  // Record the vote we casted
      Log.i(this, "Handling special event VOTE")
      if (event.by == this.authService.getLoggedInStaff()._id) {
        this.pollEvents[event.refEvent].voteEvent = event._id;  
      }
    }

    if (event.type === EventType.ACK_END) {
      this.eventStorageService.initiateDownloadAsync().then(()=>{
        this.displayAlert("Meeting Ended", true)
      })
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
        let refEvent = this.eventStorageService.getEvent(eventId)
        
        if (refEvent.type == EventType.COMMENT){
          let cc = refEvent.content as CommentContent
          this.actionPanelConfig.commentReplyPanel.replyTo = cc.comment
        } else {
          let cc = refEvent.content as ReplyContent
          this.actionPanelConfig.commentReplyPanel.replyTo = cc.reply
        }

        
        break;
      }
      case EventAction.DISAGREE: {
        this.disagree(eventId)
        break;
      }

      case EventAction.VIEW_RESULTS: {
        this.countVotes(eventId).then((results : any) => {
          Log.ds(this, results)
          this.actionPanelConfig.pollResultsPanel.results = results
          this.currentSelectedAction = EventAction.VIEW_RESULTS;
          // this.pollResultsComponents.first.draw()
          // Get the question to display the user
          let pollEndEvent = this.eventStorageService.getEvent(eventId)
          let pollEventId = pollEndEvent.refEvent;
          let pollEvent = this.eventStorageService.getEvent(pollEventId)
          let pc = pollEvent.content as PollContent
          this.actionPanelConfig.pollResultsPanel.question = pc.question
        });
        break;
      }

      case EventAction.VOTE_INCLUSION_CHECK: {
        this.checkVoteInclusion(eventId)
        break;
      }

      case EventAction.SEE_VOTE: {
        this.seeVote(eventId).then((vote) => {
          if (vote) {
            alert('Vote: ' + vote)
          } else {
            alert('Vote cannot be decrypted! Poll has not ended!')
          }
        })
        break;
      }

      case EventAction.VOTE: {
        this.currentSelectedAction = EventAction.VOTE;
        this.actionPanelConfig.votePanel.pollEvent = eventId
        let pollEvent = this.eventStorageService.getEvent(eventId)
        let pc = pollEvent.content  as PollContent;
        this.actionPanelConfig.votePanel.question = pc.question;
        this.actionPanelConfig.votePanel.options = pc.options;
        break;
      }

      case EventAction.POLL_END: {
        this.endPoll(eventId)
        break;
      }
    }

  }

  async seeVote(voteEventId){
    Log.d(this, "Seeing Vote")
    let voteEvent = this.eventStorageService.getEvent(voteEventId)
    Log.d(this, "Vote Event: ")
    Log.ds(this, voteEvent)

    let vote = null;
    let pollEventId = voteEvent.refEvent;
    let decryptKey = this.pollEvents[pollEventId].decryptKey
    Log.d(this, "Decryption Key: " + decryptKey)

    if (decryptKey) {
      let ve = this.eventStorageService.getEvent(voteEventId)
      let vc= ve.content as VoteContent
      let voteWithRandomData = await this.authService.decryptUsingKey(decryptKey, vc.vote)
      vote = this.removeRandomDataFromVote(voteWithRandomData)
    }
    return vote
  }

  // We are padding the vote wihth random data to avoid CPA attacks
  // TODO: Cryptanalysis of this approach
  addRandomDataToVote(vote) {
    let randomKey = this.authService.generateNewEncyrptionKeyPair();
    let paddedVote = randomKey[0] + "::" + vote + "::" + randomKey[1]
    Log.d(this, "Padded vote: " + paddedVote )
    return paddedVote
  }

  removeRandomDataFromVote(voteWithRandomData : string) {
    let unPaddedVote = voteWithRandomData.split('::')[1]
    Log.d(this, "unpadded vote: " + unPaddedVote )
    return unPaddedVote
  }

  checkVoteInclusion(pollEndEventId){
    Log.d(this, "Checking Vote Inclusion")

    let pollEndEvent = this.eventStorageService.getEvent(pollEndEventId)
    Log.d(this, "Poll End event: ")
    Log.ds(this, pollEndEvent)

    let pollEventId = pollEndEvent.refEvent;

    let pollEndEventAckId = this.pollEvents[pollEventId].pollEndAck
    let pollEndAckEvent = this.eventStorageService.getEvent(pollEndEventAckId)

    let peac = pollEndAckEvent.content as AckPollEndContent
    let voteEventIds = peac.votes
    Log.d(this, "Votes: ")
    Log.ds(this, voteEventIds)
    Log.d(this, "Our Vote: " + this.pollEvents[pollEventId].voteEvent)


    if (voteEventIds.includes(this.pollEvents[pollEventId].voteEvent)) {
      alert('YES! Your vote is included in the results!')
    } else {
      alert('NO! Your vote is NOT included in the results!')
    }

  }

  async countVotes(pollEndEventId){
    Log.d(this, "Counting Votes: ")
    Log.ds(this, this.pollEvents)

    // Fetch the poll end event first
    let pollEndEvent = this.eventStorageService.getEvent(pollEndEventId)
    Log.d(this, "Poll End event: ")
    Log.ds(this, pollEndEvent)

    let pollEventId = pollEndEvent.refEvent;
    let pollEvent = this.eventStorageService.getEvent(pollEventId)

    let pollEndEventAckId = this.pollEvents[pollEventId].pollEndAck
    let pollEndAckEvent = this.eventStorageService.getEvent(pollEndEventAckId)

    Log.d(this, "Poll End Ack event: ")
    Log.ds(this, pollEndAckEvent)

    let peac = pollEndAckEvent.content as AckPollEndContent
    let voteEventIds = peac.votes
    let pc = pollEvent.content  as PollContent
    let options = pc.options
    let results = {}
    options.forEach(option => {
      results[option] = 0
    })

    let decryptKey = this.pollEvents[pollEventId].decryptKey
    Log.d(this, "Decryption Key: " + decryptKey)

    let invalidVotes = 0
    for await (let voteEventId of voteEventIds) {
      let ve = this.eventStorageService.getEvent(voteEventId)
      let vc= ve.content as VoteContent
      let voteWithRandomData = await this.authService.decryptUsingKey(decryptKey, vc.vote)
      let vote = this.removeRandomDataFromVote(voteWithRandomData)
      Log.d(this, "Decrypted Vote: " + vote)
      if (options.includes(vote)) {
        results[vote] += 1;
      } else {
        invalidVotes++;
      }
    }

    if (invalidVotes > 0) {
      results["invalid_votes"] = invalidVotes
    }
    return results
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
    Log.d(this, "Parsing: ")
    Log.ds(this, eventJson)
    return JSON.parse(eventJson) as MeetingEvent
  }
  
  start() {
    // Define the start meeting
    let startEvent = new MeetingEvent();
    let content = new StartContent();
    content.otp = this.genOTP().toString()
    content.deeIDLoginSigSigned = this.authService.deeIdLoginSigSigned
    content.key = this.authService.getSessionKey()
    content.meeting = this.meeting;

    startEvent.content = content;
    startEvent.meetingId = this.meetingId;
    startEvent.type = EventType.START;
    startEvent.refEvent = 'genesis'

    Log.d(this, "Sending Start Event...")
    // Send start event
    this.sendEvent(startEvent, (ackEventJson) => {
      let ackEvent = this.parseEventJson(ackEventJson);
      let ok = this.checkAckAndStore(startEvent, ackEvent, true)
      if (ok) {
        this.otp = content.otp
        Log.i(this, "Started Meeting Succesfully")
        this.join()
      } else {
        let ac = ackEvent.content as AckErrorContent
        if (ac.errorCode === EventStreamError.MEETING_ALREADY_STARTED) {
          Log.i(this, "Meeting already started...")
          if (ac.details) {
            this.otp = ac.details.replace('Meeting already started, otp : ', '');
            Log.i(this, "Using Provided OTP: " + this.otp)
          } else {
            Log.e(this, "Meeting started but not otp found ERR_ACK contents");
            this.displayAlert('Meeting already started!', true)
          }
        } else {
          Log.e(this, "Error sending start event!")
          Log.ds(this, ac)
          this.displayAlert('Error starting the meeting', true)
        }
      }
    })
  }

  join() {
    // Define the join meeting
    let joinEvent = new MeetingEvent();
    let content = new JoinContent();
    content.otp = this.otp;
    content.deeIDLoginSigSigned = this.authService.deeIdLoginSigSigned
    content.key = this.authService.getSessionKey()

    joinEvent.content = content;
    joinEvent.meetingId = this.meetingId;
    joinEvent.type = EventType.JOIN;
    joinEvent.refEvent = this.meeting.startEventId;

    Log.d(this, "Sending Join Event...")
    // Send the join event
    this.sendEvent(joinEvent, (ackEventJson) => {

      let ackEvent = JSON.parse(ackEventJson)
      let ok = this.checkAckAndStore(joinEvent, ackEvent, true)

      if (ok) { // Successfully joined
        if (ackEvent.type === EventType.ACK_JOIN) {
          Log.i(this, "JOINED Meeting Succesfully")
          Log.d(this, "Parsing the start event from ACK_JOIN")

          let ac = ackEvent.content as AckJoinContent
          if (ac.startEvent) {
            this.startEvent = ac.startEvent as MeetingEvent
            Log.d(this, "Got start event from ACK_JOIN");
            Log.ds(this, this.startEvent);

            // Manually store the start event
            this.eventStorageService.storeEvent(this.startEvent);

            // Fetch all meeting events until now
            this.fetchAllMeetingEvents(this.meeting, (success) => {
              if (success) {
                // Set Loading to false
                this.loading = false;
              } else {
                Log.e(this, "Error Fetching Meeting events")
                this.displayAlert('Error fetching previous events, please try to join again.', true)
              }
            })

            
          } else {
            Log.ds(this, ackEvent)
            this.displayAlert('Error joining the meeting, please try again.', true)
          }
        } else { // Should never happen!
          Log.e(this, "ACK for JOIN was not of type ACK_JOIN!!!")
          this.displayAlert('Error joining the meeting, please try again.', true)
        }
      } else if (ackEvent.type === EventType.ACK_ERR) { // Error from WS server!
        // Store the events as errors
        this.eventStorageService.storeErrorEvent(joinEvent);
        this.eventStorageService.storeErrorEvent(ackEvent);
        Log.e(this, "Error sending JOIN event")
        Log.ds(this, ackEvent)
        this.displayAlert('Error joining the meeting: ' +  ackEvent.content.errorCode, true)
      }
    })
  }

  fetchAllMeetingEvents(meeting: Meeting, callback){
    this.mdtServerService.getEventsForMeeting(meeting).subscribe(
      (events : any) => {
        if (Array.isArray(events)){
          Log.ds(this, events)
          for(let e of events) {
            let event = e as MeetingEvent
            this.eventStorageService.storeEvent(event);
            this.handleSpecialEvents(event) // We are re-living history, so we are at the same state as everyone
            if (!this.undisplayableEvents.includes(event.type)) { // Display it only if its something to display
              this.eventIds.add(event._id)
            }
          }
          callback(true)
        } else {
          Log.e(this, "Error fetching events: JSON is not an array")
          Log.ds(this, events)
          callback(false)
        } 
      },
      (err) => {
        Log.e(this, err)
        callback(false)
      })
  }

  displayAlert(msg, navigate=false) {
    alert(msg);
    if (navigate) {
      this.manuallyLeftMeeting = true  // So we dont trigger meeting guard 
      this.router.navigate(['/meeting']);
    } 
  }

  genOTP() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  getUnixTimetstamp() {
    return Math.round((new Date()).getTime() / 1000);
  }

  // Fetch info about all patients and cache them
  async fetchPatientsAsync() {
    Log.ds(this, this.meeting)
      this.meeting.patients.forEach(patientId => {
        this.mdtServerService.getPatient(patientId).subscribe(
          (data) => {
            this.patients[patientId] = Patient.parsePatient(data);
            this.patientList.push(this.patients[patientId]);
          },
          (error) => {
            Log.e(this, "Error fetching patient: " + patientId)
            Log.dr(this, error);
          }
        )
      });
  }

}
