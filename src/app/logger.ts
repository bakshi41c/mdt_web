export class Log {

    public static VERBOSE = true;

    public static d(c, o){
        if (!this.VERBOSE) { return; }
        this.p(c, o, Level.DEBUG)
    }

    public static ds(c, o){
        if (!this.VERBOSE) { return; }
        this.p(c, "Static Obj Print:", Level.SPECIAL)
        var cache = [];
        console.log(
            JSON.stringify(o, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found
                    try {
                        // If this value does not reference a parent it can be deduped
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        // discard key if value cannot be deduped
                        return;
                    }
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
            })
        )
        cache = null;
    }

    public static dr(c, o){
        if (!this.VERBOSE) { return; }
        this.p(c, "Dir Print:", Level.SPECIAL)
        console.dir(o)
    }

    public static e(c, o){
        this.p(c, o, Level.ERROR)
    }

    public static i(c, o){
        if (!this.VERBOSE) { return; }
        this.p(c, o, Level.INFO)
    }

    public static w(c, o){
        if (!this.VERBOSE) { return; }
        this.p(c, o, Level.WARN)
    }

    private static p(c : any, o : any, l: Level){
        let classname = c.constructor.name
        let todaysDate = new Date();
        let timestamp = todaysDate.toLocaleTimeString()
        
        let timestamp_format= "background: white; color: gray"

        console.log("%c" + timestamp +"%c ["+l+"] " + classname + ": " + o , timestamp_format, this.getLogFormatting(l))
    }

    private static getLogFormatting(l : Level){
        switch (l) {
            case Level.DEBUG:
                return "background: white; color: black"

            case Level.WARN:
                return "background: white; color: #f8a21a"

            case Level.INFO:
                return "background: white; color: #023b62"

            case Level.ERROR:
                return "background: white; color: #db4437"

            case Level.SPECIAL:
                return "background: white; color: #694aab"
        }
    }

    public test(){
        Log.d(this, "This is a debug message")
        Log.i(this, "This is a debug message")
        Log.w(this, "This is a debug message")
        Log.e(this, "This is a debug message")
    
        Log.ds(this, {a: "AAA", b: "BBB"})
        Log.dr(this, {a: "AAA", b: "BBB"})
    }
}

enum Level {
    DEBUG = "DEB",
    INFO = "INF",
    WARN = "WRN",
    ERROR = "ERR",
    SPECIAL = "SPL"
}