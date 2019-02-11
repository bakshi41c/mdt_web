import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MdtServerService } from '../mdt-server.service';
import { Log } from '../logger';

@Component({
  selector: 'app-list-filter-select',
  templateUrl: './list-filter-select.component.html',
  styleUrls: ['./list-filter-select.component.css']
})
export class ListFilterSelectComponent implements OnInit {

  @Input() doneButtonTitle : string;
  @Input() settings : any;
  @Input() data : any[];

  @Output() done: EventEmitter<any[]> = new EventEmitter();

  constructor(private mdtServerService: MdtServerService) { }

  selectedItems : any[]

  ngOnInit() {
  }

  rowSelected(event){
    // Log.dr(this, event)
    // Log.ds(this, event.selected)
    this.selectedItems = event.selected
  }

  doneButtonClicked() {
    Log.i(this, this.doneButtonTitle + ": Done Button Clicked")
    this.done.emit(this.selectedItems);
  }

}
