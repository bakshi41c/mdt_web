import { Component, OnInit, Input } from '@angular/core';
import { Meeting, Staff, Patient } from '../model';
import { MdtServerService } from '../mdt-server.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router, ActivatedRoute } from "@angular/router"
import { AuthService } from '../auth.service';

import { Log } from '../logger';

@Component({
  selector: 'app-meeting-page',
  templateUrl: './meeting-page.component.html',
  styleUrls: ['./meeting-page.component.css']
})
export class MeetingPageComponent implements OnInit {
  readOnly: boolean = false
  newMeeting: boolean = false
  loading: boolean = true
  meeting: Meeting

  showStaffListLoading = false;
  showPatientListLoading = false;

  staffList: Staff[] = [];
  staffModalSettings = {
    selectMode: 'multi',
    pager: {
      display: false
    },
    columns: {
      _id: {
        title: 'Id'
      },
      name: {
        title: 'Full Name'
      },
      role: {
        title: 'Role'
      }
    },
    actions: {
      columnTitle: "",
      add: false,
      edit: false,
      delete: false
    }
  }

  patientList: Patient[] = [];
  patientModalSettings = {
    selectMode: 'multi',
    pager: {
      display: false
    },
    columns: {
      _id: {
        title: 'Id'
      },
      name: {
        title: 'Full Name'
      },
      age: {
        title: 'Age'
      },
      hospital_number: {
        title: 'Hospital no.'
      }
    },
    actions: {
      columnTitle: "",
      add: false,
      edit: false,
      delete: false
    }
  }

  constructor(private mdtServerService: MdtServerService, public ngxSmartModalService: NgxSmartModalService,
    private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService,) {
  }

  ngOnInit() {
    this.loading = true;
    Log.dr(this, this.activatedRoute.snapshot)
    let urlComponent = this.activatedRoute.snapshot.url[1].toString()

    this.newMeeting = urlComponent === "create";

    if (this.newMeeting) {

      this.meeting = new Meeting();
      this.meeting.host = this.authService.getLoggedInStaff()._id
      this.loading = false;
    } else {
      this.mdtServerService.getMeeting(urlComponent).subscribe(
        (data) => {
          this.meeting = data as Meeting;
          Log.ds(this, this.meeting)
          this.loading = false;
        },
        (err) => {
          Log.e(this, "ERROR: Fetching Meeting " + urlComponent)
        })
    }
    // TODO: Case when create = false, and meetingId is null
  }

  staffBtnClicked() {
    Log.i(this, "Staff Btn Clicked!");
    this.showStaffListLoading = true;
    this.getStaffList();
    this.ngxSmartModalService.getModal('staffAddModal').open()
  }

  getStaffList() {
    Log.d(this, "Fetching Staff list...");
    this.mdtServerService.getAllStaff()
      .subscribe(
        (data) => {
          if (!Array.isArray(data)) {
            Log.e(this, "Recieved meeting object not an array")
            return;
          }
          this.staffList = data as Staff[]
          // Log.ds(this,this.staffList)
          this.showStaffListLoading = false;
        });
  }

  patientBtnClicked() {
    Log.i(this, "Patient Btn Clicked!");
    this.showStaffListLoading = true;
    this.getPatientList();
    this.ngxSmartModalService.getModal('patientAddModal').open()
  }

  getPatientList() {
    Log.d(this, "Fetching Patient list...");
    this.mdtServerService.getPatients()
      .subscribe((data) => {
        if (!Array.isArray(data)) {
          Log.e(this, "Recieved meeting object not an array")
          return;
        }
        let objects = data as any[]

        this.patientList = []
        data.forEach(element => {
          let patient = Patient.parsePatient(element)
          this.patientList.push(patient)
        });

        // Log.ds(this, this.patientList)
        this.showStaffListLoading = false;
      });
  }

  patientAddDone(selectedPatients) {
    this.meeting.patients = []
    // Log.dr(this, selectedPatients)
    selectedPatients.forEach(patient => {
      this.meeting.patients.push(patient._id)
    });
    this.ngxSmartModalService.getModal('patientAddModal').close()
    Log.ds(this, this.meeting.patients)
  }

  staffAddDone(slectedStaff) {
    this.meeting.staff = []
    slectedStaff.forEach(staff => {
      this.meeting.staff.push(staff._id)
    });
    this.ngxSmartModalService.getModal('staffAddModal').close()
    Log.ds(this, this.meeting.staff)
  }

  saveButtonClicked() {
    Log.i(this, "Save/Create Button clicked!")

    if (this.newMeeting) {
      this.mdtServerService.createMeeting(this.meeting).subscribe(
        res => {
          Log.i(this, "Meeting Created Succesfully: " + res);
          this.navigateToMeetingListPage()
        },
        err => {
          Log.e(this, "Error Creating Meeting: " + err);
          Log.dr(this, err);
        }
      );
    } else {
      this.mdtServerService.updateMeeting(this.meeting).subscribe(
        res => {
          Log.i(this, "Meeting Updated Succesfully: " + res);
          this.navigateToMeetingListPage()
        },
        err => {
          Log.e(this, "Error Updated Meeting: " + err);
          Log.dr(this, err);
        }
      );
    }
  }

  deleteButtonClicked() {
    Log.i(this, "Delete Button clicked!")
    Log.ds(this, this.meeting)
    this.mdtServerService.deleteMeeting(this.meeting).subscribe(
      res => {
        Log.i(this, "Meeting Deleted Succesfully: " + res);
        this.navigateToMeetingListPage()
      },
      err => {
        Log.e(this, "Error Deleting Meeting: " + err);
        Log.dr(this, err);
      }
    )
  }

  navigateToMeetingListPage() {
    this.router.navigate(['/meeting']);
  }

}