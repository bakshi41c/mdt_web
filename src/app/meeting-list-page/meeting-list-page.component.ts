import { Component, OnInit } from '@angular/core';
import { MdtServerService } from '../mdt-server.service';
import { Meeting } from '../model';


@Component({
  selector: 'app-meeting-list-page',
  templateUrl: './meeting-list-page.component.html',
  styleUrls: ['./meeting-list-page.component.css']
})
export class MeetingListPageComponent implements OnInit {

  constructor(private mdtServerService: MdtServerService) { }

  public upcomingMeetings : Meeting[] = [];
  public pastMeetings : Meeting[] = [];


  ngOnInit() {
    this.showMeetings();
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
        let todaysDate = new Date();
        if (meeting.date > todaysDate) {
          this.upcomingMeetings.push(meeting)
        } else {
          this.pastMeetings.push(meeting)
        }
      });

    });
  }


}
