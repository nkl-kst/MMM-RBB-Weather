/* Magic Mirror
 * Module: MMM-RBB-Weather
 *
 * By Nikolai Keist (github.com/nkl-kst)
 * MIT Licensed.
 */

Module.register('MMM-RBB-Weather', {

    defaults: {

        // Data
        id: '10381', // Berlin-Steglitz
        days: 4, // Including current, 0 = only current data

        // Times
        animationSpeed: 1, // 1 sec.
        updateInterval: 600, // 10 min.

        // Show / hide flags
        showCurrentText: true,
        showCurrentWindspeed: true,
        showCurrentIcon: true,
        showCurrentTemperature: true,
        showRainProbability: true,
        showUpdateTime: false,
        showWindspeed: false,

        // Styling
        animateCurrentIcon: true,
        animateForecastIcon: false,
        dayFormat: 'ddd',
        splitCurrentTextGreater: 30,
        tableClass: 'small',
        whiteIcons: true,

        // Trigger other modules
        triggers: [
            // eg. { day: 1, field: 'prr', value: 50, module: 'clock', hide: true }
        ]
    },

    // Requires Nunjucks support added in Magic Mirror 2.2.0
    requiresVersion: '2.2.0',

    // Instancevariable
    weatherData: null,
    updatedAt: null,

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
            this.weatherData = payload.data;
            this.updatedAt = payload.time;

            // Update module
            this.updateDom(this.config.animationSpeed * 1000);

            // Trigger other modules
            this.triggerModules();
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
     * getCurrentText - Return the formatted current weather text. This is
     * split with a line break if the text contains a colon and length is
     * greater then config.splitCurrentTextGreater.
     *
     * @param  {String} text Current weather text
     * @return {String}      Formatted text
     */
    getCurrentText: function(text) {
        const splitValue = this.config.splitCurrentTextGreater;

        // No text available
        if (!text) {
            return undefined;
        }

        // Check if text and flag are given
        if (splitValue === 0) {
            return text;
        }

        // Check if text is long enough to split
        if (text.length <= splitValue) {
            return text;
        }

        // Split and break at colons
        return text.replace(/,\s*/, '<br/>');
    },

    /**
     * getDayText - Return the formatted day text for the given day index. This is used for forecast
     * days, so index 1 represents today, 2 represents tomorrow and so on.
     *
     * @param  {Number} dayIndex Day index
     * @return {String}          Formatted day text
     */
    getForecastDayText: function(dayIndex) {

        const day = moment().add(dayIndex - 1, 'days');
        return day.format(this.config.dayFormat);
    },

    /**
     * getIconUrl - Return URL to the animated or static icon mapped to the given RBB icon.
     *
     * @param  {Boolean} animate Use animated icons
     * @param  {String}  rbbIcon RBB icon to be mapped
     * @return {String}          URL to mapped icon
     */
    getIconUrl: function(animate, rbbIcon) {

        // No current icon available
        if (!rbbIcon || isNaN(rbbIcon)) {
            return undefined;
        }

        // Icon path
        const iconFolder = animate ? 'animated' : 'static';
        const iconPath = IconMapper.getIconPath(rbbIcon, iconFolder);

        // Fallback to RBB icons if no mapping was found
        if (!iconPath) {
            return `https://www.rbb24.de/basis/grafik/icons/wetter/svg/${rbbIcon}.svg`;
        }

        // Return icon url
        return this.file(iconPath);
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
     * @param  {String} deg Wind direction in degrees
     * @return {String}     Wind direction short text
     */
    getWindDirKey: function(deg) {

        // No wind direction available
        if (!deg || isNaN(deg)) {
            return undefined;
        }
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
     * getFormattedUpdatedTime - Get the human readable update time.
     *
     * @return {String} Formatted update time
     */
    getFormattedUpdateTime: function() {
        return moment(this.updatedAt).format('DD.MM. HH:mm');
    },

    /**
     * loadData - Load weather data via node_helper. This functions sends a socket notification with
     * LOAD_DATA as notification name and the place id (config.id) and day count (config.days) as
     * payload and schedules the next refresh.
     */
    loadData: function() {
        Log.info('Send socket notification to load data in node_helper ...');

        // Load data via node helper
        const dataConfig = { id: this.config.id, days: this.config.days };
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
    },

    /**
     * triggerModules - Trigger other modules based on weather data values.
     * Hides the defined module(s) if the data field is lower or equal than the
     * defined trigger value, otherwise shows the module. This behaviour is
     * switched if the hide-Property is used in triggers.
     */
    triggerModules: function() {

        // Do nothing if no data is available
        if (this.weatherData === null) return;

        // Iterate over defined triggers
        for (const trigger of this.config.triggers) {

            // Check if weather data is available for needed day
            const data = this.weatherData[trigger.day];
            if (!data) continue;

            // Get module(s) by class
            const modules = MM.getModules().withClass(trigger.module);
            for (const modul of modules) {
                Log.info(`Trigger module '${modul.name}' ...`);

                // Show/hide options
                const lockOptions = { lockString: this.name };
                const speed = this.config.animationSpeed * 1000;

                // Get weather data to check
                let dataValue = data[trigger.field];
                if (trigger.field === 'maxtemp') {
                    dataValue = data.temp.split(';')[0];
                }
                if (trigger.field === 'mintemp') {
                    dataValue = data.temp.split(';')[1];
                }

                // Check trigger condition: Hide module if data value is lower
                // or equal than trigger value or if the trigger uses hide mode,
                // but not both (xor)
                if ((dataValue <= trigger.value) !== (trigger.hide === true)) {
                    modul.hide(speed, lockOptions);
                } else {
                    modul.show(speed, lockOptions);
                }
            }
        }
    }
});
