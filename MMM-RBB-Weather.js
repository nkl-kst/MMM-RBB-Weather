/* Magic Mirror
 * Module: MMM-RBB-Weather
 *
 * By Nikolai Keist (github.com/nkl-kst)
 * MIT Licensed.
 */

Module.register("MMM-RBB-Weather", {

    defaults: {

        // Data
        id: "18228265", // Berlin
        days: 4, // Including current, 0 = only current data

        // Times
        animationSpeed: 1, // 1 sec.
        updateInterval: 600, // 10 min.

        // Show / hide flags
        showCurrentWindspeed: true,
        showRainProbality: true,
        showWindspeed: false,

        // Styling
        animateCurrentIcon: true,
        animateForecastIcon: false,
        tableClass: "small",
        whiteIcons: true,
    },

	requiresVersion: "2.1.0", // Required version of MagicMirror

    // Instancevariable
    weatherData: null,

    getScripts: function() {
        return [
            "moment.js",
            "IconMapper.js"
        ];
    },

    getStyles: function () {
        return [
            "weather-icons.css",
            "weather-icons-wind.css",
            "MMM-RBB-Weather.css"
        ];
    },

    getTranslations: function() {
        return {
            de: "translations/de.json",
            en: "translations/en.json",
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
     * getDom - Build and returns the whole module dom, including current data and forecast
     * table.
     *
     * @return {Element} Module dom as div element.
     */
    getDom: function() {

        // Dom wrapper
        let wrapper = document.createElement('div');
        if (this.config.whiteIcons) {
            wrapper.className = "white";
        }

        // No data
        if (this.weatherData === null || this.weatherData.length === 0) {
            wrapper.innerHTML = this.translate('TEXT_NODATA');
            return wrapper;
        }

        // Table with data (without current data)
        let table = document.createElement('table');
        table.className = this.config.tableClass + " weather-table";

        // Current weather
        let currentData = this.weatherData[0];
        let currentDiv = this.getCurrentDiv(currentData);
        wrapper.appendChild(currentDiv);

        // Fill table with data
        for (let [day, data] of Object.entries(this.weatherData)) {

            // Don't create table row for current data
            if (day == 0) {
                continue;
            }

            // Create data row
            let row = document.createElement('tr');

            // Date
            let dayCol = document.createElement('td');
            dayCol.className = 'day';
            dayCol.innerHTML = moment().add(day - 1, 'days').format('ddd');
            row.appendChild(dayCol);

            // Icon
            let iconCol = document.createElement('td');
            iconCol.className = 'weather-icon';

            // Icon path
            let iconFolder = this.config.animateForecastIcon ? 'animated' : 'static';
            let iconPath = IconMapper.getIconPath(data.nww, iconFolder);

            // Set icon url
            let iconUrl = this.file(iconPath);
            iconCol.style = `background-image: url('${iconUrl}')`;
            row.appendChild(iconCol);

            // Split temparatures
            let maxTemp = data.temp.split(';')[0];
            let minTemp = data.temp.split(';')[1];

            // Use icons depending on temperature value
            let maxTempIcon = this.getTempIcon(maxTemp);
            let minTempIcon = this.getTempIcon(minTemp);

            // Max temparature
            let maxCol = document.createElement('td');
            maxCol.className = 'title bright';
            maxCol.innerHTML = `${maxTemp}° <i class='fa fa-fw ${maxTempIcon}'></i>`;
            row.appendChild(maxCol);

            // Min temparature
            let minCol = document.createElement('td');
            minCol.innerHTML = `${minTemp}° <i class='fa fa-fw ${minTempIcon}'></i>`;
            row.appendChild(minCol);

            // Wind
            if (this.config.showWindspeed) {
                let windCol = document.createElement('td');
                windCol.innerHTML = `${data.ffkmh} <span>km/h</span> `
                    + `<i class='wi wi-wind from-${data.dd}-deg fa-fw'>`;
                windCol.className = 'wind';
                row.appendChild(windCol);
            }

            // Rain
            if (this.config.showRainProbality) {

                // Use icons depending on probility
                let icon = this.getRainProbilityIcon(data.prr);

                let rainCol = document.createElement('td');
                rainCol.innerHTML = `${data.prr}% <i class='fa fa-fw ${icon}'></i>`;
                row.appendChild(rainCol);
            }

            table.appendChild(row);
        }

        // Append table to wrapper and return it
        wrapper.appendChild(table);
        return wrapper;
    },

    /**
     * getTempIcon - Get thermometer icon depending on temperature value.
     *
     * @param  {Number} temp Temperature value
     * @return {String}      Icon name
     */
    getTempIcon: function(temp) {

        if (temp >= 40) return "fa-umbrella-beach";
        if (temp >= 32) return "fa-thermometer-full";
        if (temp >= 24) return "fa-thermometer-three-quarters";
        if (temp >= 16) return "fa-thermometer-half";
        if (temp >=  8) return "fa-thermometer-quarter";
        if (temp >=  0) return "fa-thermometer-empty";
                        // TODO: Use "fa-snowflake" when Font Awesome 5 is available
                        return "fa-asterisk";
    },

    /**
     * getRainProbilityIcon - Get rain icon depending on rain probility. Standard icon is "fa-tint",
     * this is dimmed if rain probility is <= 15% and the "fa-umbrella" icon is used when probility is
     * >= 70%.
     *
     * @param  {Number} probility Rain probility
     * @return {String}           Icon name
     */
    getRainProbilityIcon: function(probility) {

        if (probility <= 15) {
            // TODO: Use "fa-tint-slash" when Font Awesome 5 is available
            return "fa-tint dimmed";
        }

        if (probility >= 70) {
            return "fa-umbrella";
        }

        return "fa-tint";
    },

    /**
     * getCurrentDiv - Builds and returns the special div for current weather informations.
     *
     * @param  {Object}  data Data object fetched from RBB with all weather informations
     * @return {Element}      Special div for current weather informations
     */
    getCurrentDiv: function(data) {

        // Wrapper
        let wrapper = document.createElement('div');
        wrapper.className = "current";

        // Data wrapper
        let dataDiv = document.createElement('div');
        dataDiv.className = "large bright light";

        // Icon
        let iconImg = document.createElement('img');
        iconImg.className = "weather-icon";

        // Icon path
        let iconFolder = this.config.animateCurrentIcon ? 'animated' : 'static';
        let iconPath = IconMapper.getIconPath(data.nww, iconFolder);

        // Set icon as image source
        iconImg.src = this.file(iconPath);
        dataDiv.appendChild(iconImg);

        // Temparature
        let tempDiv = document.createElement('span');
        tempDiv.innerHTML = `${data.temp}°C`;
        dataDiv.appendChild(tempDiv);

        // Append data div (temp and icon) to wrapper
        wrapper.appendChild(dataDiv);

        // Current header text
        let textDiv = document.createElement('div');
        textDiv.className = "medium normal";
        textDiv.innerHTML = data.wwtext;
        wrapper.appendChild(textDiv);

        // Wind
        if (this.config.showCurrentWindspeed) {
            let wind = document.createElement('div');
            wind.className = "small dimmed";

            // Wind direction text
            let windDirKey = this.getWindDirKey(data.dd);
            let windDirText = this.translate(`WIND_${windDirKey}`);

            wind.innerHTML = `${data.ffkmh} km/h <i class='wi wi-strong-wind'></i> `
                + `${windDirText} <i class='wi wi-wind from-${data.dd}-deg fa-fw'>`;
            wrapper.appendChild(wind);
        }

        return wrapper;
    },

    /**
     * getWindDirKey - Get wind direction short key based on wind direction degrees.
     *
     * @param  {Number} deg Wind direction in degrees
     * @return {String}     Wind direction short text
     */
    getWindDirKey(deg) {

        if (deg <=  22) return  "N";
        if (deg <=  67) return "NE";
        if (deg <= 112) return  "E";
        if (deg <= 157) return "SE";
        if (deg <= 202) return  "S";
        if (deg <= 247) return "SW";
        if (deg <= 292) return  "W";
        if (deg <= 337) return "NW";
                        return  "N";
    },

    /**
     * loadData - Load weather data via node_helper. This functions sends a socket notification with
     * LOAD_DATA as notification name and the place id (config.id) and day count (config.days) as
     * payload and schedules the next refresh.
     */
    loadData: function() {
        Log.info("Send socket notification to load data in node_helper ...");

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
    },
});
