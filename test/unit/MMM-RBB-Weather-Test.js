const assert = require('assert');
const sinon = require('sinon');

const { newModule } = require('./ModuleTestEnv');

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
            const scripts = module.getScripts();

            // Assert
            assert.ok(Array.isArray(scripts));
        });
    });

    describe('getStyles', () => {

        it('should return an array', () => {

            // Act
            const styles = module.getStyles();

            // Assert
            assert.ok(Array.isArray(styles));
        });
    });

    describe('getTranslations', () => {

        it('should return an object', () => {

            // Act
            const translations = module.getTranslations();

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
            module.triggerModules = sinon.fake();

            // Act
            module.socketNotificationReceived('DATA_LOADED', { data: 'data', time: 1552681264508 });

            // Assert
            assert.deepStrictEqual(module.weatherData, 'data');
            assert.deepStrictEqual(module.updatedAt, 1552681264508);

            assert.ok(module.updateDom.calledOnce);
            assert.ok(module.triggerModules.calledOnce);
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
            const tpl = module.getTemplate();

            // Assert
            assert.strictEqual(tpl, 'templates/nodata.njk');
        });

        it('should return "nodata" template if weather data is empty', () => {

            // Act
            module.weatherData = [];

            // Act
            const tpl = module.getTemplate();

            // Assert
            assert.strictEqual(tpl, 'templates/nodata.njk');
        });

        it('should return "module" template if weather data is set', () => {

            // Act
            module.weatherData = { data: true };

            // Act
            const tpl = module.getTemplate();

            // Assert
            assert.strictEqual(tpl, 'templates/module.njk');
        });
    });

    describe('getTemplateData', () => {

        it('should return current module instance', () => {

            // Act
            const data = module.getTemplateData();

            // Assert
            assert.deepStrictEqual(data.module, module);
        });
    });

    describe('getCurrentText', () => {

        it('should return a splitted text', () => {

            // Arrange
            module.config.splitCurrentTextGreater = 10;

            // Act
            const text = module.getCurrentText('should, split');

            // Assert
            assert.strictEqual(text, 'should<br/>split');
        });

        it('should return nothing if text is undefined', () => {

            // Act
            const text = module.getCurrentText(undefined);

            // Assert
            assert.strictEqual(text, undefined);
        });

        it('should return same text if splitting is disabled', () => {

            // Arrange
            module.config.splitCurrentTextGreater = 0;

            // Act
            const text = module.getCurrentText('not splitted text');

            // Assert
            assert.strictEqual(text, 'not splitted text');
        });

        it('should return same text if text is too small', () => {

            // Arrange
            module.config.splitCurrentTextGreater = 10;

            // Act
            const text = module.getCurrentText('too, small');

            // Assert
            assert.strictEqual(text, 'too, small');
        });
    });

    describe('getForecastDayText', () => {

        it('should return formatted day text', () => {

            // Arrange
            const timeMock = moment('2018-09-02 10:00');
            moment = sinon.fake.returns(timeMock);

            // Act
            const day = module.getForecastDayText(1);

            // Assert
            assert.strictEqual(day, 'So.');
        });
    });

    describe('getIconUrl', () => {

        it('should return animated icon URL if animation is set', () => {

            // Act
            const url = module.getIconUrl(true, '110000');

            // Assert
            assert.strictEqual(url, 'parent/folder/vendor/amcharts/animated/cloudy-day-1.svg');
        });

        it('should return static icon URL if animation is not set', () => {

            // Act
            const url = module.getIconUrl(false, '110000');

            // Assert
            assert.strictEqual(url, 'parent/folder/vendor/amcharts/static/cloudy-day-1.svg');
        });

        it('should return RBB URL fallback if no mapping is found', () => {

            // Act
            const url = module.getIconUrl(true, 'no_mapping');

            // Assert
            assert.strictEqual(url, 'https://www.rbb24.de/basis/grafik/icons/wetter/svg/no_mapping.svg');
        });
    });

    describe('getTempIcon', () => {

        it('should return "fa-umbrella-beach" icon if temperature is equal 35', () => {

            // Act
            const icon = module.getTempIcon(35);

            // Assert
            assert.deepStrictEqual(icon, 'fa-umbrella-beach');
        });

        it('should return "fa-thermometer-full" icon if temperature is equal 28', () => {

            // Act
            const icon = module.getTempIcon(28);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-full');
        });

        it('should return "fa-thermometer-three-quarters" icon if temperature is equal 21', () => {

            // Act
            const icon = module.getTempIcon(21);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-three-quarters');
        });

        it('should return "fa-thermometer-half" icon if temperature is equal 14', () => {

            // Act
            const icon = module.getTempIcon(14);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-half');
        });

        it('should return "fa-thermometer-quarter" icon if temperature is equal 7', () => {

            // Act
            const icon = module.getTempIcon(7);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-quarter');
        });

        it('should return "fa-thermometer-empty" icon if temperature is equal 0', () => {

            // Act
            const icon = module.getTempIcon(0);

            // Assert
            assert.deepStrictEqual(icon, 'fa-thermometer-empty');
        });

        it('should return "fa-snowflake" icon if temperature is lower than 0', () => {

            // Act
            const icon = module.getTempIcon(-1);

            // Assert
            assert.deepStrictEqual(icon, 'fa-snowflake');
        });

        it('should return "fa-asterisk" icon if temperature is lower than 0 and version is lower than 2.6.0', () => {

            // Arrange
            version = '2.5.99';

            // Act
            const icon = module.getTempIcon(-1);

            // Assert
            assert.deepStrictEqual(icon, 'fa-asterisk');
        });
    });

    describe('getRainProbabilityIcon', () => {

        it('should return "fa-tint" icon if probability is between low and high', () => {

            // Act
            const icon = module.getRainProbabilityIcon(50);

            // Assert
            assert.deepStrictEqual(icon, 'fa-tint');
        });

        it('should return "fa-tint-slash" icon if probability is under or equal low', () => {

            // Act
            const icon = module.getRainProbabilityIcon(15);

            // Assert
            assert.deepStrictEqual(icon, 'fa-tint-slash');
        });

        it('should return "fa-tint dimmed" icon if probability is under or equal low and version is lower than 2.6.0', () => {

            // Arrange
            version = '2.5.99';

            // Act
            const icon = module.getRainProbabilityIcon(15);

            // Assert
            assert.deepStrictEqual(icon, 'fa-tint dimmed');
        });

        it('should return "fa-umbrella" icon if probability is greater or equal high', () => {

            // Act
            const icon = module.getRainProbabilityIcon(75);

            // Assert
            assert.deepStrictEqual(icon, 'fa-umbrella');
        });
    });

    describe('getWindDirKey', () => {

        it('should return "N" if direction degree is equal 22', () => {

            // Act
            const text = module.getWindDirKey(22);

            // Assert
            assert.deepStrictEqual(text, 'N');
        });

        it('should return "NE" if direction degree is equal 67', () => {

            // Act
            const text = module.getWindDirKey(67);

            // Assert
            assert.deepStrictEqual(text, 'NE');
        });

        it('should return "E" if direction degree is equal 112', () => {

            // Act
            const text = module.getWindDirKey(112);

            // Assert
            assert.deepStrictEqual(text, 'E');
        });

        it('should return "SE" if direction degree is equal 157', () => {

            // Act
            const text = module.getWindDirKey(157);

            // Assert
            assert.deepStrictEqual(text, 'SE');
        });

        it('should return "S" if direction degree is equal 202', () => {

            // Act
            const text = module.getWindDirKey(202);

            // Assert
            assert.deepStrictEqual(text, 'S');
        });

        it('should return "SW" if direction degree is equal 247', () => {

            // Act
            const text = module.getWindDirKey(247);

            // Assert
            assert.deepStrictEqual(text, 'SW');
        });

        it('should return "W" if direction degree is equal 292', () => {

            // Act
            const text = module.getWindDirKey(292);

            // Assert
            assert.deepStrictEqual(text, 'W');
        });

        it('should return "NW" if direction degree is equal 337', () => {

            // Act
            const text = module.getWindDirKey(337);

            // Assert
            assert.deepStrictEqual(text, 'NW');
        });

        it('should return "N" if direction degree is greater than 337', () => {

            // Act
            const text = module.getWindDirKey(338);

            // Assert
            assert.deepStrictEqual(text, 'N');
        });
    });

    describe('getFormattedUpdateTime', () => {

        it('should return formatted update time', () => {

            // Arrange
            module.updatedAt = 1567411200000;

            // Act
            const time = module.getFormattedUpdateTime();

            // Assert
            assert.deepStrictEqual('02.09. 10:00', time);
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
            const options = { id: module.config.id, days: module.config.days };
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

    describe('triggerModules', () => {

        // Mocked triggered module
        const modul = {
            show: sinon.fake(),
            hide: sinon.fake()
        };

        beforeEach(() => {
            MM.getModules = sinon.fake.returns({
                withClass: function() { return [modul]; }
            });
        });

        it('should do nothing when no data is available', () => {

            // Act
            module.triggerModules();

            // Assert
            assert.ok(MM.getModules.notCalled);
        });

        it('should skip triggers when day data is not available', () => {

            // Arrange
            module.weatherData = [];
            module.config.triggers = [{ day: 0 }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(MM.getModules.notCalled);
        });

        it('should hide module if data value is lower than trigger data', () => {

            // Arrange
            module.weatherData = [{ field: 1 }];
            module.config.triggers = [{ day: 0, field: 'field', value: 2 }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.hide.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });

        it('should hide module if data value is lower than trigger data (maxtemp)', () => {

            // Arrange
            module.weatherData = [{ temp: '2;1' }];
            module.config.triggers = [{ day: 0, field: 'maxtemp', value: 3 }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.hide.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });

        it('should hide module if data value is lower than trigger data (mintemp)', () => {

            // Arrange
            module.weatherData = [{ temp: '3;1' }];
            module.config.triggers = [{ day: 0, field: 'mintemp', value: 2 }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.hide.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });

        it('should hide module if data value is equal trigger data', () => {

            // Arrange
            module.weatherData = [{ field: 1 }];
            module.config.triggers = [{ day: 0, field: 'field', value: 1 }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.hide.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });

        it('should hide module if data value is higher than trigger data and hide mode is used', () => {

            // Arrange
            module.weatherData = [{ field: 2 }];
            module.config.triggers = [{ day: 0, field: 'field', value: 1, hide: true }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.hide.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });

        it('should show module if data value is higher than trigger data', () => {

            // Arrange
            module.weatherData = [{ field: 2 }];
            module.config.triggers = [{ day: 0, field: 'field', value: 1 }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.show.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });

        it('should show module if data value is lower than trigger data and hide mode is used', () => {

            // Arrange
            module.weatherData = [{ field: 1 }];
            module.config.triggers = [{ day: 0, field: 'field', value: 2, hide: true }];

            // Act
            module.triggerModules();

            // Assert
            assert.ok(modul.show.calledWith(1000, { lockString: 'MMM-RBB-Weather' }));
        });
    });
});
