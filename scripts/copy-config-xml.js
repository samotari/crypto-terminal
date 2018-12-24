var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');
var srcFile = path.join(__dirname, '..', 'config-template.xml');
var destFile = path.join(__dirname, '..', 'config.xml');
var content = fs.readFileSync(srcFile);
var template = Handlebars.compile(content.toString());
var pkg = require('../package.json');
var data = {
	id: pkg.app.id,
	description: pkg.description,
	name: pkg.app.name,
	shortName: pkg.app.shortName,
	version: pkg.version,
};
var output = template(data);
fs.writeFileSync(destFile, output);
