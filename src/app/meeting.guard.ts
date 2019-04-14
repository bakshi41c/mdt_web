import {Injectable, Inject} from '@angular/core';
import { CanDeactivate } from '@angular/router';
import {MeetingHostPageComponent} from './meeting-host-page/meeting-host-page.component';
import { Log } from './logger';

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<MeetingHostPageComponent> {
    
    canDeactivate(target: MeetingHostPageComponent) {
        if (target.manuallyLeftMeeting){
            return true
        } else {
            Log.i(this, "Confirming if they want to leave...")
            let leave =  window.confirm('Do you really want to leave?');
            if (leave) {
                target.leaveMeeting()
                return true;
            } else {
                return false;
            }
        }
    }
}