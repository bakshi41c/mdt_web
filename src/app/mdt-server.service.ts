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
  private STAFF_URL = this.serverUrl + "/staff"
  private ALL_PATIENTS_URL = this.serverUrl + "/patients"
  private PATIENTS_URL = this.serverUrl + "/patient"


  // REST APIs
  getAllStaff(){
    return this.http.get(this.ALL_STAFF_URL);
  }

  getStaff(staffId : string){
    return this.http.get(this.STAFF_URL + "/" + staffId);
  }

  getPatients(){
    return this.http.get(this.ALL_PATIENTS_URL);
  }

  getPatient(patientId : string){
    return this.http.get(this.PATIENTS_URL + "/" + patientId);
  }

  getMeetings(){
    return this.http.get(this.ALL_MEETING_URL);
  }

  createMeeting(meeting: Meeting){
    let head = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.MEETING_URL, JSON.stringify(meeting), {headers: head})
  }

  getMeeting(id : string){
    return this.http.get(this.MEETING_URL + "/" + id);
  }

  updateMeeting(meeting: Meeting){
    let head = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.MEETING_URL + "/" + meeting._id, JSON.stringify(meeting), {headers: head})
  }

  deleteMeeting(meeting: Meeting){
    return this.http.delete(this.MEETING_URL + "/" + meeting._id)
  }
}
