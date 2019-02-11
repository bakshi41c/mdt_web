import { Component, OnInit } from '@angular/core';
import { Meeting, Staff, Patient } from '../model';
import { MdtServerService } from '../mdt-server.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import * as moment from 'moment';

import { Log } from '../logger';


@Component({
  selector: 'app-create-meeting-page',
  templateUrl: './create-meeting-page.component.html',
  styleUrls: ['./create-meeting-page.component.css']
})
export class CreateMeetingPageComponent implements OnInit {

  meeting : Meeting

  showAddStaffModal : boolean = false;
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

  showAddPatientModal : boolean = false;
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

  constructor(private mdtServerService: MdtServerService, public ngxSmartModalService: NgxSmartModalService) { 
  }

  ngOnInit() {
    this.meeting = new Meeting();
  }

  staffBtnClicked() {
    Log.i(this, "Stafff Btn Clicked!");
    this.getStaffList();
    this.ngxSmartModalService.getModal('staffAddModal').open()

  }

  getStaffList(){
    this.mdtServerService.getStaff()
    .subscribe(
      (data) => {
      if (!Array.isArray(data)) {
        Log.e(this, "Recieved meeting object not an array")
        return;
      }
      this.staffList = data as Staff[]
      // Log.ds(this,this.staffList)
      this.showAddStaffModal = true;
    });
  }

  patientBtnClicked() {
    Log.i(this, "Patient Btn Clicked!");
    this.getPatientList();    
    this.ngxSmartModalService.getModal('patientAddModal').open()
  }

  getPatientList(){
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
      this.showAddPatientModal = true;
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
    Log.ds(this, this.meeting)
    this.mdtServerService.createMeeting(this.meeting);
  }

}
