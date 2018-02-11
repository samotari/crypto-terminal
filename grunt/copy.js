'use strict';

module.exports = {
	all: {
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
	}
};
