var inquirer = require('inquirer');
var fs = require('fs');

function tempFileCreator(answers, done) {
	var myData = {
		android: {
			release: {
				keystore: answers.keystore,
				storePassword: answers.password,
				alias: answers.alias,
				password : answers.password,
				keystoreType: answers.keystoreType
			}
		}
	};

	var dataText =  JSON.stringify(myData);
	var filePath = 'build.json';

	fs.writeFile(filePath, dataText, function(error) {
		if (error) {
			throw error;
		};

		done(null, filePath);
	});
}

var questions = [
	{
		type: 'input',
		name: 'keystore',
		message: 'Insert a keystore path: ',
		default: './android.keystore'
	},
	{
		type: 'input',
		name: 'alias',
		message: 'Insert a alias: ',
		default: 'cryptoTerminalKey'
	},
	{
		type: 'input',
		name: 'keystoreType',
		message: 'Insert keystoreType: ',
		default: ''
	},
	{
		type: 'password',
		name: 'storePassword',
		message: 'Insert storePassword: '
	},
	{
		type: 'password',
		name: 'password',
		message: 'Insert a password: '
	}
]

inquirer.prompt(questions).then(function (answers) {
	var spawn = require('child_process').spawn;

	// Create a temp file for the cordova command.
	// https://issues.apache.org/jira/browse/CB-13684
	tempFileCreator(answers, function(error, path) {

		if (error) {
			throw error;
		};

		const buildSign = spawn('cordova', ['build', 'android', '--release', '--buildConfig', path, '--', '--password', answers.password])

		buildSign.stdout.on('data', function(data) {
			console.log('stdout:' + data);
		});

		buildSign.stdout.on('close', function(data) {

			if (error) {
				throw error;
			};

			// Delete temp file created.
			fs.unlink(path, function(error) {
				if (error) {
					throw error;
				};
				console.log('ALL THE PROCESS HAS FINISHED CORRECTLY.')
			})
		});
	});
})