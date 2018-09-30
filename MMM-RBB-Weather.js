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
        tableClass: "small",
        whiteIcons: true,
    },

	requiresVersion: "2.1.0", // Required version of MagicMirror

    // Instancevariable
    weatherData: null,

    getScripts: function() {
        return [ "moment.js" ];
    },

    getStyles: function () {
        return [ "weather-icons.css", "MMM-RBB-Weather.css" ];
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
            let icon = document.createElement('img');
            icon.className = 'weather-icon';
            icon.src = `https://www.rbb24.de/basis/grafik/icons/wetter/${data.nww}.png`;

            iconCol.appendChild(icon);
            row.appendChild(iconCol);

            // Split temparatures
            let maxTemp = data.temp.split(';')[0];
            let minTemp = data.temp.split(';')[1];

            // Max temparature
            let maxCol = document.createElement('td');
            maxCol.className = 'title bright';
            maxCol.innerHTML = `${maxTemp}° <i class='fa fa-fw fa-thermometer-three-quarters'></i>`;
            row.appendChild(maxCol);

            // Min temparature
            let minCol = document.createElement('td');
            minCol.innerHTML = `${minTemp}° <i class='fa fa-fw fa-thermometer-quarter'></i>`;
            row.appendChild(minCol);

            // Wind
            if (this.config.showWindspeed) {
                let windCol = document.createElement('td');
                windCol.innerHTML = `${data.ffkmh} <span>km/h</span>`;
                windCol.className = 'wind';
                row.appendChild(windCol);
            }

            // Rain
            if (this.config.showRainProbality) {
                let rainCol = document.createElement('td');
                rainCol.innerHTML = `${data.prr}% <i class='fa fa-fw fa-tint'></i>`;
                row.appendChild(rainCol);
            }

            table.appendChild(row);
        }

        // Append table to wrapper and return it
        wrapper.appendChild(table);
        return wrapper;
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
        dataDiv.className = "large bright";

        // Temparature
        let temp = document.createElement('span');
        temp.innerHTML = data.temp + "°";
        dataDiv.appendChild(temp);

        // Icon
        let icon = document.createElement('img');
        icon.className = "weather-icon";
        icon.src = `https://www.rbb24.de/basis/grafik/icons/wetter/${data.nww}.png`;
        dataDiv.appendChild(icon);

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
            wind.innerHTML = this.translate('TEXT_WINDSPEED', { text: data.ffkmh });
            wrapper.appendChild(wind);
        }

        return wrapper;
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
