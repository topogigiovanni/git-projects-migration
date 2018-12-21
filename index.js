const parse = require('parse-git-config');
const {
	lstatSync,
	readdirSync,
	writeFile
} = require('fs');
const {
	join
} = require('path');

// console.log('process.cwd()', process.cwd());

// (async () => {
// 	debugger;
// 	console.log(await parse());
// 	console.log(await parse({
// 		// cwd: 'D:/Projects/dcg.chronos'
// 		path: '../dcg.chronos/.git/config'
// 	}));
// })()

let projects = [];

function buildProjects() {

	const isDirectory = source => lstatSync(source).isDirectory();
	const getDirectories = source =>
		readdirSync(source).map(name => join(source, name)).filter(isDirectory);

	const directories = getDirectories(process.cwd()) || [];
	console.log('directories', getDirectories(process.cwd()));

	directories.forEach(d => {
		console.log('d', d);
		let c = null

		try {
			c = parse.sync({
				path: d + '/.git/config'
			});
		} catch (e) {

		}

		handleConfigResult(c, d);
		console.log('c', c);
	});

	console.log('projects', projects);
}

function handleConfigResult(config, dir) {
	if (!config || typeof config !== 'object' || !Object.keys(config).length) {
		return;
	}
	const dirs = (dir || '').split('\\');
	const dirName = dirs.slice(-1).pop();

	projects.push({
		dirName,
		repoUrl: config['remote "origin"'].url || null
	});
};

function writeProjectsFile() {
	writeFile('gpm-projects.json', JSON.stringify(projects), function(err) {
		if (err) {
			return console.log(err);
		}

		console.log('The file was saved!');
	});
}

function init() {
	buildProjects();
	writeProjectsFile();
}

init();