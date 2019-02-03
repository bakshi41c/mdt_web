import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MdtServerService {

  constructor(private http: HttpClient) { }

  private serverIP = "localhost"
  private serverPort = "51234"
  private serverUrl = "http://" + this.serverIP + ":" + this.serverPort
  private ALL_MEETING_URL = this.serverUrl + "/meetings"

  getMeetings(){
    return this.http.get(this.ALL_MEETING_URL);
  }

}
