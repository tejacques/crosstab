module.exports = function (grunt) {
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
        }
    });
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');

    grunt.registerTask('default', ['connect', 'watch']);
    grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
};
