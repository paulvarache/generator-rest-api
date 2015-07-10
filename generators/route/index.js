var generators = require('yeoman-generator'),
    glob = require('glob'),
    esprima = require('esprima'),
    engine = require('ejs').render;

var CONTROLLER_DIR = './lib/controller/',
    ROUTE_DIR = './route/';

module.exports = generators.NamedBase.extend({
    constructor: function () {

        generators.NamedBase.apply(this, arguments);

        this.engine = engine;

        this.routes = glob.sync('./route/**/*.js');
        this.routes = this.routes.map(function (item) {
            return item.substr(8, item.length - 11);
        });
        this.routes.push('new file');


        this.controllers = glob.sync('./lib/controller/**/*.js');

        this.controllers = this.controllers.map(function (item) {
            return item.substr(17, item.length - 20);
        });

        this.controllers.push('new controller');

        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);

        this.log('Creating route ' + this.name);

        this.getControllerFile = function (controllerName) {
            return CONTROLLER_DIR + controllerName + '.js';
        };

        this.getRouteFile = function (routeName) {
            return ROUTE_DIR + routeName + '.js';
        };

        this.askForController = function (callback) {
            this.prompt({
                type: 'list',
                name: 'controller',
                message: 'Which controller to use with this route',
                choices: this.controllers,
            }, function (answers) {
                if (answers.controller === this.controllers[this.controllers.length - 1]) {
                    this.prompt({
                        type: 'input',
                        name: 'controllerName',
                        message: 'What is the name of the new controller',
                        default: 'Hello',
                        validate: function (input) {
                            return input.indexOf('.') === -1;
                        }
                    }, function (answers) {
                        this.controllerName = answers.controllerName;
                        this.template('controller.tpl.js', this.getControllerFile(this.controllerName));
                        callback(this.controllerName);
                    }.bind(this));
                } else {
                    callback(answers.controller);
                }

            }.bind(this));
        };

        this.askForRouteFile = function (callback) {
            this.prompt([{
                type: 'input',
                name: 'method',
                message: 'Which method for the route',
                validate: function (input) {
                    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].indexOf(input.toUpperCase()) !== -1;
                },
                filter: function (input) {
                    return input.toLowerCase();
                }
            },
            {
                type: 'input',
                name: 'url',
                message: 'What is the url of the new route',
                validate: function (input) {
                    return /^\/(.+\/?)*/.test(input);
                }
            },
            {
                type: 'list',
                name: 'target',
                message: 'Where add the new route',
                choices: this.routes
            }], function (answers) {
                this.method = answers.method;
                this.url = answers.url;
                if (answers.target === this.routes[this.routes.length - 1]) {
                    this.prompt({
                        type: 'input',
                        name: 'filename',
                        message: 'What is the name of the new route file (version/name)',
                        default: 'v1/hello',
                        validate: function (input) {
                            return /^.+\/.+$/.test(input);
                        }
                    }, function (answers) {
                        this.template('route.tpl.js', this.getRouteFile(answers.filename));
                        callback(answers.filename);
                    }.bind(this));
                } else {
                    callback(answers.target);
                }
            }.bind(this));
        };

        this.addMethod = function () {

            var method = this.fs.read(this.templatePath('method.tpl.js'));
            var methodData = this.engine(method, {
                methodName: this.name,
                controllerName: this.controllerName,
                method: this.method
            });

            this.fs.copy(
                this.getControllerFile(this.controllerName),
                this.getControllerFile(this.controllerName),
                {
                    process: function (cData) {
                        cData = cData.toString();

                        var tree = esprima.parse(cData, { comment: true, loc: true });
                        var line = tree.body[tree.body.length - 1].loc.start.line;

                        var parts = cData.split('\n');
                        parts.splice(line - 1, 0, methodData);
                        return parts.join('\n');
                    }.bind(this)
                });

        };

        this.addRouteLine = function () {

            var routeLine = this.fs.read(this.templatePath('route-line.tpl.js'));
            var routeLineData = this.engine(routeLine, {
                url: this.url,
                methodName: this.name,
                controllerName: this.controllerName,
                method: this.method
            });

            var controllerImport = this.fs.read(this.templatePath('controller-import.tpl.js'));
            var controllerImportData = this.engine(controllerImport, {
                controllerName: this.controllerName
            });

            this.fs.copy(
                this.getRouteFile(this.routeFile),
                this.getRouteFile(this.routeFile),
                {
                    process: function (rData) {
                        rData = rData.toString();
                        var tree = esprima.parse(rData, { comment: true, loc: true });
                        var set = tree.body.filter(function (item) {
                            return item.type === 'ExpressionStatement' &&
                                (item.expression.left.name === 'exports' ||
                                    (item.expression.left.object.name === 'module' &&
                                item.expression.left.property.name === 'exports'));
                        });
                        if (set[0]) {
                            var line = set[0].expression.right.body.loc.end.line;
                            var parts = rData.split('\n');
                            parts.splice(line - 1, 0, routeLineData);
                            rData = parts.join('\n');
                        }
                        if (rData.indexOf(controllerImportData.substr(4)) === -1) {
                            var parts = rData.split('\n');
                            parts.unshift(controllerImportData);
                            rData = parts.join('\n');
                        }
                        return rData;
                    }
                });
        };


    },
    prompting: function () {
        var done = this.async();
        this.askForRouteFile(function (routeFile) {
            this.routeFile = routeFile;
            this.askForController(function (controllerName) {
                this.controllerName = controllerName;
                var cData = this.fs.read(this.getControllerFile(this.controllerName));
                if (cData.indexOf(this.controllerName + '.' + this.name) === -1) {
                    this.addMethod();
                }
                this.addRouteLine();
                done();
            }.bind(this));
        }.bind(this));
    }
});