var Logger = require('bunyan');

var logger = new Logger({
    name: '<%= name %>',
    serializers: {
        req: Logger.stdSerializers.req
    }
});

module.exports = logger;