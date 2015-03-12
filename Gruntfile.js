module.exports = function (grunt) {
    var fs = require('fs');
    if (fs.existsSync('./env.js')) {
        require("./.env.js");
    }
    var browsers = require('./test/browsers');
    var onTestComplete = require('saucelabs-mocha-reporter');

    var gruntConfig = {
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
            // Settings programatically added below
        }
    };

    for (var browser in browsers) {
        var taskBrowsers = browsers[browser];
        gruntConfig['saucelabs-mocha'][browser] = {
            options: {
                urls: ["http://127.0.0.1:9000/test/mocha_test.html"],
                tunnelTimeout: 5,
                build: process.env.TRAVIS_JOB_ID,
                tags: [process.env.TRAVIS_PULL_REQUEST || process.env.TRAVIS_BRANCH],
                concurrency: 3,
                browsers: taskBrowsers,
                testname: browser + ' mocha tests',
                'pollInterval': 1000,
                'max-duration': 60,
                onTestComplete: onTestComplete
            }
        };
    }
    grunt.initConfig(gruntConfig);
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-saucelabs');

    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('test', 'Run tests', function(type) {
        if(!type) {
            grunt.task.run(['connect', 'mocha_phantomjs']);
        } else if (type === 'ci') {
            grunt.task.run(['connect', 'mocha_phantomjs', 'saucelabs-mocha:' + type]);
        } else if (browsers[type]) {
            grunt.task.run(['connect', 'saucelabs-mocha:' + type]);
        } else {
            // Error!
            console.log("Couldn't find: " + type + " in browser config. Running phantomjs instead");
            grunt.task.run(['connect', 'mocha_phantomjs']);
        }
    });
    //grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
    //grunt.registerTask('test:ci', ['connect', 'mocha_phantomjs', 'saucelabs-mocha:ci']);
    //grunt.registerTask('sauce', ['connect', 'saucelabs-mocha:quick']);
};
