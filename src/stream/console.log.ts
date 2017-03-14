import { LogMessage, LogStream } from '../log';

export class ConsoleLogStream implements LogStream {

    constructor(private level: number) {
    }

    setLevel(level: number) {
        this.level = level;
    }

    write(message: LogMessage) {
        if (message.level < this.level) {
            return;
        }
        console.log(JSON.stringify(message));
    }
}