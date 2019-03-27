import { Component, OnInit } from '@angular/core';
import { MdtServerWsService } from '../mdt-server-ws.service';
import { MdtServerService } from '../mdt-server.service';
import { EventsStorageService } from '../events-storage.service';

import { Log } from '../logger';

import { Meeting, Patient, MeetingEvent, EventType, DiscussionContent } from '../model';

@Component({
  selector: 'app-meeting-stream',
  templateUrl: './meeting-stream.component.html',
  styleUrls: ['./meeting-stream.component.css']
})
export class MeetingStreamComponent implements OnInit {

  constructor(private mdtWsServer: MdtServerWsService, private mdtMeetingService : MdtServerService, private eventStorageService : EventsStorageService) { }

  room = ""

  ngOnInit() {
    
  }
}
