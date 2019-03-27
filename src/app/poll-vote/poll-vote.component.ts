import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Log } from '../logger';
import { VoteContent } from '../model';

@Component({
  selector: 'app-poll-vote',
  templateUrl: './poll-vote.component.html',
  styleUrls: ['./poll-vote.component.css']
})
export class PollVoteComponent implements OnInit {

  constructor() { }
  @Input() question: string = ""
  @Input() options : string[] = []

  @Output() voteButtonClicked = new EventEmitter<VoteContent>();

  optionSelected = this.options[0]

  ngOnInit() {
  }

  onVoteButtonClicked(){
    let vc = new VoteContent();
    vc.vote = this.optionSelected;
    this.voteButtonClicked.emit(vc);
  }

  onVoteChanged(voteString) {
    Log.d(this, "Vote changed to " + voteString)
    this.optionSelected = voteString;
  }

}
