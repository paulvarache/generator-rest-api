var HelloController = require('controller/Hello');

module.exports = function (server) {

    server.get('/v1/hello/:name', HelloController.get);

};