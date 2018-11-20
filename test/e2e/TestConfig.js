/**
 * This is a simple Magic Mirror config used in e2e tests.
 */
var config = {

    electronOptions: {
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true
        }
    },

    modules: [{
        module: 'MMM-RBB-Weather',
        position: 'top_left'
    }]
};

if (typeof module !== 'undefined') {
    module.exports = config;
}
