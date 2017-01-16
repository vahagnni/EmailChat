module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            develop_js: {
                src: [
                    'front/js/*.js'
                ],
                dest: 'public/js/locdel.js'
            },
            develop_css: {
                src: [
                    'front/css/*.css'
                ],
                dest: 'public/css/front.css'
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            develop: {
                files: {
                    'public/js/locdel.min.js': ['public/js/locdel.js']
                }
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    '/www/locdel/js/locdel.js': ['build/locdel.js']
                }
            },
            develop: {
                files: {
                    'public/js/locdel.js': ['public/js/locdel.js']
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: './node_modules/angular',
                        src: 'angular.min.js',
                        dest: '/www/locdel/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/bootstrap/dist/css',
                        src: 'bootstrap.min.css',
                        dest: '/www/locdel/css/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-ui-bootstrap',
                        src: 'ui-bootstrap.min.js',
                        dest: '/www/locdel/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-ui-bootstrap',
                        src: 'ui-bootstrap-tpls.min.js',
                        dest: '/www/locdel/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-data-table/release',
                        src: 'dataTable.min.js',
                        dest: '/www/locdel/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/moment/min',
                        src: 'moment.min.js',
                        dest: '/www/locdel/js/'
                    },
                    {
                        expand: true,
                        cwd: './site/img/',
                        src: ['**/*'],
                        dest: '/www/locdel/images/'
                    },
                    {
                        expand: true,
                        cwd: './site/fonts/',
                        src: ['**/*'],
                        dest: '/www/locdel/fonts/'
                    }
                ]
            },
            develop: {
                files: [
                    {
                        expand: true,
                        cwd: './node_modules/angular',
                        src: 'angular.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/bootstrap/dist/css',
                        src: 'bootstrap.min.css',
                        dest: 'public/css/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-ui-bootstrap',
                        src: 'ui-bootstrap.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-ui-bootstrap',
                        src: 'ui-bootstrap-tpls.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/jsonformatter/dist',
                        src: 'json-formatter.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/moment/min',
                        src: 'moment.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/ob-daterangepicker/dist/scripts/min/',
                        src: 'ob-daterangepicker.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/ob-daterangepicker/dist/styles/',
                        src: 'ob-daterangepicker.css',
                        dest: 'public/css/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/jsonformatter/dist',
                        src: 'json-formatter.css',
                        dest: 'public/css'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-data-table/release',
                        src: 'dataTable.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-bootstrap-lightbox/dist',
                        src: 'angular-bootstrap-lightbox.min.js',
                        dest: 'public/js/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-bootstrap-lightbox/dist',
                        src: 'angular-bootstrap-lightbox.min.css',
                        dest: 'public/css/'
                    },
                    {
                        expand: true,
                        cwd: './node_modules/angular-data-table/release',
                        src: ['*.css'],
                        dest: 'public/css/'
                    },
                    {
                        expand: true,
                        cwd: './assets/images/',
                        src: ['**/*.{png,jpg,svg}'],
                        dest: 'public/images/'
                    },
                    {
                        expand: true,
                        cwd: './assets/css/',
                        src: ['**/*.css'],
                        dest: 'public/css/'
                    },
                    {
                        expand: true,
                        cwd: './assets/fonts/',
                        src: ['**/*'],
                        dest: 'public/fonts/'
                    },
                    {
                        expand: true,
                        cwd: './assets/templates/',
                        src: ['**/*.html'],
                        dest: 'public/templates/'
                    },
                    {
                        expand: true,
                        cwd: './front/',
                        src: ['**/*.html'],
                        dest: 'public/templates/'
                    }
                ]
            }
        },
        watch: {
            scripts: {
                files: ['front/**/*', 'assets/**/*'],
                tasks: ['concat:develop_js', 'concat:develop_css', 'copy:develop'],
                options: {
                    spawn: false
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-babel');

    grunt.registerTask('default', ['concat:dist_js', 'concat:dist_css', 'babel:dist', 'copy:main']);
    grunt.registerTask('develop', ['concat:develop_js', 'concat:develop_css', 'copy:develop', 'watch']);

};