import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Log } from '../logger';
import { CommentContent, Patient, ReplyContent } from '../model';


@Component({
  selector: 'app-comment-reply',
  templateUrl: './comment-reply.component.html',
  styleUrls: ['./comment-reply.component.css']
})
export class CommentReplyComponent implements OnInit {

  constructor() { }
  @Input() isReply : boolean = false;
  @Input() replyTo? : string = "This is Absolute Rubbish!!";
  @Input() currentPatientDisucussion : Patient;
  @Input() patients = {};


  @Output() commentBtnClicked = new EventEmitter<any>();

  comment : string = ""
  commentLable : string = "";
  commentBtnLable : string = "";
  discussedPatientNames: string[] = []
  selectedPatientId : string;

  ngOnInit() {
    if (this.isReply) {
      this.commentLable = "Reply:"
      this.commentBtnLable = "Reply"
    } else {
      this.commentLable = "Comment:"
      this.commentBtnLable = "Comment"
    }
  }

  onCommentClicked() {
    Log.i(this, "Comment btn clicked!")

    if (this.isReply) {
      let cmc = new ReplyContent()
      cmc.reply = this.comment
      this.commentBtnClicked.emit(cmc)
    } else {
      let cmc = new CommentContent()
      if (this.selectedPatientId) {
        cmc.patient = this.selectedPatientId;
      }
      cmc.comment = this.comment
      this.commentBtnClicked.emit(cmc)
    }
  }

  getPatientsAsArray() {
    return Object.values(this.patients)
  }

  patientSelected(patientId) {
    if (patientId) {
      this.selectedPatientId = patientId;
    } else {
      this.selectedPatientId = null;
    }
  }

}
