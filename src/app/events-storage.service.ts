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

  events = {};
  myErrorEvents = {};
  lastEventId : string;

  getEvent(eventId : string) : MeetingEvent {
    Log.w(this, "Fetching event " + eventId)
    if (eventId in this.events) {
      return this.events[eventId]
    } else {
      Log.e(this, "Event not found!:  " + eventId)
      return null
    }
  }


  getLastEventId(){
    return this.lastEventId;
  }

  storeEvent(event : MeetingEvent) {
    Log.w(this, "Storing event " + event._id)
    this.events[event._id] = event;
    this.lastEventId = event._id;
  }

  storeErrorEvent(event : MeetingEvent) {
    Log.w(this, "Storing error event " + event._id)
    this.myErrorEvents[event._id] = event;
  }

  clearAll(){
    this.events = {};
    this.myErrorEvents = {};
    this.lastEventId = null;
  }

  async initiateDownloadAsync(){
    Log.d(this, "Initiating download...")
    Log.dr(this, this.events)
    Log.ds(this, this.events)

    let downloadData = {
      'myErrorEvents' : this.myErrorEvents,
      'events' : this.events
    }
    var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadData, null, 4));
    var downloader = document.createElement('a');
    downloader.setAttribute('href', data);
    downloader.setAttribute('download', 'events.json');
    downloader.click();
  }

}
