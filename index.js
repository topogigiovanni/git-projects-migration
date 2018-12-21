const parse = require('parse-git-config');
const {
	lstatSync,
	readdirSync,
	writeFile,
	readFile
} = require('fs');
const {
	join
} = require('path');
const execa = require('execa');
const gitCloneRepo = require('git-clone-repo');
const noop = (() => null);
const MAIN_GPM_FILE = 'gpm-projects.json';

let projects = [];

function buildProjects() {
	const isDirectory = source => lstatSync(source).isDirectory();
	const getDirectories = source =>
		readdirSync(source).map(name => join(source, name)).filter(isDirectory);

	const directories = getDirectories(process.cwd()) || [];

	directories.forEach(d => {
		let c = null

		try {
			c = parse.sync({
				path: `${d}/.git/config`
			});
		} catch (e) {}

		handleConfigResult(c, d);
	});

	console.log('projects', projects);
}

function handleConfigResult(config, dir) {
	if (!config || typeof config !== 'object' || !Object.keys(config).length) {
		return;
	}
	const dirs = (dir || '').split('\\');
	const dirName = dirs.slice(-1).pop();
	const repoUrl = config['remote "origin"'].url || null;

	if (!repoUrl) {
		return;
	}

	projects.push({
		dirName,
		repoUrl
	});
}

function cloneRepo(repoUrl, dest) {
	try {
		execa.shellSync(`git clone ${repoUrl} ${dest}`);

		return true;
	} catch (error) {
		console.log(error);
		return error;
	}
}

function createGitProject(projectConfig) {
	if (!projectConfig) {
		return;
	}

	console.log(`Cloning ${projectConfig.dirName}...`);
	const cloneResponse = cloneRepo(projectConfig.repoUrl, projectConfig.dirName);

	if (cloneResponse === true) {
		console.log(`Repository ${projectConfig.dirName} cloned!`);
		return;
	}

	// error
	console.log(cloneResponse);
}

function writeProjectsFile(cb) {
	cb = cb || noop;
	writeFile(MAIN_GPM_FILE, JSON.stringify(projects), err => {
		if (err) {
			return console.log(err);
		}

		console.log(`\nThe file ${MAIN_GPM_FILE} was created!\n============`);
		cb();
	});
}

function tryReadFile(cb) {
	cb = cb || noop;
	readFile(MAIN_GPM_FILE, 'utf8', (err, content) => {
		if (err) {
			return err;
		}

		const file = JSON.parse(content) || [];
		// console.log(content, file);
		cb(file);
	});
}

// Public methods
exports.exportProjects = function() {
	buildProjects();
	writeProjectsFile();
};

exports.importProjects = function() {
	tryReadFile(file => {
		file.map(f => createGitProject(f));
	});
};