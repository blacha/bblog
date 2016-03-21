import {Log, LogStream, LogMessage} from '../log';

export class ConsoleLogTextStream implements LogStream {
    static IGNORED_FIELDS = {
        msg: true,
        hostname: true,
        pid: true,
        level: true,
        v: true
    };

    constructor(private level:number) {
    }

    setLevel(level:number) {
        this.level = level;
    }

    write(message:LogMessage) {
        if (message.level < this.level) {
            return;
        }
        var output = [];
        Object.keys(message).forEach(function (key) {
            if (ConsoleLogTextStream.IGNORED_FIELDS[key]) {
                return;
            }
            var value = message[key];
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            output.push(`[${key}: ${value}]`)
        });

        var outputStr = output.join(' ') + ' ' + message.msg;
        if (message.level > Log.WARN) {
            return console.error(outputStr);
        }
        if (message.level > Log.INFO) {
            return console.warn(outputStr);
        }

        if (message.level > Log.DEBUG) {
            return console.info(outputStr)
        }

        console.log(outputStr);
    }

}