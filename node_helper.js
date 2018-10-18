/* Magic Mirror
 * Node Helper: MMM-RBB-Weather
 *
 * By Nikolai Keist (github.com/nkl-kst)
 * MIT Licensed.
 */

const Logger = require('./Logger');
const NodeHelper = require('node_helper');
const https = require('https');
const Promise = require('bluebird');
const xmlParser = require('fast-xml-parser');

module.exports = NodeHelper.create({

    // Instancevariables
    config: null,
    cache: null,

    socketNotificationReceived: function(notification, payload) {

        if (notification === 'LOAD_DATA') {

            // Save config
            this.config = payload;
            if (this.config.days > 7) {
                this.config.days = 7; // Maximum days available on RBB
            }

            // Load data
            this.loadData();
        }
    },

    /**
     * loadData - Load data for every day set in config send it to module via socket notification.
     * If an error occurs, try to use cached data instead, but errors are logged.
     */
    loadData: async function() {
        Logger.log(`Load data for ID "${this.config.id}" and "${this.config.days}" days ...`);

        // Build days array for promise mapping
        let daysArray = [];
        for (let day = 0; day <= this.config.days; day++) {
            daysArray.push(day);
        }

        let self = this;
        try {

            // Load data concurrently, data is an array of all days results
            let data = await Promise.map(daysArray, (day) => {

                // Fetch data for this day
                return self.fetchDayData(day);
            });

            // Cache data
            self.cache = data;

            // Send data to module
            Logger.log('Data received, send to module ...');
            self.sendSocketNotification('DATA_LOADED', data);

        } catch (error) {
            Logger.warn(`Error while fetching data: "${error.message}"`);

            // Return cached data
            if (self.cache) {
                Logger.info('Send cached data to module ...');
                self.sendSocketNotification('DATA_LOADED', self.cache);
            }
        }
    },

    /**
     * fetchDayData - Fetch rbb weather data for given day. Returns a promise which is resolved when
     * xml is parsed. The promise is rejected in case of error or timeout.
     *
     * @param  {Number}  day Day of weather data to be fetched
     * @return {Promise}     Promise resolved with xml parsed as object
     */
    fetchDayData: function(day) {
        Logger.log(`Fetch data for day "${day} ..."`);

        return new Promise((resolve, reject) => {

            // Request RBB xml data for this day
            let url = `https://www.rbb24.de/include/wetter/data/data_bb_${day}.xml`;
            https.get(url, (response) => {
                let xml = '';

                // Concat data chunk
                response.on('data', (chunk) => {
                    xml += chunk;
                });

                // Error
                response.on('error', (error) => {
                    reject(error);
                });

                // Timeout
                response.on('timeout', (error) => {
                    reject(error);
                });

                // Response complete, parse full xml
                response.on('end', () => {
                    let data = this.parseData(xml, day);
                    resolve(data);
                });
            });
        });
    },

    /**
     * parseData - Parse given XML data into JSON object. Day is used to determine if a possible id
     * letter needs to be removed for all days but current data. Return an empty oject if id set in
     * config does not match any key (city) in XML.
     *
     * @param  {String} xml XML content fetched from RBB
     * @param  {Number} day Day of given XML
     * @return {Object}     XML data as JSON object, may be empty
     */
    parseData: function(xml, day) {

        // XML parse options
        let options = {
            attributeNamePrefix: '',
            ignoreAttributes: false
        };

        // Parse XML data to json
        let parsedData = xmlParser.parse(xml, options);
        if (parsedData === undefined || parsedData.data === undefined) {
            Logger.warn(`Error while parsing XML data. XML: "${xml}"`);
            return {};
        }

        // All citys are in the same XML file for one day, loop through them to find
        // the city data with correct ID
        let citys = parsedData.data.city;
        for (let city of Object.values(citys)) {

            // Only current data has possible letters in IDs, remove for forecast
            let id = this.config.id;
            if (day !== 0) {
                id = this.config.id.replace('a', '');
            }

            // Find correct city
            if (city.id === id) {
                return city;
            }
        }

        // No city found
        Logger.warn(`No city found with id "${this.config.id}".`);
        return {};
    }
});
