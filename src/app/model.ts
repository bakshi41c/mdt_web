export class Meeting {
    _id: string
    date: Date
    events: string[]
    patients: string[]
    staff: string[]
    title: string = "Untitled meeting"
    description : string = "No description"

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