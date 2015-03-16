module.exports = function (grunt) {
    var fs = require('fs');
    var envPath = './.env.js';
    if (fs.existsSync(envPath)) {
        console.log("Adding environment variables");
        require(envPath);
    }
    var browsers = require('./test/browsers');
    var reporter = require('saucelabs-mocha-reporter');

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

    var addTag = function(envVar) {
        var ev = process.env[envVar];
        if (ev && ev.length > 0) {
            if (ev === 'false' || ev === 'true') {
                if (ev === 'true') {
                    tags.push(envVar);
                }
            } else {
                tags.push(ev);
            }
        }
    };

    var onTestComplete;
    for (var browser in browsers) {
        var taskBrowsers = browsers[browser];
        var tags = [];
        ['TRAVIS', 'TRAVIS_PULL_REQUEST', 'TRAVIS_BRANCH'].forEach(addTag);
        gruntConfig['saucelabs-mocha'][browser] = {
            options: {
                urls: ["http://127.0.0.1:9000/test/mocha_test.html"],
                tunnelTimeout: 5,
                build: process.env.TRAVIS_JOB_ID,
                tags: tags,
                concurrency: 3,
                browsers: taskBrowsers,
                testname: browser + ' mocha tests',
                'pollInterval': 1000,
                'max-duration': 60
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
    grunt.registerTask('test', 'Run tests', function (type, testType, multiple) {
        if(!type) {
            grunt.task.run(['connect', 'mocha_phantomjs']);
        } else if (browsers[type]) {
            var useTests = JSON.parse(testType || null);
            gruntConfig['saucelabs-mocha'][type].options.onTestComplete = reporter.create(useTests);
            if (type === 'ci') {
                gruntConfig['saucelabs-mocha'][type].options.statusCheckAttempts = 600;
                gruntConfig['saucelabs-mocha'][type].options['max-duration'] = 600;
                grunt.task.run(['connect', 'mocha_phantomjs', 'saucelabs-mocha:' + type]);
            } else {
                multiple = parseInt(multiple);
                if (multiple > 0) {
                    var browserList = [];
                    var configOptions = gruntConfig['saucelabs-mocha'][type].options;
                    for(var i = 0; i < multiple; i++) {
                        browserList.push.apply(browserList, configOptions.browsers);
                    }
                    configOptions.browsers = browserList;
                }
                grunt.task.run(['connect', 'saucelabs-mocha:' + type]);
            }
        } else {
            // Error!
            console.log("Couldn't find: " + type + " in browser config. Running phantomjs instead");
            grunt.task.run(['connect', 'mocha_phantomjs']);
        }
    });
};
