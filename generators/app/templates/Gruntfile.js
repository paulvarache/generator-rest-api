
module.exports = function (grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({

        pkg: pkg,

        yeoman: {
            <% if (debian_package) { %> deb: <%- JSON.stringify(debian_package) %> <% } %>
        },

        jshint: {
            build: {
                files: {
                    src: ['**/*.js', '!node_modules/**/*']
                }
            }
        },
        <% if (debian_package) { %>
        copy: {
            build: {
                expand: true,
                src: ['**/*.js', '!node_modules/**/*'],
                dest: '.tmp/'
            },
            post_debian: {
                expand: true,
                flatten: true,
                src: ['<%%= debian_package.build.working_directory %>/**/*'],
                dest: 'build/'
            }
        },
        clean: {
            pre_build: {
                src: ['build/']
            },
            build: {
                src: [
                    '<%%= debian_package.build.working_directory %>',
                    '<%%= copy.build.dest %>']
            }
        },
        debian_package: {
            options: {
                maintainer: {
                    name: 'Ysance (Paul Varache)',
                    email: 'paul.varache@ysance.com'
                },
                prefix: 'dmp-',
                name: '<%%= pkg.name %>'
            },
            build: {
                expand: true,
                cwd: '<%%= copy.build.dest %>',
                src: [
                    '**/*',
                    '!<%%= debian_package.build.working_directory %>/**/*'
                ],
                working_directory: 'tmp',
                dest: '<%%= yeoman.deb.deb_dest %>'
            }
        },
        npm_install: {
            build: {
                cwd: '<%%= copy.build.dest %>'
            }
        }<% } %>
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    <% if (debian_package) { %>
        grunt.loadNpmTasks('grunt-debian-package');
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-npm-inst');
    <% } %>

    grunt.registerTask('default', ['jshint', <% if (debian_package) { %> 'clean:pre_build', 'copy:build', 'npm_install:build', 'debian_package', 'copy:post_debian', 'clean:build' <% } %> ]);
};