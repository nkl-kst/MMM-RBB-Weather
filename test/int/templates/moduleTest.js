const assert = require('assert');

const parser = require('fast-xml-parser');
const { renderTemplate } = require('./NunjucksTestEnv');
const { newModule } = require('../../unit/ModuleTestEnv');

require('../../../IconMapper');

const defaultWeatherData = {
    '0': { 'id': '10385', 'temp': '21', 'dd': '50', 'ffkmh': '8', 'nww': '120000', 'wwtext': 'wolkig' },
    '1': { 'id': '10385', 'temp': '23;10', 'dd': '360', 'ffkmh': '10', 'nww': '110000', 'wwtext': 'wolkig', 'prr': '13' }
};

describe('module.njk', () => {

    // Tested
    let output;

    // Template data
    let module;

    context('with all flag options enabled', () => {

        before(async () => {

            // Initialise module
            module = newModule();

            // Set module data
            module.config.showWindspeed = true;
            module.weatherData = defaultWeatherData;

            // Mock day function
            module.getForecastDayText = function(dayIndex) {
                return dayIndex;
            };

            // Render template output
            output = await renderTemplate('module.njk', { module: module });
        });

        it('should render valid html', () => {

            // Assert
            assert.strictEqual(parser.validate(output), true);
        });

        it('should render white icon class', () => {

            // Assert
            assert(output.includes('<div class="white">'));
        });

        it('should render animated current weather icon', () => {

            // Assert
            assert(output.includes('<img class="weather-icon" ' +
                'src="parent/folder/vendor/amcharts/animated/cloudy-day-1.svg" />'));
        });

        it('should render current temperature', () => {

            // Assert
            assert(output.includes('<span>21°C</span>'));
        });

        it('should render current weather text', () => {

            // Assert
            assert(output.includes('<div class="medium normal">wolkig</div>'));
        });

        it('should render current windspeed with wind icon', () => {

            // Assert
            assert(output.includes('8 km/h <i class="wi wi-strong-wind"></i>'));
        });

        it('should render translated wind direction text', () => {

            // Assert
            assert(output.includes('translated: NE'));
        });

        it('should render wind direction icon', () => {

            // Assert
            assert(output.includes('<i class="wi wi-wind from-50-deg fa-fw">'));
        });

        it('should render table class', () => {

            // Assert
            assert(output.includes('<table class="weather-table small">'));
        });

        it('should render forecast day', () => {

            // Assert
            assert(output.includes('<td class="day">1</td>'));
        });

        it('should render forecast weather icon', () => {

            // Assert
            assert(output.includes('<td class="weather-icon" ' +
                'style="background-image: url(\'parent/folder/vendor/amcharts/static/cloudy-day-1.svg\')"></td>'));
        });

        it('should render max forecast temperature', () => {

            // Assert
            assert(output.includes('23° <i class="fas fa-fw fa-thermometer-three-quarters"></i>'));
        });

        it('should render min forecast temperature', () => {

            // Assert
            assert(output.includes('10° <i class="fas fa-fw fa-thermometer-quarter"></i>'));
        });

        it('should render forecast wind speed', () => {

            // Assert
            assert(output.includes('10 <span>km/h</span>'));
        });

        it('should render forecast wind icon', () => {

            // Assert
            assert(output.includes('<i class="wi wi-wind from-360-deg fa-fw"></i>'));
        });

        it('should render forecast rain probability', () => {

            // Assert
            assert(output.includes('13% <i class="fas fa-fw fa-tint-slash"></i>'));
        });

    });

    context('with all flag options disabled', () => {

        before(async () => {

            // Initialise module
            module = newModule();

            // Set module data
            module.config.showCurrentText = false;
            module.config.showCurrentWindspeed = false;
            module.config.showRainProbability = false;
            module.config.animateCurrentIcon = false;
            module.config.whiteIcons = false;
            module.weatherData = defaultWeatherData;

            // Mock day function
            module.getForecastDayText = function(dayIndex) {
                return dayIndex;
            };

            // Render template output
            output = await renderTemplate('module.njk', { module: module });
        });

        it('should render valid html', () => {

            // Assert
            assert.strictEqual(parser.validate(output), true);
        });

        it('should not render white icon class', () => {

            // Assert
            assert(!output.includes('<div class="white">'));
        });

        it('should render static current weather icon', () => {

            // Assert
            assert(output.includes('<img class="weather-icon" ' +
                'src="parent/folder/vendor/amcharts/static/cloudy-day-1.svg" />'));
        });

        it('should not render current weather text', () => {

            // Assert
            assert(!output.includes('<div class="medium normal">wolkig</div>'));
        });

        it('should not render current windspeed with wind icon', () => {

            // Assert
            assert(!output.includes('8 km/h <i class="wi wi-strong-wind"></i>'));
        });

        it('should not render translated wind direction text', () => {

            // Assert
            assert(!output.includes('translated: NE'));
        });

        it('should not render wind direction icon', () => {

            // Assert
            assert(!output.includes('<i class="wi wi-wind from-50-deg fa-fw">'));
        });

        it('should not render forecast wind speed', () => {

            // Assert
            assert(!output.includes('10 <span>km/h</span>'));
        });

        it('should not render forecast wind icon', () => {

            // Assert
            assert(!output.includes('<i class="wi wi-wind from-360-deg fa-fw"></i>'));
        });

        it('should not render forecast rain probability', () => {

            // Assert
            assert(!output.includes('13% <i class="fas fa-fw fa-tint-slash"></i>'));
        });
    });
});
