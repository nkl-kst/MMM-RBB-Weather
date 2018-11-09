const assert = require('assert');
const sinon = require('sinon');

const newModule = require('./ModuleTestEnv').newModule;

describe('MMM-RBB-Weather', () => {

    // Tested
    let module;

    beforeEach(() => {

        module = newModule();

        // Fake MagicMirror Version
        version = '2.6.0';
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getScripts', () => {

        it('should return an array', () => {

            // Act
            let scripts = module.getScripts();

            // Assert
            assert.ok(Array.isArray(scripts));
        });
    });

    describe('getStyles', () => {

        it('should return an array', () => {

            // Act
            let styles = module.getStyles();

            // Assert
            assert.ok(Array.isArray(styles));
        });
    });

    describe('getTranslations', () => {

        it('should return an object', () => {

            // Act
            let translations = module.getTranslations();

            // Assert
            assert.deepStrictEqual(translations, Object(translations));
        });
    });

    describe('start', () => {

        it('should set moment locale', () => {

            // Act
            module.start();

            // Assert
            assert.deepStrictEqual(moment.locale(), module.config.language);
        });
    });

    describe('notificationReceived', () => {

        it('should load data when module dom is created', () => {

            // Arrange
            module.loadData = sinon.fake();

            // Act
            module.notificationReceived('MODULE_DOM_CREATED');

            // Assert
            assert.ok(module.loadData.calledOnce);
        });

        it('should do nothing when notification is unknown', () => {

            // Arrange
            module.loadData = sinon.fake();

            // Act
            module.notificationReceived('UNKNOWN_NOTIFICATION');

            // Assert
            assert.ok(module.loadData.notCalled);
        });
    });

    describe('socketNotificationReceived', () => {

        it('should set weather data and update dom when data was loaded', () => {

            // Arrange
            module.updateDom = sinon.fake();

            // Act
            module.socketNotificationReceived('DATA_LOADED', { test: 'data' });

            // Assert
            assert.deepStrictEqual(module.weatherData, { test: 'data' });
            assert.ok(module.updateDom.calledOnce);
        });

        it('should to nothing when notification is unknown', () => {

            // Arrange
            module.updateDom = sinon.fake();

            // Act
            module.socketNotificationReceived('UNKNOWN_NOTIFICATION');

            // Assert
            assert.ok(module.updateDom.notCalled);
        });
    });

    describe('getTemplate', () => {

        it('should return "nodata" template if weather data is not loaded', () => {

            // Act
            let tpl = module.getTemplate();

            // Assert
            assert.strictEqual(tpl, 'templates/nodata.njk');
        });

        it('should return "nodata" template if weather data is empty', () => {

            // Act
            module.weatherData = [];

            // Act
            let tpl = module.getTemplate();

            // Assert
            assert.strictEqual(tpl, 'templates/nodata.njk');
        });

        it('should return "module" template if weather data is set', () => {

            // Act
            module.weatherData = { data: true };

            // Act
            let tpl = module.getTemplate();

            // Assert
            assert.strictEqual(tpl, 'templates/module.njk');
        });
    });

    describe('getTemplateData', () => {

        it('should return current module instance', () => {

            // Act
            let data = module.getTemplateData();

            // Assert
            assert.deepStrictEqual(data.module, module);
        });
    });

    describe('getForecastDayText', () => {

        it('should return formatted day text', () => {

            // Arrange
            let timeMock = moment('2018-09-02 10:00');
            moment = sinon.fake.returns(timeMock);

            // Act
            let day = module.getForecastDayText(1);

            // Assert
            assert.strictEqual(day, 'So.');
        });
    });

    describe('getIconUrl', () => {

        it('should return animated icon URL if animation is set', () => {

            // Act
            let url = module.getIconUrl(true, '110000');

            // Assert
            assert.strictEqual(url, 'parent/folder/vendor/amcharts/animated/cloudy-day-1.svg');
        });

        it('should return static icon URL if animation is not set', () => {

            // Act
            let url = module.getIconUrl(false, '110000');

            // Assert
            assert.strictEqual(url, 'parent/folder/vendor/amcharts/static/cloudy-day-1.svg');
        });
    });

    describe('getTempIcon', () => {

        it('should return "fa-umbrella-beach" icon if temperature is equal 40', () => {

            // Act
            let icon = module.getTempIcon(40);

            // Assert
            assert.deepStrictEqual(icon, 'fa-umbrella-beach');
        });

        it('should return "fa-thermometer-full" icon if temperature is equal 32', () => {

            // Act
            let icon = module.getTempIcon(32);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-full');
        });

        it('should return "fa-thermometer-three-quarters" icon if temperature is equal 24', () => {

            // Act
            let icon = module.getTempIcon(24);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-three-quarters');
        });

        it('should return "fa-thermometer-half" icon if temperature is equal 16', () => {

            // Act
            let icon = module.getTempIcon(16);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-half');
        });

        it('should return "fa-thermometer-quarter" icon if temperature is equal 8', () => {

            // Act
            let icon = module.getTempIcon(8);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-quarter');
        });

        it('should return "fa-thermometer-empty" icon if temperature is equal 0', () => {

            // Act
            let icon = module.getTempIcon(0);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-empty');
        });

        it('should return "fa-snowflake" icon if temperature is lower than 0', () => {

            // Act
            let icon = module.getTempIcon(-1);

            // Assert
            assert.deepStrictEqual(icon, 'fa-snowflake');
        });

        it('should return "fa-asterisk" icon if temperature is lower than 0 and version is lower or equal 2.5.0', () => {

            // Arrange
            version = '2.5.0';

            // Act
            let icon = module.getTempIcon(-1);

            // Assert
            assert.deepStrictEqual(icon, 'fa-asterisk');
        });
    });

    describe('getRainProbabilityIcon', () => {

        it('should return "fa-tint" icon if probability is between low and high', () => {

            // Act
            let icon = module.getRainProbabilityIcon(50);

            // Assert
            assert.deepStrictEqual(icon, 'fa-tint');
        });

        it('should return "fa-tint-slash" icon if probability is under or equal low', () => {

            // Act
            let icon = module.getRainProbabilityIcon(15);

            // Assert
            assert.deepStrictEqual(icon, 'fa-tint-slash');
        });

        it('should return "fa-tint dimmed" icon if probability is under or equal low and version is lower or equal 2.5.0', () => {

            // Arrange
            version = '2.5.0';

            // Act
            let icon = module.getRainProbabilityIcon(15);

            // Assert
            assert.deepStrictEqual(icon, 'fa-tint dimmed');
        });

        it('should return "fa-umbrella" icon if probability is greater or equal high', () => {

            // Act
            let icon = module.getRainProbabilityIcon(75);

            // Assert
            assert.deepStrictEqual(icon, 'fa-umbrella');
        });
    });

    describe('getWindDirKey', () => {

        it('should return "N" if direction degree is equal 22', () => {

            // Act
            let text = module.getWindDirKey(22);

            // Assert
            assert.deepStrictEqual(text, 'N');
        });

        it('should return "NE" if direction degree is equal 67', () => {

            // Act
            let text = module.getWindDirKey(67);

            // Assert
            assert.deepStrictEqual(text, 'NE');
        });

        it('should return "E" if direction degree is equal 112', () => {

            // Act
            let text = module.getWindDirKey(112);

            // Assert
            assert.deepStrictEqual(text, 'E');
        });

        it('should return "SE" if direction degree is equal 157', () => {

            // Act
            let text = module.getWindDirKey(157);

            // Assert
            assert.deepStrictEqual(text, 'SE');
        });

        it('should return "S" if direction degree is equal 202', () => {

            // Act
            let text = module.getWindDirKey(202);

            // Assert
            assert.deepStrictEqual(text, 'S');
        });

        it('should return "SW" if direction degree is equal 247', () => {

            // Act
            let text = module.getWindDirKey(247);

            // Assert
            assert.deepStrictEqual(text, 'SW');
        });

        it('should return "W" if direction degree is equal 292', () => {

            // Act
            let text = module.getWindDirKey(292);

            // Assert
            assert.deepStrictEqual(text, 'W');
        });

        it('should return "NW" if direction degree is equal 337', () => {

            // Act
            let text = module.getWindDirKey(337);

            // Assert
            assert.deepStrictEqual(text, 'NW');
        });

        it('should return "N" if direction degree is greater than 337', () => {

            // Act
            let text = module.getWindDirKey(338);

            // Assert
            assert.deepStrictEqual(text, 'N');
        });
    });

    describe('loadData', () => {

        it('should send socket notification', () => {

            // Arrange
            module.sendSocketNotification = sinon.spy();
            module.scheduleRefresh = sinon.fake();

            // Act
            module.loadData();

            // Assert
            let options = { id: module.config.id, days: module.config.days };
            assert.ok(module.sendSocketNotification.calledWith('LOAD_DATA', options));
        });

        it('should schedule next refresh', () => {

            // Arrange
            module.sendSocketNotification = sinon.spy();
            module.scheduleRefresh = sinon.fake();

            // Act
            module.loadData();

            // Assert
            assert.ok(module.scheduleRefresh.calledWith);
        });
    });

    describe('scheduleRefresh', () => {

        // Fake timer
        let clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
        });

        afterEach(() => {
            clock.restore();
        });

        it('should not load data before given update interval is reached', () => {

            // Arrange
            module.config.updateInterval = 1;
            module.loadData = sinon.fake();

            // Act
            module.scheduleRefresh();

            clock.tick(999);

            // Assert
            assert.ok(module.loadData.notCalled);
        });

        it('should load data after given update interval is reached', () => {

            // Arrange
            module.config.updateInterval = 1;
            module.loadData = sinon.fake();

            // Act
            module.scheduleRefresh();

            clock.tick(1000);

            // Assert
            assert.ok(module.loadData.calledOnce);
        });
    });
});
