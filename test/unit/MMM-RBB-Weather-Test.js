/* eslint no-global-assign: "off" */

const decache = require('decache');

const assert = require('assert');
const sinon = require('sinon');

const JSDOM = require('jsdom').JSDOM;

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

describe('MMM-RBB-Weather', () => {

    // Tested
    let module;

    beforeEach(() => {
        // Initialize module
        decache('../../MMM-RBB-Weather');
        require('../../MMM-RBB-Weather');
        module = Module.definitions['MMM-RBB-Weather'];

        // Fake file method
        module.file = sinon.fake((path) => {
            return `parent/folder/${path}`;
        });

        // Fake DOM
        document = new JSDOM(`<!DOCTYPE html>`).window.document;
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

        it('should return an array', () => {

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

    describe('getDom', () => {

        it('should show info if no data is available', () => {

            // Arrange
            module.translate = sinon.fake((key) => {
                return `${key}`;
            });

            // Act
            let dom = module.getDom();

            // Assert
            assert.deepStrictEqual(dom.outerHTML, '<div class="white">TEXT_NODATA</div>');
        });

        it('should return dom with weather data', () => {

            // Arrange
            module.config.showWindspeed = true;
            module.weatherData = {
                '0': { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' },
                '1': { 'id': '10385', 'temp': '23;10', 'dd': '360', 'ffkmh': '10', 'nww': '110000', 'wwtext': 'wolkig', 'prr': '13' }
            };

            module.getCurrentDiv = sinon.fake.returns(document.createElement('div'));
            module.getTempIcon = sinon.fake.returns('fa-thermometer-half');
            module.getRainProbabilityIcon = sinon.fake.returns('fa-tint');

            let timeMock = moment('2018-09-02 10:00');
            moment = sinon.fake.returns(timeMock);

            // Act
            let dom = module.getDom();

            // Assert
            let expected =
                '<div class="white">' +
                    '<div></div>' +
                    '<table class="small weather-table">' +
                        '<tr>' +
                            '<td class="day">So.</td>' +
                            '<td class="weather-icon" style="background-image: url(parent/folder/vendor/amcharts/static/cloudy-day-1.svg);"></td>' +
                            '<td class="title bright">23° <i class="fa fa-fw fa-thermometer-half"></i></td>' +
                            '<td>10° <i class="fa fa-fw fa-thermometer-half"></i></td>' +
                            '<td class="wind">10 <span>km/h</span> <i class="wi wi-wind from-360-deg fa-fw"></i></td>' +
                            '<td>13% <i class="fa fa-fw fa-tint"></i></td>' +
                        '</tr>' +
                    '</table>' +
                '</div>';

            assert.deepStrictEqual(dom.outerHTML, expected);
        });

        it('should use animated icon if set in config', () => {

            // Arrange
            module.config.showWindspeed = true;
            module.config.animateForecastIcon = true;
            module.weatherData = {
                '0': { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' },
                '1': { 'id': '10385', 'temp': '23;10', 'dd': '360', 'ffkmh': '10', 'nww': '110000', 'wwtext': 'wolkig', 'prr': '13' }
            };

            module.getCurrentDiv = sinon.fake.returns(document.createElement('div'));
            module.getTempIcon = sinon.fake.returns('fa-thermometer-half');
            module.getRainProbabilityIcon = sinon.fake.returns('fa-tint');

            let timeMock = moment('2018-09-02 10:00');
            moment = sinon.fake.returns(timeMock);

            // Act
            let dom = module.getDom();

            // Assert
            let expected =
                '<div class="white">' +
                    '<div></div>' +
                    '<table class="small weather-table">' +
                    '<tr>' +
                        '<td class="day">So.</td>' +
                        '<td class="weather-icon" style="background-image: url(parent/folder/vendor/amcharts/animated/cloudy-day-1.svg);"></td>' +
                        '<td class="title bright">23° <i class="fa fa-fw fa-thermometer-half"></i></td>' +
                        '<td>10° <i class="fa fa-fw fa-thermometer-half"></i></td>' +
                        '<td class="wind">10 <span>km/h</span> <i class="wi wi-wind from-360-deg fa-fw"></i></td>' +
                        '<td>13% <i class="fa fa-fw fa-tint"></i></td>' +
                    '</tr>' +
                '</table>' +
            '</div>';

            assert.deepStrictEqual(dom.outerHTML, expected);
        });

        it('should ignore white icons, windspeed and rain probability if set in config', () => {

            // Arrange
            module.config.whiteIcons = false;
            module.config.showRainProbability = false;
            module.weatherData = {
                '0': { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' },
                '1': { 'id': '10385', 'temp': '23;10', 'dd': '360', 'ffkmh': '10', 'nww': '110000', 'wwtext': 'wolkig', 'prr': '13' }
            };

            module.getCurrentDiv = sinon.fake.returns(document.createElement('div'));
            module.getTempIcon = sinon.fake.returns('fa-thermometer-half');

            let timeMock = moment('2018-09-02 10:00');
            moment = sinon.fake.returns(timeMock);

            // Act
            let dom = module.getDom();

            // Assert
            let expected =
                '<div>' +
                    '<div></div>' +
                    '<table class="small weather-table">' +
                        '<tr>' +
                            '<td class="day">So.</td>' +
                            '<td class="weather-icon" style="background-image: url(parent/folder/vendor/amcharts/static/cloudy-day-1.svg);"></td>' +
                            '<td class="title bright">23° <i class="fa fa-fw fa-thermometer-half"></i></td>' +
                            '<td>10° <i class="fa fa-fw fa-thermometer-half"></i></td>' +
                        '</tr>' +
                    '</table>' +
                '</div>';

            assert.deepStrictEqual(dom.outerHTML, expected);
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

        it('should return "fa-asterisk" icon if temperature is lower than 0', () => {

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

        it('should return "fa-tint dimmed" icon if probability is under or equal low', () => {

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

    describe('getCurrentDiv', () => {

        it('should return div with current weather data', () => {

            // Arrange
            let data = { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' };

            module.translate = sinon.fake((key) => {
                return `${key}`;
            });

            // Act
            let div = module.getCurrentDiv(data);

            // Assert
            let expected =
                '<div class="current">' +
                    '<div class="large bright light">' +
                        '<img class="weather-icon" src="parent/folder/vendor/amcharts/animated/cloudy-day-1.svg">' +
                        '<span>21°C</span>' +
                    '</div>' +
                    '<div class="medium normal">wolkig</div>' +
                    '<div class="small dimmed">8 km/h <i class="wi wi-strong-wind"></i> WIND_NE<i class="wi wi-wind from-50-deg fa-fw"></i></div>' +
                '</div>';

            assert.deepStrictEqual(div.outerHTML, expected);
        });

        it('should use static icon if set in config', () => {

            // Arrange
            module.config.animateCurrentIcon = false;
            let data = { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' };

            module.translate = sinon.fake((key) => {
                return `${key}`;
            });

            // Act
            let div = module.getCurrentDiv(data);

            // Assert
            let expected =
                '<div class="current">' +
                    '<div class="large bright light">' +
                        '<img class="weather-icon" src="parent/folder/vendor/amcharts/static/cloudy-day-1.svg">' +
                        '<span>21°C</span>' +
                    '</div>' +
                    '<div class="medium normal">wolkig</div>' +
                    '<div class="small dimmed">8 km/h <i class="wi wi-strong-wind"></i> WIND_NE<i class="wi wi-wind from-50-deg fa-fw"></i></div>' +
                '</div>';

            assert.deepStrictEqual(div.outerHTML, expected);
        });

        it('should ignore current wind speed if set in config', () => {

            // Arrange
            module.config.showCurrentWindspeed = false;
            let data = { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' };

            // Act
            let div = module.getCurrentDiv(data);

            // Assert
            let expected = '<div class="current"><div class="large bright light"><img class="weather-icon" src="parent/folder/vendor/amcharts/animated/cloudy-day-1.svg"><span>21°C</span></div><div class="medium normal">wolkig</div></div>';
            assert.deepStrictEqual(div.outerHTML, expected);
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
