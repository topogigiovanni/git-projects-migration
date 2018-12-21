#!/usr/bin/env node

/*
	ref: https://bretkikehara.wordpress.com/2013/05/02/nodejs-creating-your-first-global-module/
*/
const commandLineArgs = require('command-line-args');
const gpm = require('../lib/index.js');

/* first - parse the main command */
const mainDefinitions = [{
	name: 'command',
	defaultOption: true
}];

const mainOptions = commandLineArgs(mainDefinitions, {
	stopAtFirstUnknown: true
});
const argv = mainOptions._unknown || [];

// console.log('mainOptions\n===========');
// console.log(mainOptions);

/*
	second - parse the merge command options
	ref: https://github.com/75lb/command-line-args/wiki/Implement-command-parsing-(git-style)
*/
if (mainOptions.command === 'export') {
	gpm.exportProjects();

	return;
}

if (mainOptions.command === 'import') {
	gpm.importProjects();

	return;
}

console.log('Command not found, try use "import" or "export"');