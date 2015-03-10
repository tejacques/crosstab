module.exports = function (grunt) {
    var browsers = [{
        browserName: "firefox",
        version: "19",
        platform: "XP"
    }, {
        browserName: "googlechrome",
        platform: "XP"
    }, {
        browserName: "googlechrome",
        platform: "linux"
    }, {
        browserName: "internet explorer",
        platform: "WIN8",
        version: "10"
    }];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/*.js', 'test/**.js'],
            options: {
                laxbreak: true
            }
        },
        watch: {
            scripts: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint']
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: '*',
                    base: '.'
                }
            }
        },
        mocha_phantomjs: {
            test: {
                options: {
                    urls: [
                        'http://localhost:9000/test/mocha_test.html'
                    ]
                }
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: process.env.TRAVIS_JOB_ID,
                    concurrency: 3,
                    browsers: browsers,
                    testname: "mocha tests",
                    tags: ["master"]
                }
            }
        },
    });
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-saucelabs');

    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
    grunt.registerTask('sauce', ['connect', 'saucelabs-mocha']);
};
