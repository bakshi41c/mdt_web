export class Meeting {
    _id: string
    date: Date
    events: string[]
    patients: string[] = []
    staff: string[] = []
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

export class Staff {
    _id : string
    name: string
    role: string
}

export class Patient {
    _id : string
    name: string
    dob: Date
    hospital_number: string
    infoflex_link: string
    age: string // Hack for now

    
    public static parsePatient(object : any) : Patient{
        let pat = new Patient()
        pat._id = object._id;
        pat.dob = new Date(object.dob)
        pat.name = object.name
        pat.hospital_number = object.hospital_number
        pat.infoflex_link = object.infoflex_link
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