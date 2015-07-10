var generators = require('yeoman-generator'),
    path = require('path');

var NPM_DEV = ['grunt', 'grunt-contrib-jshint', 'grunt-contrib-copy', 'grunt-contrib-clean', 'grunt-npm-inst'],
    NPM = ['optimist', 'restify', 'bunyan', 'es6-promise', 'glob'];

module.exports = generators.Base.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
        this.templates = function (srcArray, data) {
            for (var i in srcArray) {
                this.fs.copyTpl(
                this.templatePath(srcArray[i]),
                this.destinationPath(srcArray[i]), data);
            }
        };
    },
    prompting: function () {
        var done = this.async();
        this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the application',
                default: process.cwd().split(path.sep).pop()
            },
            {
                type: 'confirm',
                name: 'debian_package',
                message: 'Create Grunt task to build a debian package',
                default: true
            }],
        function (answers) {
            this.name = answers.name;
            if (answers.debian_package) {
                NPM_DEV.push('grunt-debian-package');
                this.prompt([{
                    type: 'input',
                    name: 'deb_dest',
                    message: 'Where will be installed the app with the debian package',
                    default: '/etc/' + this.name
                }], function (ans) {
                    this.debian_package = {
                        deb_dest: ans.deb_dest
                    };
                    done();
                }.bind(this));
            } else {
                this.debian_package = false;
                done();
            }
        }.bind(this));
    },
    root: function () {

        this.fs.copyTpl(
            this.templatePath('Gruntfile.js'),
            this.destinationPath('Gruntfile.js'), this);

        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'), this);
    },
    code: function () {
        this.templates([
            'index.js',
            'server.js',
            'bin/www',
            'route/v1/hello.js',
            'config/dev.js',
            'lib/service/Router.js',
            'lib/service/Logger.js',
            'lib/controller/Hello.js'
            ], this);
    },
    npm: function () {
        this.npmInstall(NPM_DEV, { saveDev: true });
        this.npmInstall(NPM, { save: true });
    }
});