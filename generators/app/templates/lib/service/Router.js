var pkg = require('../../package.json'),
    glob = require('glob');

module.exports = function (server) {

    server.get('/release', function (req, res) {
        res.json({
            version: pkg.version
        });
    });

    var routeFiles = glob.sync('route/**/*.js');

    routeFiles.forEach(function (file) {
        require('../../' + file)(server);
    });

};