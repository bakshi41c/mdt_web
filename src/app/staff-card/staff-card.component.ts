import { Component, OnInit, Input } from '@angular/core';
import { MdtServerService } from '../mdt-server.service';
import { Staff } from '../model';
import { Log } from '../logger';

@Component({
  selector: 'app-staff-card',
  templateUrl: './staff-card.component.html',
  styleUrls: ['./staff-card.component.css']
})
export class StaffCardComponent implements OnInit {

  constructor(private mdtServerService : MdtServerService) { }

  @Input() staffId : string;
  staffName = "☐☐☐☐☐☐"
  avatar = "/assets/images/avatar3"
  ngOnInit() {
    this.avatar = "/assets/images/avatar" + (this.staffId.charCodeAt(5) % 5) + ".png"

    this.mdtServerService.getStaff(this.staffId).subscribe((data) => {
      let staff = data as Staff
      this.staffName = staff.name
    }, (err) => {
      Log.e(this, "Error fetching Staff name")
      Log.ds(this, err)
    })
  }
}
