/* Magic Mirror
 * Module: MMM-RBB-Weather
 *
 * By Nikolai Keist (github.com/nkl-kst)
 * MIT Licensed.
 */

/**
 * Map RBB to Amchart icons.
 */
IconMapper = {

     /**
      * This object is used to map RBB icon names to Amchart SVG filenames. The RBB icon names are
      * set in the XML weather data returned by the RBB webservice. The Amchart files are placed in
      * vendor/amcharts folder.
      */
     iconMapping: {
         "100000": "day",
         "110000": "cloudy-day-1",
         "110100": "snowy-1",
         "110300": "snowy-1",
         "111000": "rainy-2",
         "111100": "snowy-2",
         "113000": "rainy-2",
         "113300": "snowy-2",
         "120000": "cloudy-day-1",
         "120100": "snowy-2",
         "120200": "snowy-3",
         "120300": "snowy-2",
         "121000": "rainy-2",
         "121100": "snowy-1",
         "122000": "rainy-3",
         "122200": "snowy-3",
         "123000": "rainy-1",
         "123300": "snowy-2",
         "200000": "night",
         "210000": "cloudy-night-1",
         "210100": "snowy-4",
         "210300": "snowy-5",
         "211000": "rainy-4",
         "211100": "snowy-5",
         "213000": "rainy-5",
         "213300": "snowy-4",
         "220000": "cloudy-night-1",
         "220100": "snowy-4",
         "220200": "snowy-6",
         "220300": "snowy-5",
         "221000": "rainy-4",
         "221100": "snowy-5",
         "222000": "rainy-6",
         "222200": "rainy-7",
         "223000": "rainy-5",
         "223300": "snowy-4",
         "320000": "cloudy",
         "320100": "snowy-4",
         "320200": "snowy-6",
         "320300": "snowy-5",
         "321000": "rainy-4",
         "321100": "snowy-5",
         "322000": "rainy-6",
         "322200": "rainy-7",
         "323000": "rainy-5",
         "323300": "snowy-4",
         "330000": "cloudy",
         "330100": "snowy-4",
         "330200": "snowy-6",
         "330300": "snowy-5",
         "331000": "rainy-4",
         "331100": "snowy-5",
         "332000": "rainy-6",
         "332200": "rainy-7",
         "333000": "rainy-5",
         "333300": "snowy-4",
     },

     /**
      * getIconPath - Use the icon mapping to find the correct Amchart icon related to the given RBB
      * icon name. Returns the whole path to the SVG icon file based on the given subfolder. If no
      * mapping is found, a warning is logged and undefined will be returned.
      *
      * @param  {String} rbbIcon RBB icon name
      * @param  {String} folder  Amchart subfolder (animated or static)
      * @return {String}         Path to SVG icon
      */
     getIconPath: function(rbbIcon, folder) {

        let icon = this.iconMapping[rbbIcon];
        if (icon !== undefined) {
            return `vendor/amcharts/${folder}/${icon}.svg`;
        }

        this._log(`No mapping found for RBB icon "${rbbIcon}"!`);
        return undefined;
     },

     /**
      * _log - This logging wrapper is used so that it can be mocked in testing.
      *
      * @param  {String} message Message to log
      */
     _log: /* istanbul ignore next */ function(message) {
         console.warn(message);
     }
 }
