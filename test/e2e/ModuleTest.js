const assert = require('assert');
const { startApp, stopApp, getBrowser } = require('./MagicMirrorTestEnv');

describe('Module', function() {

    // Retries and timeouts
    this.retries(2);
    this.slow(15000);
    this.timeout(60000);

    // App browser (Electron client)
    let browser;

    before(async () => {

        // Start Magic Mirror app
        await startApp();

        // Wait for module data
        browser = getBrowser();
        return browser.waitForExist('div.MMM-RBB-Weather div.current');
    });

    after(() => {
        return stopApp();
    });

    it('should display current data', async () => {

        // Act
        let html = await browser.getHTML('div.MMM-RBB-Weather div.current');

        // Assert
        assert(html.includes('<div class="current">'));
    });

    it('should display forecast data', async () => {

        // Act
        let html = await browser.getHTML('div.MMM-RBB-Weather table.weather-table');

        // Assert
        assert(html.includes('<table class="weather-table small">'));
    });
});
