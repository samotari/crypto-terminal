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
				flatten: false,
				cwd: 'build/workers/',
				src: [
					'*'
				],
				dest: 'www/workers/'
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
	homepage: {
		files: [
			{
				nonull: true,
				src: 'homepage/index.html',
				dest: 'build/homepage/www/index.html'
			},
			{
				nonull: true,
				src: 'build/homepage/all.min.css',
				dest: 'build/homepage/www/css/all.min.css'
			},
			{
				expand: true,
				flatten: true,
				cwd: 'node_modules/open-sans-fontface/',
				src: [
					'fonts/**/*.{ttf,eot,svg,woff,woff2}'
				],
				dest: 'build/homepage/www/fonts/OpenSans/'
			},
			{
				expand: true,
				flatten: false,
				cwd: 'homepage/images/',
				src: [
					'**/*'
				],
				dest: 'build/homepage/www/images/'
			}
		]
	}
};
