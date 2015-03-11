module.exports = function (grunt) {
    var browsers = {
        chrome: [
           ['Linux', 'chrome', '40'],
        ],
        firefox: [
           ['Linux', 'firefox', '35'],
        ],
        'ie8': [
           ['Windows XP', 'internet explorer', '8'],
        ],
        'ie9': [
           ['Windows 7', 'internet explorer', '9'],
        ],
        'ie10': [
           ['Windows 7', 'internet explorer', '10'],
        ],
        'ie11': [
           ['Windows 8.1', 'internet explorer', '11'],
        ],
        'ie': [
           ['Windows 8.1', 'internet explorer', '11'],
        ],
        safari: [
           ['OSX 10.10', 'safari', '8']
        ],

        quick: [
           ['Windows 7', 'chrome', '40'],
           ['Windows 7', 'firefox', '35'],
           ['Windows 7', 'internet explorer', '11'],
           ['OSX 10.10', 'safari', '8']
        ],
        ci: [
           // Chrome
           ['Linux', 'chrome', '40'],
           ['OSX 10.10', 'chrome', '40'],
           ['Windows XP', 'chrome', '40'],
           ['Windows 7', 'chrome', '40'],
           ['Windows 8', 'chrome', '40'],
           ['Windows 8.1', 'chrome', '40'],
           // Firefox
           ['Linux', 'firefox', '35'],
           ['OSX 10.10', 'firefox', '35'],
           ['Windows XP', 'firefox', '35'],
           ['Windows 7', 'firefox', '35'],
           ['Windows 8', 'firefox', '35'],
           ['Windows 8.1', 'firefox', '35'],
           // Internet Explorer
           // ['Windows XP', 'internet explorer', '8'], // Off for now
           // ['Windows 7', 'internet explorer', '8'], // Off for now
           ['Windows 7', 'internet explorer', '9'],
           ['Windows 7', 'internet explorer', '10'],
           ['Windows 7', 'internet explorer', '11'],
           ['Windows 8.1', 'internet explorer', '11'],
           // Safari
           ['OSX 10.6', 'safari', '5.1'],
           ['OSX 10.8', 'safari', '6'],
           ['OSX 10.9', 'safari', '7'],
           ['OSX 10.10', 'safari', '8']
        ]
    };

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
            ci: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: process.env.TRAVIS_JOB_ID,
                    concurrency: 3,
                    browsers: browsers.ci,
                    testname: "ci mocha tests",
                    tags: ["master"]
                }
            },
            chrome: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: 'dev-chrome-latest',
                    concurrency: 3,
                    browsers: browsers.chrome,
                    testname: "chrome-latest mocha tests",
                    tags: ["master"]
                }
            },
            ie: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: 'dev-ie-latest',
                    concurrency: 3,
                    browsers: browsers.ie,
                    testname: "ie-latest mocha tests",
                    tags: ["master"]
                }
            },
            firefox: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: 'dev-firefox-latest',
                    concurrency: 3,
                    browsers: browsers.quick,
                    testname: "firefox-latest mocha tests",
                    tags: ["master"]
                }
            },
            safari: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: 'dev-safari-latest',
                    concurrency: 3,
                    browsers: browsers.quick,
                    testname: "safari-latest mocha tests",
                    tags: ["master"]
                }
            },
            quick: {
                options: {
                    urls: ["http://localhost:9000/test/mocha_test.html"],
                    tunnelTimeout: 5,
                    build: 'dev-quick',
                    concurrency: 3,
                    browsers: browsers.quick,
                    testname: "mocha tests",
                    tags: ["master"]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-saucelabs');

    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
    grunt.registerTask('test:ci', ['connect', 'mocha_phantomjs', 'saucelabs-mocha:ci']);
    grunt.registerTask('sauce', ['connect', 'saucelabs-mocha:quick']);
};
