import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Meeting, Staff, Patient } from './model';
import { Log } from './logger';

@Injectable({
  providedIn: 'root'
})
export class MdtServerService {

  constructor(private http: HttpClient) { }

  private serverIP = "localhost"
  private serverPort = "51234"
  private serverUrl = "http://" + this.serverIP + ":" + this.serverPort
  private ALL_MEETING_URL = this.serverUrl + "/meetings"
  private MEETING_URL = this.serverUrl + "/meeting"
  private ALL_STAFF_URL = this.serverUrl + "/staff"
  private ALL_PATIENTS_URL = this.serverUrl + "/patients"


  getMeetings(){
    return this.http.get(this.ALL_MEETING_URL);
  }

  getStaff(){
    return this.http.get(this.ALL_STAFF_URL);
  }

  getPatients(){
    return this.http.get(this.ALL_PATIENTS_URL);
  }

  createMeeting(meeting: Meeting){
    let head = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post(this.MEETING_URL, JSON.stringify(meeting), {headers: head}).subscribe(
      res => {
          Log.i(this, "sent")
      }
    );
  }

}
