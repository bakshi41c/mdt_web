import { Injectable } from '@angular/core';
import { MeetingEvent, Staff, Meeting, EventType, DeeIdLoginSig, DeeIdUId, DeeIdLoginSigSigned } from './model';
import { MdtServerService } from './mdt-server.service';
import { Log } from './logger';
import * as bencodejs from 'bencode-js'
import * as jssha256 from 'js-sha256'
import Web3 from 'web3';
import ethCrypto from 'eth-crypto';
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
  deeIdServerPublicAddress = "https://ferme.serveo.net" // TODO: Remove when deploying, only needed for development
  deeIdSessionId = null
  signature = null
  sessionAccount : Account = null // This is the eth Account that gets setup when logged in, used mainly for singning for meetings
  serverPublicAddress : string = '0x1c0b2f7a73ecbf7ce694887020dbcbaaa2e126f7'
  recieveduId = false;
  deeIdLoginSig = new DeeIdLoginSig() // declaring it here so we can access it larer
  deeIdLoginSigSigned : DeeIdLoginSigSigned; // declaring it here so we can access it later

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

  async encryptUsingKey(key : string, msg : string) {
    let encryptedData = await ethCrypto.encryptWithPublicKey(key, msg);
    let encryptedString = ethCrypto.cipher.stringify(encryptedData)
    return encryptedString
  }

  async decryptUsingKey(key : string, cipherText : string) {
    let encryptedData = ethCrypto.cipher.parse(cipherText)
    let decryptedString = await ethCrypto.decryptWithPrivateKey(key, encryptedData);
    return decryptedString;
  }

  generateNewEncyrptionKeyPair() : string[] {
    let newKey= ethCrypto.createIdentity();;
    
    Log.d(this, "New Key Pair: " + newKey.publicKey + ", #######, " + newKey.privateKey)
    return [newKey.publicKey, newKey.privateKey]  // substring removed 0x
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
    this.recieveduId = false;
    this.deeIdWsConnection = null;
    this.deeIdWsConnection = new WebSocket(this.deeIdServerAddress);
    this.deeIdWsConnection.onopen = function() {
      Log.d(this, 'Opened websocket');
    };
    this.deeIdWsConnection.onmessage = (event) => {
      let dataJson = JSON.parse(event.data);
      Log.d(this, "Recived new message from DeeID server: ")
      Log.ds(this, dataJson)
      if (dataJson.type === "uID" && !this.recieveduId) {
          Log.d(this, "We have UID: " + dataJson)
          let deeIDUid = dataJson as DeeIdUId
          let uid = deeIDUid.uID
          this.recieveduId = true // We set this flag to true, so we ignore subsequent uid messages until next login

          // Generate a new LoginSIg object that the user can sign
          this.deeIdLoginSig.uID = uid;
          this.deeIdLoginSig.wsURL = this.deeIdServerPublicAddress
          this.deeIdLoginSig.data = this.sessionAccount.address
          let qrData = JSON.stringify(this.deeIdLoginSig)
          onQRCodeCallback(qrData)

      } else if(dataJson.type === 'loginSigSigned') {
        Log.d(this, "We have login signature!");
        let deeIdLoginSigSigned = dataJson as DeeIdLoginSigSigned
        Log.ds(this, deeIdLoginSigSigned)

        this.verifyLoginSignature(deeIdLoginSigSigned, this.deeIdLoginSig, (success) => {
          if (success) {
            this.mdtServerService.login(deeIdLoginSigSigned, (success) => {
              if (success) {
                this.mdtServerService.getStaff(deeIdLoginSigSigned.deeID).subscribe(
                  (data) => {
                    let staff = data as Staff
                    this.staff = staff
                    onLogin(true)
                  },
                  (error) => {
                    Log.e(this, "Error fetching Staff name")
                    Log.ds(this, error)
                    onLogin(false)
                  }
                )
              } else {
                onLogin(false)
              }
            })
          }
          onLogin(false)
        })

        
      }
    }
    return true;
  }

  signEvent(event : MeetingEvent) {
    event.by= this.staff._id
    let eventJson = JSON.stringify(event);
    let eventCopy = JSON.parse(eventJson);
    delete eventCopy._id;
    delete eventCopy.__proto__;
    let eventBencode = bencodejs.encode(eventCopy)
    let signature = this.sessionAccount.sign(eventBencode)
    event._id = signature.signature;
    return event
  }

  getSessionKey(){
    return this.sessionAccount.address
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
    let signature = eventCopy._id
    delete eventCopy._id;
    
    let eventBencode = bencodejs.encode(eventCopy)
    this.web3.eth.personal.ecRecover(eventBencode, signature, (error, address) => {
      if (!error) {
        callback(verificationAddress.toLowerCase() === address.toLowerCase())
      } else {
        Log.e(this, "Couldn't recover ETH address from signature")
        callback(false);
      }
    })
  }

  verifyLoginSignature(deeIdLoginSigSigned : DeeIdLoginSigSigned, deeIdLoginSig : DeeIdLoginSig, callback : Function){
    Log.d(this, "res: ")
    Log.ds(this, deeIdLoginSigSigned)
    Log.d(this, "req: ")
    Log.ds(this, deeIdLoginSig)

    if (deeIdLoginSig.data !== deeIdLoginSigSigned.data){
      Log.e(this, "The pubKey that was shown in barcode does not match the pubkey that was signed!")
      callback(false)
      return
    }

    if (deeIdLoginSig.uID !== deeIdLoginSigSigned.uID){
      Log.e(this, "The uID that was shown in barcode does not match the uID that was signed!")
      callback(false)
      return
    }
    
    let msg = deeIdLoginSigSigned.uID + deeIdLoginSigSigned.deeID + deeIdLoginSigSigned.expirytime + deeIdLoginSigSigned.data;

    this.web3.eth.personal.ecRecover(msg, deeIdLoginSigSigned.signature, (error, address) => {
      if (!error) {
        // Check smart contract here
        this.deeIdLoginSigSigned = deeIdLoginSigSigned
        Log.i(this, "Successfully verified: " + address)
        callback(true);
      } else {
        Log.e(this, "Couldn't recover ETH address from signature")
        callback(false);
      }
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

   /*
                      {
                        'type': 'loginSig',
                        'uID' : '',
                        'deeID': '',
                        'timestamp' : '',
                        'data' : '',
                        'signature': '=sig(uID+deeID+timestamp+data)',
                      }

                      1. Get pubKey from sig and verify it
                      2. Check if deeID is in user DB
                      3. Go to deeID contract, check if pubKey from (1) is in contract
                      4. If yes, user is good, create session
                      5. Store proxyPubKey and pubKey in DB
                      6.   

                      */
                        // 'omneeID': deeID,
                        // 'msg': msg,
                        // 'signature' : flatSig}
}
