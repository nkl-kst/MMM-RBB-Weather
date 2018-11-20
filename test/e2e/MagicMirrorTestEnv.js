const fs = require('fs');
const path = require('path');

const { Application } = require('spectron');

// App and module paths
const MM_APP_PATH = path.join('node_modules', 'magicmirror');
const MM_MODULE_PATH = path.join(MM_APP_PATH, 'modules', 'MMM-RBB-Weather');
const MM_CONFIG_PATH = path.join(MM_APP_PATH, 'config', 'config.js');

// Test config path
const TEST_CONFIG_PATH = path.join('test', 'e2e', 'TestConfig.js');

// Symlink module into MagicMirror app
if (fs.existsSync(MM_MODULE_PATH)) {
    fs.unlinkSync(MM_MODULE_PATH);
};
fs.symlinkSync(path.join(__dirname, '..', '..'), MM_MODULE_PATH, 'dir');

// Copy config path into MagicMirror app
fs.copyFileSync(TEST_CONFIG_PATH, path.join(MM_CONFIG_PATH));

// Initialize Magic Mirror
let electronPath = path.resolve('node_modules', '.bin', 'electron');
if (process.platform === 'win32') {
    electronPath += '.cmd';
}

const app = new Application({ path: electronPath, cwd: MM_APP_PATH, args: ['.'] });

// Functions to handle the app
function startApp() {
    return app.start();
}

function stopApp() {
    if (app && app.isRunning()) {
        return app.stop();
    }
}

function getBrowser() {
    if (app && app.isRunning()) {
        return app.client;
    }
}

module.exports.startApp = startApp;
module.exports.stopApp = stopApp;
module.exports.getBrowser = getBrowser;
