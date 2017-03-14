import { LogMessage, LogStream } from 'bblog';

var LELogger = require('le_node');

var LevelToName = {
    10: 'debug',
    20: 'debug',
    30: 'info',
    40: 'warning',
    50: 'err',
    60: 'crit'
};

export class LogentriesStream implements LogStream {
    level: number;
    logger: any;

    constructor(level: number, apiToken: string, opts?) {
        var LEOptions = {
            token: apiToken,
            type: 'raw',
            timestamp: false,
            withLevel: false,
            secure: true,
            bufferSize: 1000
        };

        if (opts != null) {
            Object.keys(opts).forEach(k => LEOptions[k] = opts[k]);
        }

        this.level = level;
        this.logger = new LELogger(LEOptions);
    }

    setLevel(level: number) {
        this.level = level;
    }

    write(message: LogMessage) {
        if (message.level < this.level) {
            return;
        }
        var LELevel = LevelToName[message.level] || 'info';
        this.logger.log(LELevel, message);
    }

    close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger.once('buffer drain', () => {
                this.logger.closeConnection();
                this.logger.on('disconnected', () => resolve(null));
            });
        });
    }
}
