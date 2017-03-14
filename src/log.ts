var INSTANCE: Log;

export interface LogStream {
    setLevel: (level: number) => void;
    write: (message: LogMessage) => void;

    /**
     *  Close the log stream
     *
     *  No more messages will be written to the stream once .close() has been called.
     *
     *  Resolves the promise when the stream has been closed.
     */
    close?: () => Promise<void>;
}

export interface LogMessage {
    hostname: string;
    pid?: number;
    level: number;
    time: Date;
    msg: string;
    v: number;
    err?: Object;
}

export interface LoggerCreationContext {
    name: string;
    hostname: string;
    streams?: LogStream[];
    stream?: LogStream;
    keys?: { [key: string]: any };
}

export class Log {
    static TRACE = 10;
    static DEBUG = 20;
    static INFO = 30;
    static WARN = 40;
    static ERROR = 50;
    static FATAL = 60;

    static LOG_VERSION = 0;

    static LEVELS = {
        trace: Log.TRACE,
        debug: Log.DEBUG,
        info: Log.INFO,
        warn: Log.WARN,
        error: Log.ERROR,
        fatal: Log.FATAL
    };

    static getInstance(): Log {
        if (INSTANCE == null) {
            throw new Error('No BBLog Instance created, run BBLog.createLogger first');
        }
        return INSTANCE;
    }

    static createLogger(obj: LoggerCreationContext) {
        INSTANCE = new Log(null, { name: obj.name, hostname: obj.hostname });
        if (obj.streams && Array.isArray(obj.streams)) {
            obj.streams.forEach(stream => INSTANCE.addStream(stream));
        }
        if (obj.stream) {
            INSTANCE.addStream(obj.stream);
        }
        if (obj.keys) {
            INSTANCE.addKeys(obj.keys);
        }
        return INSTANCE;

    }

    static child(keys): Log {
        return Log.getInstance().child(keys);
    }

    private keys;
    private parent: Log;
    private streams: LogStream[];
    private closed = false;

    constructor(parent: Log, keys?) {
        this.keys = keys;
        this.parent = parent;
    }

    child(keys): Log {
        return new Log(this, keys);
    }

    addStream(stream: LogStream): Log {
        this.streams = this.streams || <LogStream[]>[];
        this.streams.push(stream);
        return this;
    }

    addKeys(obj) {
        Object.keys(obj).forEach((key) => {
            this.keys[key] = obj[key];
        });
    }

    close(): Promise<void> {
        this.closed = true;
        const closeAllStreams = this.streams.map(s => s.close == null ? null : s.close());
        return Promise.all(closeAllStreams).then(_ => null);
    }

    public trace(data: Object | string, msg?: string) {
        this.log(Log.TRACE, data, msg);
    }

    public debug(data: Object | string, msg?: string) {
        this.log(Log.DEBUG, data, msg);
    }

    public info(data: Object | string, msg?: string) {
        this.log(Log.INFO, data, msg);
    }

    public warn(data: Object | string, msg?: string) {
        this.log(Log.WARN, data, msg);
    }

    public error(data: Object | string, msg?: string) {
        this.log(Log.ERROR, data, msg);
    }

    public fatal(data: Object | string, msg?: string) {
        this.log(Log.FATAL, data, msg);
    }

    protected joinKeys(obj) {
        if (this.parent) {
            this.parent.joinKeys(obj);
        }
        var keys = this.keys;
        if (keys == null) {
            return obj;
        }
        Object.keys(keys).forEach(key => obj[key] = keys[key]);
        return obj;
    }

    private log(level: number, ...data) {
        var output: LogMessage = {
            pid: 0,
            time: new Date(),
            hostname: '',
            level,
            msg: '',
            v: Log.LOG_VERSION
        };

        this.joinKeys(output);
        for (var i = 0; i < data.length; i++) {
            var dataValue = data[i];
            if (dataValue == null) {
                continue;
            }
            if (typeof dataValue === 'string') {
                output.msg = output.msg + dataValue;
            } else if (dataValue instanceof Error) {
                output.err = ErrorSerializer(dataValue);
            } else {
                Object.keys(dataValue).forEach(key => {
                    var value = dataValue[key];
                    if (value instanceof Error) {
                        output[key] = ErrorSerializer(value);
                    } else {
                        output[key] = value;
                    }
                });
            }
        }

        this.write(output);
    }

    private write(message: LogMessage): boolean {
        if (this.closed) {
            return;
        }
        if (this.streams && this.streams.length > 0) {
            for (var i = 0; i < this.streams.length; i++) {
                var obj = this.streams[i];
                obj.write(message);
            }
            return true;
        }

        if (this.parent) {
            return this.parent.write(message);
        }
    }

}

// Taken from Bunyan :  https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js
function getFullErrorStack(ex) {
    var ret = ex.stack || ex.toString();
    if (ex.cause && typeof (ex.cause) === 'function') {
        var cex = ex.cause();
        if (cex) {
            ret += '\nCaused by: ' + getFullErrorStack(cex);
        }
    }
    return (ret);
}

export function ErrorSerializer(err) {
    if (!err || !err.stack) {
        return err;
    }

    return {
        message: err.message,
        name: err.name,
        stack: getFullErrorStack(err),
        code: err.code,
        signal: err.signal
    };
}
