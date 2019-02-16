import { Component, OnInit, Input } from '@angular/core';
import { Meeting, Staff, Patient } from '../model';
import { MdtServerService } from '../mdt-server.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {Router, ActivatedRoute} from "@angular/router"
import * as moment from 'moment';

import { Log } from '../logger';

@Component({
  selector: 'app-meeting-page',
  templateUrl: './meeting-page.component.html',
  styleUrls: ['./meeting-page.component.css']
})
export class MeetingPageComponent implements OnInit {
  readOnly : boolean = false
  loading: boolean = true
  meeting : Meeting

  showStaffListLoading = false;
  showPatientListLoading = false;

  staffList: Staff[] = [];
  staffModalSettings = {
    selectMode: 'multi',
    pager: {
      display: false
    },
    columns: {
      _id : {
        title: 'Id'
      },
      name: {
        title: 'Full Name'
      },
      role: {
        title: 'Role'
      }
    },
    actions : {
      columnTitle : "",
      add : false,
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
      _id : {
        title: 'Id'
      },
      name: {
        title: 'Full Name'
      },
      age: {
        title: 'Age'
      },
      hospital_number : {
        title: 'Hospital no.'
      }
    },
    actions : {
      columnTitle : "",
      add : false,
      edit: false,
      delete: false
    }
  }

  constructor(private mdtServerService: MdtServerService, public ngxSmartModalService: NgxSmartModalService, 
    private router: Router, private activatedRoute: ActivatedRoute) { 
  }

  ngOnInit() {
    this.loading = true;
    let urlComponent =  this.activatedRoute.snapshot.url[1].toString()

    if (urlComponent === "create"){ // New meeting
      this.meeting = new Meeting();
      this.loading=false;
    } else {
      this.mdtServerService.getMeeting(urlComponent).subscribe(
      (data) => {
        this.meeting = data as Meeting;
        Log.ds(this, this.meeting)
        this.loading=false;
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

  getStaffList(){
    Log.d(this, "Fetching Staff list...");
    this.mdtServerService.getStaff()
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

  getPatientList(){
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

  patientAddDone(selectedPatients){
    this.meeting.patients = []
    // Log.dr(this, selectedPatients)
    selectedPatients.forEach(patient => {
      this.meeting.patients.push(patient._id)
    });
    this.ngxSmartModalService.getModal('patientAddModal').close()
    Log.ds(this, this.meeting.patients)
  }

  staffAddDone(slectedStaff){
    this.meeting.staff = []
    slectedStaff.forEach(staff => {
      this.meeting.staff.push(staff._id)
    });
    this.ngxSmartModalService.getModal('staffAddModal').close()
    Log.ds(this, this.meeting.staff)
  }

  createButtonClicked() {
    Log.i(this, "Create Button clicked!")
    Log.ds(this, this.meeting)
    this.mdtServerService.createMeeting(this.meeting).subscribe(
      res => {
          Log.i(this, "Meeting Created Succesfully: " + res);
          this.navigateToMeetingListPage()
      }
    );
  }

  saveButtonClicked() {
    Log.i(this, "Save Button clicked!")
    Log.ds(this, this.meeting)
    this.mdtServerService.updateMeeting(this.meeting).subscribe(
      res => {
          Log.i(this, "Meeting Updated Succesfully: " + res);
          this.navigateToMeetingListPage()      
        }
    );
  }

  deleteButtonClicked(){
    Log.i(this, "Delete Button clicked!")
    Log.ds(this, this.meeting)
    this.mdtServerService.deleteMeeting(this.meeting).subscribe(
      res => {
        Log.i(this, "Meeting Deleted Succesfully: " + res);
        this.navigateToMeetingListPage()
      }
    )
  }

  navigateToMeetingListPage(){
    this.router.navigate(['/meeting']);
  }

}
