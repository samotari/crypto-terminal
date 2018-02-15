'use strict';

module.exports = {
	app: {
		files: [
			{
				nonull: true,
				src: 'build/index.html',
				dest: 'www/index.html'
			},
			{
				nonull: true,
				src: 'build/all.min.css',
				dest: 'www/css/all.min.css'
			},
			{
				nonull: true,
				src: 'build/all.js',
				dest: 'www/js/all.js'
			},
			{
				nonull: true,
				src: 'build/all.min.js',
				dest: 'www/js/all.min.js'
			},
			{
				expand: true,
				flatten: true,
				cwd: 'node_modules/open-sans-fontface/',
				src: [
					'fonts/**/*.{ttf,eot,svg,woff,woff2}'
				],
				dest: 'www/fonts/OpenSans/'
			},
			{
				expand: true,
				flatten: false,
				cwd: 'images/',
				src: [
					'**/*'
				],
				dest: 'www/images/'
			},
			{
				nonull: true,
				src: 'images/favicon/favicon.ico',
				dest: 'www/favicon.ico'
			}
		]
	},
	test: {
		files: [
			{
				expand: true,
				flatten: true,
				cwd: 'node_modules/chai/',
				src: [
					'chai.js'
				],
				dest: 'test/unit/lib/'
			},
			{
				expand: true,
				flatten: true,
				cwd: 'node_modules/mocha/',
				src: [
					'mocha.js',
					'mocha.css'
				],
				dest: 'test/unit/lib/'
			},
			{
				nonull: true,
				src: 'build/all.js',
				dest: 'test/unit/lib/'
			},
			{
				nonull: true,
				src: 'build/all.min.css',
				dest: 'test/unit/app/css/all.min.css'
			},
			{
				expand: true,
				flatten: true,
				cwd: 'node_modules/open-sans-fontface/',
				src: [
					'fonts/**/*.{ttf,eot,svg,woff,woff2}'
				],
				dest: 'test/unit/app/fonts/OpenSans/'
			},
			{
				expand: true,
				flatten: false,
				cwd: 'images/',
				src: [
					'**/*'
				],
				dest: 'test/unit/app/images/'
			},
			{
				nonull: true,
				src: 'images/favicon/favicon.ico',
				dest: 'test/unit/app/favicon.ico'
			}
		]
	}
};
