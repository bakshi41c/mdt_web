import { Component, OnInit, Input } from '@angular/core';
import { Meeting } from '../model';

@Component({
  selector: 'app-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.css']
})
export class MeetingCardComponent implements OnInit {

  constructor() { }
  
  @Input() meeting: Meeting;
  
  ngOnInit() {
  }

}
