# Browser Bunyan Logger

Lightweight Logger (< 1KB gziped) that outputs into a Bunyan compatible JSON output.

Designed for use on the web, with no runtime dependencies.

# Example

```javascript
var BBLog = require('bblog').Log;
var ConsoleLogStream = require('bblog/build/stream/console.log').ConsoleLogStream;
var log = BBLog.createLogger({
    name: 'Hello',
    hostname: 'google.com',
    stream: new ConsoleLogStream(BBLog.TRACE)
});

log.info('Hello World');
// {"pid":0,"time":"2016-03-21T21:38:40.092Z","hostname":"google.com","level":30,"msg":" Hello World","v":0,"name":"Hello"}


var childLogger = log.child({key: 'value'});
childLogger.warn('Child Logger');
// {"pid":0,"time":"2016-03-21T21:38:40.100Z","hostname":"google.com","level":40,"msg":" Child Logger","v":0,"name":"Hello","key":"value"}

```
