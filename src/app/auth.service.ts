import { Injectable } from '@angular/core';
import { MeetingEvent, Staff } from './model';
import { MdtServerService } from './mdt-server.service';
import * as Rx from 'rxjs/Rx';
import * as elliptic from 'elliptic'
import * as jssha256 from 'js-sha256'
import * as bencodejs from 'bencode-js'
import { Log } from './logger';
let EC = elliptic.ec;
let sha256 = jssha256.sha256;
let ec = new EC('secp256k1');

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private mdtServerService: MdtServerService) { }

  staff : Staff = null;
  key = ec.genKeyPair();

  signEvent(event : MeetingEvent) {
    let eventJson = JSON.stringify(event);
    let eventCopy = JSON.parse(eventJson);
    delete eventCopy.eventId;
    delete eventCopy.__proto__;
    let msgHash = sha256(bencodejs.encode(eventCopy))
    let signature = this.key.sign(msgHash);
    let sigAsHex = signature.r.toString('hex') + signature.s.toString('hex')
    event.eventId = sigAsHex;
    event.by= this.staff._id
    return event
  }

  verifySignature(event: MeetingEvent) {
    let eventJson = JSON.stringify(event);
    let eventCopy = JSON.parse(eventJson);
    let signature = eventCopy.eventId
    delete eventCopy.eventId;
    let by_fixed = '04' + eventCopy.by
    let verifyingKey = ec.keyFromPublic(by_fixed, 'hex');
    let m = signature.match(/([a-f\d]{64})/gi);
    var signatureSplit = {
      r: m[0],
      s: m[1]
    };
    let msgHash = sha256(bencodejs.encode(event))
    return verifyingKey.verify(msgHash, signatureSplit)
  }

  // getPublicKey(staffId : string) {

  // }

  isLoggedIn(){
    Log.i(this, "Logged In?: ")
    let loggedIn = this.staff ? true : false
    Log.i(this, loggedIn)
    return loggedIn;
  }

  getId() {
    return this.staff._id
  }

  getLoggedInStaff() {
    return this.staff;
  }

  login(staffId, callback) {
    this.mdtServerService.getStaff(staffId).subscribe(
      (data)=> {
        let staff = data as Staff;
        this.staff = staff;
        callback(true)
      },
      (err) => {
        Log.e(this, "Error Finding staff with id: " + staffId);
        Log.ds(this, err);
        callback(false)
      }
    ) 
  }
}
