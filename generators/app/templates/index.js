var config = null;
var args = require('optimist')
    .usage('Usage: $0 --config [configFile] --log_level [TRACE|DEBUG|INFO|WARN|ERROR|FATAL]')
    .demand(['config'])
    .default('log_level', 'INFO')
    .alias({
        c: 'config',
        l: 'log_level'
    })
    .check(function (args) {
        config = require(args.config);
    })
    .argv;

args.config = config;

require('./server')(args);