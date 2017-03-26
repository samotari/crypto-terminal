'use strict';

module.exports = {
	all: {
		files: [
			{
				nonull: true,
				src: 'index.html',
				dest: 'public/index.html'
			},
			{
				nonull: true,
				src: 'build/all.min.css',
				dest: 'public/css/all.min.css'
			},
			{
				nonull: true,
				src: 'build/all.js',
				dest: 'public/js/all.js'
			},
			{
				nonull: true,
				src: 'build/all.min.js',
				dest: 'public/js/all.min.js'
			},
			{
				expand: true,
				flatten: true,
				cwd: 'node_modules/open-sans-fontface/',
				src: [
					'fonts/**/*.{ttf,eot,svg,woff,woff2}'
				],
				dest: 'public/fonts/OpenSans/'
			},
			{
				expand: true,
				flatten: false,
				cwd: 'images/',
				src: [
					'**/*'
				],
				dest: 'public/images/'
			},
			{
				nonull: true,
				src: 'images/favicon/favicon.ico',
				dest: 'public/favicon.ico'
			}
		]
	}
};
