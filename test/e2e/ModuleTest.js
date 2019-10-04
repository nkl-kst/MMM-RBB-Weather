const assert = require('assert');
const { setConfig, startApp, stopApp, getBrowser } = require('./MagicMirrorTestEnv');

describe('Module', function() {

    // Retries and timeouts
    this.retries(2);
    this.slow(10000);
    this.timeout(30000);

    // App browser (Electron client)
    let browser;

    before(() => {

        // Set config as environment variable
        setConfig('TestConfig.js');

        // Start Magic Mirror app
        return startApp();
    });

    after(() => {
        return stopApp();
    });

    beforeEach(async () => {

        // Wait for module data
        browser = getBrowser();
        return browser.waitForExist('div.MMM-RBB-Weather div.current');
    });

    it('should display current data', async () => {

        // Act
        const html = await browser.getHTML('div.MMM-RBB-Weather div.current');

        // Assert
        assert(html.includes('<div class="current">'));
    });

    it('should display forecast data', async () => {

        // Act
        const html = await browser.getHTML('div.MMM-RBB-Weather table.weather-table');

        // Assert
        assert(html.includes('<table class="weather-table small">'));
    });
});
