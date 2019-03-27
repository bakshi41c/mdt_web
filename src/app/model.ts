export class Meeting {
    _id: string
    date: Date
    events: string[]
    patients: string[] = []
    staff: string[] = []
    title: string = "Untitled meeting"
    description : string = "No description"
    host : string;

    public static parseMeeting(object : any) : Meeting{
        let meeting = new Meeting()
        meeting._id = object._id;
        meeting.date = new Date(object.date)
        meeting.events = object.events
        meeting.patients = object.patients
        meeting.staff = object.staff
        meeting.title = object.title
        meeting.description = object.description
        return meeting
    }
}

export class Staff {
    _id : string
    name: string
    role: string
}

export class Patient {
    _id : string
    name: string
    dob: Date
    hospitalNumber: string
    infoflexLink: string
    age: string // Hack for now

    
    public static parsePatient(object : any) : Patient{
        let pat = new Patient()
        pat._id = object._id;
        pat.dob = new Date(object.dob)
        pat.name = object.name
        pat.hospitalNumber = object.hospital_number
        pat.infoflexLink = object.infoflex_link
        pat.age = pat.getAgeStringFromDob(); // Hack for now
        return pat
    }

    
    public getAgeStringFromDob() {
        let ageDifinMs = Date.now() - this.dob.getTime();
        let ageDate = new Date(ageDifinMs);
        
        let ageNumber = 0
        let ageUnit = ""

        ageNumber =  Math.abs(ageDate.getUTCFullYear() - 1970);
        ageUnit = ageNumber == 1 ? "Year" :  "Years"
        
        if (ageNumber == 0) { // if less than a year old
            ageNumber =  Math.abs(ageDate.getUTCMonth());
            ageUnit = ageNumber == 1 ? "Month" : "Months"
            if (ageNumber == 0) { // if less than a month old
                ageNumber =  Math.abs(ageDate.getUTCDay());
                ageUnit = ageNumber == 1 ? "Day" : "Days"
            }
        }

        return ageNumber + " " + ageUnit
    }

}

export class PatientMeetingData {
    _id : string;
    patientId : string;
    meetingId: string;
    mdtQuestion: string;
    group: string;
    lc: string;
    mdtOutcome: string;
    investigation: string;
    surgery: string;
}

export class MeetingEvent{
    public by : string;
    public eventId : string;
    public refEvent: string;
    public meetingId : string;
    public timestamp : number;
    public type : EventType;
    public content : Content;
}

export class Content{    
}

export class ErrorAckContent extends Content {
    errorCode: EventStreamError
    details : any
}

export class AckContent extends Content {
    details : any
}

export class StartContent extends Content { 
    otp : string;
}

export class JoinContent extends Content { 
    otp : string;
}

export class PollContent extends Content { 
    patient : string;
    question : string;
    options : string[];
}

export class VoteContent extends Content { 
    vote : string;
}

export class CommentContent extends Content { 
    patient : string;
    comment : string;
}

export class ReplyContent extends Content { 
    reply : string;
}

export class DiscussionContent extends Content { 
    patient : string;
}

export class PatientDataChangeContent extends Content { 
    patient : string;    
    from : string;
    to : string;
}

export enum EventType{
    START = "start",
    JOIN = "join",
    LEAVE = "leave",
    POLL = "poll",
    POLL_END = "pollEnd",
    VOTE = "vote",
    COMMENT = "comment",
    REPLY = "reply",
    DISCUSSION = "discussion", 
    DISAGREEMENT = "disagreement", 
    PATIENT_DATA_CHANGE = "patientDataChange",
    ACK = "ack",
    ACK_JOIN = "joinAck",
    ACK_POLL_END = "pollEndAck",
    ACK_ERR = "ackError",
    END = "end"
}

export enum EventStreamError{
    UNAUTHORISED = "unauthorized",
    MEETING_NOT_FOUND = "meeting not found",
    BAD_SIGNATURE = "bad signature",
    BAD_OTP = "bad otp",
    MALFORMED_EVENT = "malformed event",
    TIMESTAMP_NOT_SYNC = "time stamp not in sync",
    INTERNAL_ERROR = "internal error",
    INVALID_REF_EVENT = "invalid ref event",
    UNKNOWN_ERROR = "unknown error",
    STAFF_NOT_FOUND = "staff nor found",
    MEETING_NOT_STARTED = "meeting not started",
    MEETING_NOT_JOINED = "meeting not joined",
    POLL_NOT_FOUND = "poll not found",
    INVALID_VOTE_OPTION = "invalid vote option",
    PATIENT_NOT_FOUND = "patient not found",
    MEETING_ALREADY_STARTED = "meeting already started",
    ALREADY_VOTED = "already voted"
}

export enum EventAction{
    REPLY,
    DISAGREE,
    POLL_END,
    VIEW_RESULTS,
    VOTE,

    COMMENT,
    CREATE_POLL,
    DISCUSS,
    PDC,

    // END = "e",
    // LEAVE = "4",
    
    UNKNOWN,
}