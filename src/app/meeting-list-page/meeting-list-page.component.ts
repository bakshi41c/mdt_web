import { Component, OnInit } from '@angular/core';
import { MdtServerService } from '../mdt-server.service';
import { AuthService } from '../auth.service';
import { Log } from '../logger';
import { EventsStorageService } from '../events-storage.service';

import { Meeting, Staff } from '../model';
import {Router} from "@angular/router"


@Component({
  selector: 'app-meeting-list-page',
  templateUrl: './meeting-list-page.component.html',
  styleUrls: ['./meeting-list-page.component.css']
})
export class MeetingListPageComponent implements OnInit {

  constructor(private mdtServerService: MdtServerService, private authService : AuthService, 
    private router: Router,  private eventStorageService: EventsStorageService, ) { }

  public upcomingMeetings : Meeting[] = [];
  public pastMeetings : Meeting[] = [];
  staff: Staff;

  ngOnInit() {
    this.showMeetings();
    this.staff = this.authService.getLoggedInStaff()
    this.eventStorageService.clearAll() // We clear any events that were there in the storage
  }

  // Called when user wants to view meeting
  viewMeeting(meeting: Meeting){
    this.router.navigate(['/meeting', meeting._id])
  }

  startMeeting(meeting: Meeting){
    this.router.navigate(['/meeting', meeting._id, "host"])
  }

  joinMeeting(meeting: Meeting){
    this.router.navigate(['/meeting', meeting._id, "join"])
  }

  newMeetingClicked(){
    this.router.navigate(['/meeting', "create"])
  } 

  showMeetings(){
    this.mdtServerService.getMeetings()
    .subscribe((data) => {
      if (!Array.isArray(data)) {
        console.error("Recieved meeting object not an array")
        return;
      }
      let objects = data as any[]
      
      data.forEach(element => {
        let meeting = Meeting.parseMeeting(element)
        if (!meeting.ended) {
          this.upcomingMeetings.push(meeting)
        } else {
          this.pastMeetings.push(meeting)
        }
      });

    });
  }


}
