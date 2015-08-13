module.exports = function (opts) {

    var restify = require('restify'),
        log = require('service/Logger');

    log.level(opts.log_level);

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

    server.on( 'uncaughtException', function ( request, response, route, error ) {
        log.error(error);
        if ( process.env.NODE_ENV == 'prod' ) {
            var responseMessage = {
                message: "We had a problem with our server. Try again later."
            }
            return response.json( 500, responseMessage )
        }
        response.send( error )
    });

};
