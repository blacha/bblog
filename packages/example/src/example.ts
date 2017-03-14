import { Log } from 'bblog';
import { ConsoleLogStream } from 'bblog-stream-console';


var logger = Log.createLogger({
    name: 'Hello',
    hostname: 'World',
    streams: [new ConsoleLogStream(Log.TRACE)]
});

logger.info('Hello World');
// {
//     "pid":0,
//     "time":"2017-03-14T06:48:00.799Z",
//     "hostname":"World",
//     "level":30,
//     "msg":"Hello World",
//     "v":0,
//     "name":"Hello"
// }


var child = logger.child({ key: 'value' });
child.trace('Child!');
// {
//     "pid": 0,
//     "time": "2017-03-14T06:48:00.805Z",
//     "hostname": "World",
//     "level": 10,
//     "msg": "Child!",
//     "v": 0,
//     "name": "Hello",
//     "key": "value"
// }
