const path = require('path');
const shell = require('shelljs');

const { Application } = require('spectron');

// Clone and pull Magic Mirror repository
console.log('\nCloning and pulling Magic Mirror repository from Github ...');
shell.cd('..');
shell.exec('git clone https://github.com/MichMich/MagicMirror');
shell.cd('MagicMirror');
shell.exec('git reset --hard && git pull');

// Install dependencies
console.log('\nInstalling Magic Mirror dependencies ...');
shell.exec('npm install');

// Copy module into Magic Mirror repo
console.log('\nCopying module into Magic Mirror repository ...');
shell.rm('-rf', 'modules/MMM-RBB-Weather');
shell.cp('-r', '../MMM-RBB-Weather', 'modules/');

// Initialize Magic Mirror
console.log('Initialize Spectron app ...');
let electronPath = path.resolve('node_modules', '.bin', 'electron');
if (process.platform === 'win32') {
    electronPath += '.cmd';
}

const app = new Application({ path: electronPath, args: ['.'] });

// Functions to handle the app
function setConfig(cfg) {
    process.env.MM_CONFIG_FILE = `modules/MMM-RBB-Weather/test/e2e/${cfg}`;
}

function startApp() {
    return app.start();
}

function stopApp() {
    if (app && app.isRunning()) {
        return app.stop();
    }

    return true;
}

function getBrowser() {
    if (app && app.isRunning()) {
        return app.client;
    }
}

// Export functions
module.exports.setConfig = setConfig;
module.exports.startApp = startApp;
module.exports.stopApp = stopApp;
module.exports.getBrowser = getBrowser;
