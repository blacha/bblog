import {LogStream, LogMessage} from 'bblog';
import * as https from 'https';

const LE_HOST = 'webhook.logentries.com';
const MAX_OUTSTANDING_REQUESTS = 200;

export class LogentriesPostStream implements LogStream {
    level: number;
    logger: any;

    token: string;
    urlPath: string;
    requests: Promise<void>[];

    constructor(level: number, token: string, opts?) {
        this.level = level;
        this.token = token;

        this.urlPath = `/noformat/logs/${this.token}`;
        this.requests = [];
    }

    setLevel(level: number) {
        this.level = level;
    }

    write(message: LogMessage) {
        if (message.level < this.level) {
            return;
        }

        if (this.requests.length > MAX_OUTSTANDING_REQUESTS) {
            return;
        }
        
        this.sendMessage(message);
    }


    sendMessage(jsonObj:LogMessage):Promise<void> {
        var message = JSON.stringify(jsonObj);
        var postOptions = {
            host: LE_HOST,
            path: this.urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(message)
            }
        };

        var promise = new Promise<void>((resolve,reject) => {
            var postReq = https.request(postOptions, function(res) {
                res.setEncoding('utf8');
                res.on('data', () => null);
                res.on('end', () => resolve(null));
            });

            postReq.write(message);
            postReq.end();
        });

        this.requests.push(promise);

        promise.then(() => {
            var promiseIndex = this.requests.indexOf(promise);
            if (promiseIndex > -1) {
                this.requests.splice(promiseIndex, 1);
            }
            
            if (this.requests.length === 0) {
                this.requests = [];
            }
        });
        return promise;
    }

    close():Promise<void> {
        return Promise.all(this.requests).then(_ => null);
    }
}