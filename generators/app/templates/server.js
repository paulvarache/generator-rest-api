module.exports = function (opts) {

    var restify = require('restify'),
        log = require('service/Logger');

    log.opts = opts.log_level;

    var server = restify.createServer({
        name: '<%= name %>',
        log: log
    });

    server.pre(function (req, res, next) {
        server.log.info({ req: req});
        next();
    });

    require('service/Router')(server);

    log.info('Starting server with config', opts.config.name);

    server.listen(opts.config.server.port, function () {
        log.info('Listening on port', server.address().port);
    });

};