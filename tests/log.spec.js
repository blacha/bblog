var o = require('ospec');
var BBlog = require('../build/log');
var Log = BBlog.Log;

o.spec('BBlog', () => {

    var loggerCtx = {
        name: 'FakeLogger',
        hostname: 'FakeHost'
    }

    o.spec('getInstance', () => {
        o('should throw a error if none exist', () => {
            try { 
                Log.getInstance();
                o(false).equals(true);
            } catch(e) {
                o(e.message.indexOf('No BBLog Instance')).equals(0);
            }
        })

        o('should get existing instance', () => {
            var logger = Log.createLogger(loggerCtx);
            var currentLogger = Log.getInstance();

            o(logger).equals(currentLogger);
            o(logger.keys.hostname).equals(loggerCtx.hostname);
            o(currentLogger.keys.hostname).equals(loggerCtx.hostname);
        });
    });
 
});