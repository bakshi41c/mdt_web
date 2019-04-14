import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Meeting, Staff, Patient, DeeIdLoginSigSigned } from './model';
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
  private LOGIN_URL = this.serverUrl + "/login"
  private EVENTS_URL = this.serverUrl + "/events"

  private loginJwtToken;

  login(deeIDLoginSigSigned : DeeIdLoginSigSigned, callback : Function){
    let head = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.LOGIN_URL, JSON.stringify(deeIDLoginSigSigned), {headers: head}).subscribe(
      (data : string) => {
        Log.d(this, "Response form HTTP Login")
        Log.ds(this, data)
        this.loginJwtToken = data['token']
        callback(true)
      },
      (error) => {
        Log.e(this, "Error while loggin in to HTTP server")
        Log.ds(this, error)
        callback(false)
      }
    )
  }

  getJwtHeader(additionalHeaders?){
    let authHeaders = {
      "Authorization" : "Bearer " + this.loginJwtToken
    }
    let headers = authHeaders
    if (additionalHeaders) headers = {...additionalHeaders, ...authHeaders};
    return new HttpHeaders(headers)
  }

  // REST APIs
  getAllStaff(){
    return this.http.get(this.ALL_STAFF_URL, {headers: this.getJwtHeader()});
  }

  getStaff(staffId : string){
    return this.http.get(this.STAFF_URL + "/" + staffId, {headers: this.getJwtHeader()});
  }

  getPatients(){
    return this.http.get(this.ALL_PATIENTS_URL, {headers: this.getJwtHeader()});
  }

  getPatient(patientId : string){
    return this.http.get(this.PATIENTS_URL + "/" + patientId, {headers: this.getJwtHeader()});
  }

  getMeetings(){
    return this.http.get(this.ALL_MEETING_URL, {headers: this.getJwtHeader()});
  }

  createMeeting(meeting: Meeting){
    return this.http.post(this.MEETING_URL, JSON.stringify(meeting), {headers: this.getJwtHeader({ 'Content-Type': 'application/json' })});
  }

  getMeeting(id : string){
    return this.http.get(this.MEETING_URL + "/" + id, {headers: this.getJwtHeader()});
  }

  updateMeeting(meeting: Meeting){
    return this.http.put(this.MEETING_URL + "/" + meeting._id, JSON.stringify(meeting), {headers: this.getJwtHeader({ 'Content-Type': 'application/json' })});
  }

  deleteMeeting(meeting: Meeting){
    return this.http.delete(this.MEETING_URL + "/" + meeting._id, {headers: this.getJwtHeader()});
  }

  getEventsForMeeting(meeting: Meeting){
    return this.http.get(this.EVENTS_URL + "/" + meeting._id, {headers: this.getJwtHeader()});
  }
}
