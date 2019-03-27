import { Injectable } from '@angular/core';
import { MeetingEvent } from './model';
import * as Rx from 'rxjs/Rx';
import { Observable, Observer } from 'rxjs';

import { Log } from './logger';


@Injectable({
  providedIn: 'root'
})
export class EventsStorageService {

  constructor() { }

  events = new Array();
  errorEvents = new Array();
  lastEventId : string;

  getEvent(eventId : string) {
    Log.w(this, "Fetching event " + eventId)
    return Rx.Observable.create((observer) => {
      if (eventId in this.events){
        observer.next(this.events[eventId])
        observer.complete()
      } else {
        observer.error("Event not found")
      }
    });
  }

  getLastEventId(){
    return this.lastEventId;
  }

  storeEvent(event : MeetingEvent) {
    Log.w(this, "Storing event " + event.eventId)
    this.events[event.eventId] = event;
    this.lastEventId = event.eventId;
  }

  storeErrorEvent(event : MeetingEvent) {
    this.errorEvents[event.eventId] = event;
  }
}
