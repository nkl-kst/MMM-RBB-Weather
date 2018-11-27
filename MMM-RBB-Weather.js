/* Magic Mirror
 * Module: MMM-RBB-Weather
 *
 * By Nikolai Keist (github.com/nkl-kst)
 * MIT Licensed.
 */

Module.register('MMM-RBB-Weather', {

    defaults: {

        // Data
        id: '18228265', // Berlin
        days: 4, // Including current, 0 = only current data

        // Times
        animationSpeed: 1, // 1 sec.
        updateInterval: 600, // 10 min.

        // Show / hide flags
        showCurrentWindspeed: true,
        showRainProbability: true,
        showWindspeed: false,

        // Styling
        animateCurrentIcon: true,
        animateForecastIcon: false,
        tableClass: 'small',
        whiteIcons: true
    },

    // Requires Nunjucks support added in Magic Mirror 2.2.0
    requiresVersion: '2.2.0',

    // Instancevariable
    weatherData: null,

    getScripts: function() {
        return [
            'moment.js',
            'IconMapper.js'
        ];
    },

    getStyles: function() {
        return [
            'font-awesome.css',
            'font-awesome5.css', // Only available in MagicMirror > 2.5.0
            'weather-icons.css',
            'weather-icons-wind.css',
            'MMM-RBB-Weather.css'
        ];
    },

    getTranslations: function() {
        return {
            de: 'translations/de.json',
            en: 'translations/en.json'
        };
    },

    start: function() {
        Log.info(`Starting module: ${this.name} ...`);

        // Set locale
        moment.locale(this.config.language);
    },

    notificationReceived: function(notification, payload, sender) {

        // DOM ready
        if (notification === 'MODULE_DOM_CREATED') {

            // Initial data load
            this.loadData();
        }
    },

    socketNotificationReceived: function(notification, payload) {

        // Data loaded with node helper
        if (notification === 'DATA_LOADED') {
            this.weatherData = payload;
            this.updateDom(this.config.animationSpeed * 1000);
        }
    },

    /**
     * getTemplate - Return the Nunjucks template that should be rendered. If there is no weather
     * data available yet, the 'nodata' template is returned.
     *
     * @return {String} Template to render
     */
    getTemplate: function() {

        // No data available
        if (this.weatherData === null || this.weatherData.length === 0) {
            return 'templates/nodata.njk';
        }

        // Default module template
        return 'templates/module.njk';
    },

    /**
     * getTemplateData - Return the data that is included in the rendered Nunjucks remplate. The
     * whole module instance is returned here, because several functions are called in the template.
     *
     * @return {Object} Data to put into templates
     */
    getTemplateData: function() {
        return { module: this };
    },

    /**
     * getDayText - Return the formatted day text for the given day index. This is used for forecast
     * days, so index 1 represents today, 2 represents tomorrow and so on.
     *
     * @param  {Number} dayIndex Day index
     * @return {String}          Formatted day text
     */
    getForecastDayText: function(dayIndex) {

        let day = moment().add(dayIndex - 1, 'days');
        let dayText = day.format('ddd'); // TODO: Set format in config

        return dayText;
    },

    /**
     * getIconUrl - Return URL to the animated or static icon mapped to the given RBB icon.
     *
     * @param  {Boolean} animate Use animated icons
     * @param  {String}  rbbIcon RBB icon to be mapped
     * @return {String}          URL to mapped icon
     */
    getIconUrl: function(animate, rbbIcon) {

        // Icon path
        let iconFolder = animate ? 'animated' : 'static';
        let iconPath = IconMapper.getIconPath(rbbIcon, iconFolder);

        // Set icon url
        let iconUrl = this.file(iconPath);

        return iconUrl;
    },

    /**
     * getTempIcon - Get thermometer icon depending on temperature value.
     *
     * @param  {Number} temp Temperature value
     * @return {String}      Icon name
     */
    getTempIcon: function(temp) {

        if (temp >= 35) return 'fa-umbrella-beach';
        if (temp >= 28) return 'fa-thermometer-full';
        if (temp >= 21) return 'fa-thermometer-three-quarters';
        if (temp >= 14) return 'fa-thermometer-half';
        if (temp >= 7) return 'fa-thermometer-quarter';
        if (temp >= 0) return 'fa-thermometer-empty';

        // Font Awesome 5 (with fa-snowflake) is not available in MagicMirror < 2.6.0
        if (version.localeCompare('2.6.0', 'en', { numeric: true }) < 0) {
            return 'fa-asterisk';
        }

        return 'fa-snowflake';
    },

    /**
     * getRainProbabilityIcon - Get rain icon depending on rain probability. Standard icon is
     * "fa-tint", this is dimmed if rain probability is <= 15% and the "fa-umbrella" icon is used
     * when probability is >= 70%.
     *
     * @param  {Number} prob Rain probability
     * @return {String}      Icon name
     */
    getRainProbabilityIcon: function(prob) {

        if (prob <= 15) {

            // Font Awesome 5 (with fa-tint-slash) is not available in MagicMirror < 2.6.0
            if (version.localeCompare('2.6.0', 'en', { numeric: true }) < 0) {
                return 'fa-tint dimmed';
            }

            return 'fa-tint-slash';
        }

        if (prob >= 70) {
            return 'fa-umbrella';
        }

        return 'fa-tint';
    },

    /**
     * getWindDirKey - Get wind direction short key based on wind direction degrees.
     *
     * @param  {Number} deg Wind direction in degrees
     * @return {String}     Wind direction short text
     */
    getWindDirKey: function(deg) {

        if (deg <= 22) return 'N';
        if (deg <= 67) return 'NE';
        if (deg <= 112) return 'E';
        if (deg <= 157) return 'SE';
        if (deg <= 202) return 'S';
        if (deg <= 247) return 'SW';
        if (deg <= 292) return 'W';
        if (deg <= 337) return 'NW';
        return 'N';
    },

    /**
     * loadData - Load weather data via node_helper. This functions sends a socket notification with
     * LOAD_DATA as notification name and the place id (config.id) and day count (config.days) as
     * payload and schedules the next refresh.
     */
    loadData: function() {
        Log.info('Send socket notification to load data in node_helper ...');

        // Load data via node helper
        let dataConfig = { id: this.config.id, days: this.config.days };
        this.sendSocketNotification('LOAD_DATA', dataConfig);

        // Schedule next refresh
        this.scheduleRefresh();
    },

    /**
     * scheduleRefresh - Schedules refresh timer depending on config.updateInterval. This function
     * calls loadData().
     */
    scheduleRefresh: function() {

        setTimeout(() => {
            this.loadData();
        }, this.config.updateInterval * 1000);
    }
});
