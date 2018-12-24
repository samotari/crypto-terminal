var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var srcFile = path.join(__dirname, '..', 'index.html');
var destFile = path.join(__dirname, '..', 'www', 'index.html');
var htmlDir = path.join(__dirname, '..', 'html');
var getHtml = function(file) {
	var filePath = path.join(htmlDir, file);
	return fs.readFileSync(filePath);
};
var content = fs.readFileSync(srcFile);
var pkg = require('../package.json');
var data = {
	config: {
		ctApi: {
			baseUrl: 'http://localhost:3600',
		},
	},
	info: _.extend({}, _.pick(pkg,
		'description',
		'version'
	), {
		name: pkg.app.name,
		repoUrl: pkg.repository && pkg.repository.url || '',
	}),
	html: {
		app: { content: getHtml('app.html') },
		favicon: { content: getHtml('favicon.html') },
		templates: (function() {
			var dir = path.join(htmlDir, 'templates');
			var files = fs.readdirSync(dir);
			return _.chain(files).map(function(file) {
				var filePath = path.join(dir, file);
				try {
					var stat = fs.statSync(filePath);
				} catch (error) {
					return null;
				}
				if (!stat.isFile()) return null;
				return {
					key: file.split('.')[0],
					content: fs.readFileSync(filePath).toString(),
				};
			}).compact().value();
		})(),
	},
	target: 'dev',
};
var template = _.template(content.toString());
var output = template(data);
fs.writeFileSync(destFile, output);
