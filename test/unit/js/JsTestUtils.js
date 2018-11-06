const cloneDeep = require('lodash.clonedeep');

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

// Export new module
module.exports.newModule = function() {
    let newModule = cloneDeep(Module.definitions['MMM-RBB-Weather']);
    return newModule;
};
