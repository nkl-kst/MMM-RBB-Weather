/* eslint no-global-assign: "off" */

const cloneDeep = require('lodash.clonedeep');
const JSDom = require('jsdom').JSDOM;
const Sinon = require('sinon');

// Mock module registration
Module = {};
Module.definitions = {};
Module.register = function(name, moduleDefinition) {

    moduleDefinition.config = moduleDefinition.defaults;
    moduleDefinition.config.language = 'de';
    moduleDefinition.config.updateInterval = 0;

    Module.definitions[name] = moduleDefinition;
};

// Mock logging
Log = {};
Log.info = function() {};

// Make momentjs functions available
moment = require('moment');

// Register module
require('../../../MMM-RBB-Weather');

// Export new module with function mocks/fakes
module.exports.newModule = function() {
    let newModule = cloneDeep(Module.definitions['MMM-RBB-Weather']);

    // Fake file method
    newModule.file = Sinon.fake((path) => {
        return `parent/folder/${path}`;
    });

    // Fake DOM
    document = new JSDom(`<!DOCTYPE html>`).window.document;

    return newModule;
};
