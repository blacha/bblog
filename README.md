# Browser Bunyan Logger

Lightweight Logger (< 1KB gziped) that outputs into a Bunyan compatible JSON output.

Designed for use on the web, with no runtime dependencies.

# Example


```typescript
import { Log } from 'bblog';
import { ConsoleLogStream } from 'bblog-stream-console';
var log = Log.createLogger({
    name: 'Hello',
    hostname: 'world.com',
    streams: [ new ConsoleLogStream(BBLog.TRACE) ]
});

log.info('Hello World');
// {"pid":0,"time":"2016-03-21T21:38:40.092Z","hostname":"world.com","level":30,"msg":" Hello World","v":0,"name":"Hello"}


var childLogger = log.child({key: 'value'});
childLogger.warn('Child Logger');
// {"pid":0,"time":"2016-03-21T21:38:40.100Z","hostname":"world.com","level":40,"msg":" Child Logger","v":0,"name":"Hello","key":"value"}
```



# Building

Install lerna

```
yarn global add lerna

lerna bootstrap
```
Build all modules
```
lerna run build
```
Test all modules
```
lerna run test
```