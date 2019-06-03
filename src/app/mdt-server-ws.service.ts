import { Injectable } from '@angular/core';
import * as Rx from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { MeetingEvent, Meeting, EventType, StartContent, JoinContent } from './model';
import { Log } from './logger';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MdtServerWsService {

  private socket;

  constructor() { }

  private wsUrl = environment.meetingServerAddress;
  private roomMessageEvent = "room-message"

  connect(){
    if (!this.socket){
      this.socket = io(this.wsUrl)
    }
  }

  sendMeetingEvent(event: MeetingEvent, respCallback: Function){
    if (!this.socket){
      this.connect()
    }
    Log.d(this, "Sending Event: ");
    Log.ds(this, event);
    // sign event
    this.socket.emit(this.roomMessageEvent, JSON.stringify(event), respCallback);
  }

  getMeetingEventListener() {
    if (!this.socket){
      this.connect()
    }
    return Rx.Observable.create(observer => {
      this.socket.on(this.roomMessageEvent, (data: MeetingEvent) => {
          // check validity
          // check sig
          observer.next(data)
      });
    });
  }
}