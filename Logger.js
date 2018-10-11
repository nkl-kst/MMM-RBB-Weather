/* Magic Mirror
 * Module: MMM-RBB-Weather
 *
 * By Nikolai Keist (github.com/nkl-kst)
 * MIT Licensed.
 */

module.exports = {

    _printLog(level, message) {
        let now = new Date();
        console[level](`MMM-RBB-Weather[${now.toLocaleString()}]: ${message}`);
    },

    debug: function(message) {
        this._printLog('debug', message);
    },

    log: function(message) {
        this._printLog('log', message);
    },

    info: function(message) {
        this._printLog('info', message);
    },

    warn: function(message) {
        this._printLog('warn', message);
    },

    error: function(message) {
        this._printLog('error', message);
    },
};
