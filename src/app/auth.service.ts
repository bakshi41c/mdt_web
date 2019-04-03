import { Injectable } from '@angular/core';
import { MeetingEvent, Staff, Meeting, EventType } from './model';
import { MdtServerService } from './mdt-server.service';
import { Log } from './logger';
import * as bencodejs from 'bencode-js'
import * as jssha256 from 'js-sha256'
import Web3 from 'web3';
import { Account } from 'web3-eth-accounts/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private mdtServerService: MdtServerService) { }
  staff : Staff = null;
  web3 : Web3 = null;
  deeIdWsConnection = null;
  deeIdServerAddress = "ws://127.0.0.1:5678/"
  deeIdSessionId = null
  signature = null
  sessionAccount : Account = null // This is the eth Account that gets setup when logged in, used mainly for singning for meetings
  serverPublicAddress : string = '0x1c0b2f7a73ecbf7ce694887020dbcbaaa2e126f7'
  recieveduId = false;

  // sample_ack_event =  {"by": "0x1c0b2f7a73ecbf7ce694887020dbcbaaa2e126f7", "refEvent": "007a2cd2944e39a5b46747749c8d648354809273513d59d0c0d4414120174f8515b61b70eec21d", "timestamp": 41654654021, "meetingId": "da9ff03c5e0abea12c2f1dc09a5a58accdb51da1c58950ad974", "type": "ack", "content": {"otp": "5123"}, "eventId": "0xdc8f17983602dd1e83251b3123016ddf8668e6cc26a12bca138c270df37f000054ee362fcb9962a962423571691d4171ebd8be7f331c339f937aa60853b5e6431c"}

  isLoggedIn(){
    let loggedIn = this.staff ? true : false
    Log.i(this, "Logged In?: " + loggedIn)
    return loggedIn;
  }

  metaMaskPresent(){
    return Web3.givenProvider;
  }

  getId() {
    return this.staff._id
  }

  getLoggedInStaff() {
    return this.staff;
  }

  init(){
    if (this. web3) {
      Log.d(this, "Auth Service already Initialised")
      return true
    }
    if (this.metaMaskPresent()) {
      Log.i(this, "Metamask FOUND!")
      this.web3 = new Web3(Web3.givenProvider)
      this.sessionAccount = this.web3.eth.accounts.create()
    } else {
      Log.e(this, "Metamask not found!")
      return false
    }
    return true
  }

  login(onQRCodeCallback : Function, onLogin : Function) {
    // Initialise
    let init_ok = this.init();
    if (!init_ok) {
      return init_ok
    }
    this.signSample()
    this.recieveduId = false;
    this.deeIdWsConnection = null;
    this.deeIdWsConnection = new WebSocket(this.deeIdServerAddress)
    this.deeIdWsConnection.onopen = function() {
      console.log('Opened websocket');
    };
    this.deeIdWsConnection.onmessage = (event) => {
      let dataJSON = JSON.parse(event.data);
      Log.ds(this, dataJSON)

      if (dataJSON.type === "uID" && !this.recieveduId) {
          Log.d(this, "UID: " + dataJSON.uID)
          let uid = dataJSON['uID']
          this.recieveduId = true // We set this flag to true, so we ignore subsequent uid messages until next login
          let qrData = {'type': 'loginSig',
                        'host': uid}
                        // 'omneeID': deeID,
                        // 'msg': msg,
                        // 'signature' : flatSig}
          onQRCodeCallback(JSON.stringify(qrData))
      } else if(dataJSON.type === 'signature') {
        Log.d(this, "We have signature")
        this.signature = dataJSON['signature'];
        onLogin(true);
      }
    }
    return true;
  }

  signEvent(event : MeetingEvent) {
    event.by= this.staff._id
    let eventJson = JSON.stringify(event);
    let eventCopy = JSON.parse(eventJson);
    delete eventCopy.eventId;
    delete eventCopy.__proto__;
    let eventBencode = bencodejs.encode(eventCopy)
    let signature = this.sessionAccount.sign(eventBencode)
    event.eventId = signature.signature;
    return event
  }

  // signSample() {
  //   Log.i(this, this.sessionAccount.address)
  //   let meetingEvent = new MeetingEvent();
  //   meetingEvent.timestamp = 2814719824
  //   meetingEvent.refEvent = "21823g2o3gno23ig2o3ign23g23"
  //   meetingEvent.meetingId = "i32ht923hng2o3ign23oigh"
  //   meetingEvent.type = EventType.ACK_JOIN
  //   Log.ds(this, this.signEvent(meetingEvent))
  // }

  // verifySample(){
  //   let ack = this.sample_ack_event as MeetingEvent;
  //   return this.verifyServerSignature(ack, (success) => {Log.i(this, "Verified? " + success.toString())})
  // }

  verifyServerSignature(event: MeetingEvent, callback: Function) {
    return this.verifySignature(event, this.serverPublicAddress, callback)
  }

  verifySignature(event: MeetingEvent, verificationAddress : string, callback: Function) {
    let eventJson = JSON.stringify(event);
    let eventCopy = JSON.parse(eventJson);
    let signature = eventCopy.eventId
    delete eventCopy.eventId;
    
    let eventBencode = bencodejs.encode(eventCopy)
    return this.web3.eth.personal.ecRecover(eventBencode, signature).then((address : string) => {
      callback(verificationAddress.toLowerCase() === address.toLowerCase())
    })
  }

  // getPublicKey(staffId : string) {

  // }

  // login(staffId, callback) {
  //   this.mdtServerService.getStaff(staffId).subscribe(
  //     (data)=> {
  //       let staff = data as Staff;
  //       this.staff = staff;
  //       callback(true)
  //     },
  //     (err) => {
  //       Log.e(this, "Error Finding staff with id: " + staffId);
  //       Log.ds(this, err);
  //       callback(false)
  //     }
  //   ) 
  // }
}
