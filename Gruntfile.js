/* global module: true */
module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-watch');
    var pkg = grunt.file.readJSON('./package.json');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-mozu-appdev-sync');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('mozu-theme-helpers');
    require('time-grunt')(grunt);
    grunt.initConfig({
        mozuconfig: grunt.file.exists('./mozu.config.json') ? grunt.file.readJSON('./mozu.config.json') : {},
        pkg: pkg,
        copy: {
            packagedeps: {
                files: [{
                        expand: true,
                        cwd: 'node_modules/',
                        src: Object.keys(pkg.dependencies || {}).map(function (dep) {
                            var depPkg;
                            if (pkg.exportsOverride && pkg.exportsOverride[dep]) {
                                return pkg.exportsOverride[dep].map(function (o) {
                                    return dep + '/' + o;
                                });
                            } else {
                                depPkg = require(dep + '/package.json');
                                if (!depPkg.main) {
                                    try {
                                        depPkg = require(dep + '/bower.json');
                                    } catch (e) {
                                    }
                                }
                                return dep + (depPkg.main ? '/' + depPkg.main : '/**/*');
                            }
                        }).concat(['!node_modules/**/*']),
                        dest: 'scripts/vendor/'
                    }]
            }
        },
        jshint: {
            production: {
                src: [
                    'theme.json',
                    'theme-ui.json',
                    'labels/**/*.json',
                    'Gruntfile.js',
                    'scripts/**/*.js'
                ]
            },
            develop: {
                src: '{<%= jshint.production.src %>}',
                options: { devel: true }
            },
            options : {
				//es3: true,
				//browser: true,
				undef : true,
				//nonstandard: true,
				laxcomma : true,
				unused : false,
				ignores : ['scripts/vendor/**/*.js','**/*.gitignore'],
				globals : {
					JSON : true,
					console : true,
					window : true,
					document : true,
					setTimeout : true,
					clearTimeout : true,
					module : true,
					define : true,
					require : true,
					Modernizr : true,
					process : true,
					alert : true,
					setInterval : true,
					clearInterval : true,
					POWERREVIEWS : true,
					Image : true,
					jQuery : true,
					utag_data : true,
					tf : true,
					easyXDM : true,
					navigator : true,
					location : true,
					sessionStorage:true,
					Promise:true

				}
			}
        },
        compress: {
            build: {
                options: {
                    archive: '<%= pkg.name %>-<%= pkg.version %>.zip',
                    pretty: true
                },
                files: [{
                        src: [
                            'admin/**/*',
                            'compiled/**/*',
                            'labels/**/*',
                            'packageconfig.xml',
                            'resources/**/*',
                            'scripts/**/*',
                            'stylesheets/**/*',
                            'templates/**/*',
                            'theme.json',
                            '*thumb.png',
                            '*thumb.jpg',
                            'theme-ui.json',
                            '!**/*.orig',
                            '!.inherited'
                        ],
                        dest: '/'
                    }]
            }
        },
        mozutheme: {
            'check': { 'command': 'check' },
            'compile': { 'command': 'compile' },
            'quickcompile': {
                'command': 'compile',
                'opts': { 'skipminification': true }
            },
			'fullcompile': {
                'command': 'compile',
                'opts': { 'skipminification': false }
            }
        },
        watch: {
            'gruntfile': {
                'files': ['Gruntfile.js'],
                'tasks': ['newer:jshint:develop']
            },
            'json': {
                'files': [
                    'theme.json',
                    'theme-ui.json',
                    'labels/*.json'
                ],
                'tasks': [
                    'newer:jshint:develop',
                    'newer:mozusync:upload'
                ]
            },
            'javascript': {
                'files': ['scripts/**/*.js'],
                'tasks': [
                    'newer:jshint:develop',
                    'mozutheme:quickcompile',
                    'newer:mozusync:upload'
                ]
            },
            'sync': {
                'files': [
                    'admin/**/*',
                    'resources/**/*',
                    'packageconfig.xml',
                    'stylesheets/**/*',
                    'templates/**/*',
                    '*thumb.png',
                    '*thumb.jpg',
                    '!*.orig',
                    '!.inherited'
                ],
                'tasks': ['newer:mozusync:upload']
            }
        },
        mozusync: {
            'options': {
                'applicationKey': '<%= mozuconfig.workingApplicationKey %>',
                'context': '<%= mozuconfig %>'
            },
            'upload': {
                'options': {
                    'action': 'upload',
                    'noclobber': true,
					'soloOnly': false
                },
                'src': [
                    'admin/**/*',
                    'compiled/**/*',
                    'labels/**/*',
                    'resources/**/*',
                    'packageconfig.xml',
                    'scripts/**/*',
                    'stylesheets/**/*',
                    'templates/**/*',
                    'theme.json',
                    '*thumb.png',
                    '*thumb.jpg',
                    'theme-ui.json',
                    '!*.orig',
                    '!.inherited'
                ]
            },
            'del': {
                'options': { 'action': 'delete' },
                'src': '<%= mozusync.upload.src %>',
                'remove': []
            },
            'wipe': {
                'options': { 
					'action': 'deleteAll',
					'soloOnly': false
					},
                'src': '<%= mozusync.upload.src %>'
            }
        }
    });
    grunt.registerTask('build', [
        'jshint:develop',
        'copy',
        'mozutheme:quickcompile'
    ]);
    grunt.registerTask('build-production', [
        'jshint:production',
        'mozutheme:fullcompile',
        'compress'
    ]);
    grunt.registerTask('reset', [
        'mozusync:wipe',
        'mozusync:upload'
    ]);
    grunt.registerTask('default', [
        'build',
        'mozusync:upload',
        'mozutheme:check'
    ]);
};