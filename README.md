# MMM-RBB-Weather

[![Build Status](https://travis-ci.com/nkl-kst/MMM-RBB-Weather.svg?branch=master)](https://travis-ci.com/nkl-kst/MMM-RBB-Weather)
[![Coverage Status](https://coveralls.io/repos/github/nkl-kst/MMM-RBB-Weather/badge.svg)](https://coveralls.io/github/nkl-kst/MMM-RBB-Weather)
[![Maintainability](https://api.codeclimate.com/v1/badges/a8567d7917169f2cb1be/maintainability)](https://codeclimate.com/github/nkl-kst/MMM-RBB-Weather/maintainability)
[![Greenkeeper](https://badges.greenkeeper.io/nkl-kst/MMM-RBB-Weather.svg)](https://greenkeeper.io/)
[![dependencies Status](https://david-dm.org/nkl-kst/MMM-RBB-Weather/status.svg)](https://david-dm.org/nkl-kst/MMM-RBB-Weather)
[![devDependencies Status](https://david-dm.org/nkl-kst/MMM-RBB-Weather/dev-status.svg)](https://david-dm.org/nkl-kst/MMM-RBB-Weather?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/nkl-kst/MMM-RBB-Weather/badge.svg?targetFile=package.json)](https://snyk.io/test/github/nkl-kst/MMM-RBB-Weather?targetFile=package.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://choosealicense.com/licenses/mit)

This is a module for the awesome [MagicMirror²](https://github.com/MichMich/MagicMirror/). It displays local weather data for cities in Berlin and Brandenburg (Germany) based on [RBB weather data](https://www.rbb24.de/wetter/wetterkarte/).

![Screenshot](.github/screen.gif)

## Install the module

Go to modules folder
```
cd modules/
```

Clone this module from Github
```
git clone https://github.com/nkl-kst/MMM-RBB-Weather
```

Switch to newly created module folder
```
cd MMM-RBB-Weather/
```

Install dependencies
```
npm install --only=prod
```

After adding this module to your config (see below) restart your MagicMirror.

## Update the module

Go to modules folder

```
cd modules/MMM-RBB-Weather
```

Pull changes from Github

```
git pull
```

Install new dependencies

```
npm install --only=prod
```

Since this repository ignores the automatically generated ``package-lock.json``, pulling changes should always work. If not, try to reset your module with ``git reset --hard`` before pulling new changes.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-RBB-Weather',
            position: "top_right", // All available positions
            config: {
                // See below for configurable options, this is optional
            }
        }
    ]
}
```

## Configuration options

All options are optional so the module works out of the box.

| Option                 | Description
|----------------------- |-----------
| `id`                   | City ID for data, see [table below](#city-ids)<br><br>**Type:** `String`<br>**Default:** `10381` (Berlin-Steglitz)
| `days`                 | Days shown in forecast table. Set this to `0` to display only current weather. Data for seven days are available (including today), so `7` is the maximum here. <br><br>**Type:** `Number`<br>**Default:** `4`
| `animationSpeed`       | Duration of content refresh animation in seconds.<br><br>**Type:** `Number`<br>**Default:** `1`
| `updateInterval`       | Time between loading new weather data in seconds.<br><br>**Type:** `Number`<br>**Default:** `600` (10 minutes)
| `showCurrentText`      | Flag to display current weather text.<br><br>**Type:** `Boolean`<br>**Default:** `true`
| `showCurrentWindspeed` | Flag to display current windspeed information.<br><br>**Type:** `Boolean`<br>**Default:** `true`
| `showRainProbability`  | Flag to display rain probability in forecast table.<br><br>**Type:** `Boolean`<br>**Default:** `true`
| `showUpdateTime`       | Flag to display last data update time.<br><br>**Type:** `Boolean`<br>**Default:** `false`
| `showWindspeed`        | Flag to display windspeed in forecast table.<br><br>**Type:** `Boolean`<br>**Default:** `false`
| `animateCurrentIcon`   | Flag to animate icon for current data.<br><br>**Type:** `Boolean`<br>**Default:** `true`
| `animateForecastIcon`  | Flag to animate icons in forecast table.<br><br>**Type:** `Boolean`<br>**Default:** `false`
| `dayFormat`            | Day format in forecast table, see [Moment.js formats](https://momentjs.com/docs/#/displaying/format/) for details.<br><br>**Type:** `String`<br>**Default:** `ddd`
| `splitCurrentTextGreater` | Split current weather text if it is larger than this value. Set it to `0` to disable splitting.<br><br>**Type:** `Number`<br>**Default:** `30`
| `tableClass`           | Classes added to forecast table. Could be used for additional styling, sizing etc.<br><br>**Type:** `String`<br>**Default:** `small`
| `whiteIcons`           | Flag to convert weather icons to simple white icons.<br><br>**Type:** `Boolean`<br>**Default:** `true`
| `triggers`             | Array of triggers to show/hide other modules based on weather data.<br><br>**Type:** `Array` of trigger objects<br>**Default:** `[]`

### Triggers

You can define triggers to show or hide other modules based on weather data. A trigger object is defined by the following keys:

| Key                    | Description
|----------------------- |-----------
| `day`                  | Day to check `field` for fulfilled trigger condition. Day `0` holds current values, day `1` represents today, day `2` is tomorrow and so on until day `7`.<br><br>**Type:** `Number`
| `field`                | Field to check `value` for fulfilled trigger condition. Possible fields are:<br><br><ul><li>`temp` - Temperature (only for day `0`)</li><li>`maxtemp` - Maximum temperature (only for days `1` to `7`)</li><li>`mintemp` - Minimum temperature (only for days `1` to `7`)</li><li>`ffkmh` - Windspeed</li><li>`prr` - Rain possibility (only for days `1` to `7`)</li></ul><br>**Type:** `String`
| `value`                | Show module if field data is higher than this value.<br><br>**Type:** `Number`<br>
| `module`               | Name of the module you want to show/hide. Modules are determined by their class name, so you could define a class in module configs to trigger more than one module.<br><br>**Type:** `String`<br>
| `hide`                 | Use this option to hide a module instead of showing it if trigger conditions are fulfilled.<br><br>**Type:** `Boolean`<br>**Default:** `false`

This example trigger hides the clock module if todays rain possiblity is higher than 50 percent, otherwise the clock module is shown:

```
triggers: [
    { day: 1, field: 'prr', value: 50, module: 'clock', hide: true }
]
```

## Known issues

### MagicMirror crashs after several hours
The animated icons consume a high amount of memory, resulting in an Electron crash and therefore a black MagicMirror screen. If you experience this issue, please use static icons instead (as described in [Configuration options](#configuration-options)). Refer to [issue #16](https://github.com/nkl-kst/MMM-RBB-Weather/issues/16) for more information.

### Suddenly no data
There were some changes in the weather data in October 2020, primarly city IDs have changed. Please refer to the [table below](#city-ids) and get your city ID.

## Problems

If you have any problems or questions, feel free to open an issue. There are many possible improvements for this module so please let me know if you miss something.

## Developer notes

To run all unit tests just fire this command in the module folder

```
# Install also dev dependencies
npm install

# Run tests
npm test
```

You can also check if RBB endpoints are available and still providing correct data

```
npm run test-int
```

## City IDs

Use one of these city IDs in your config.

| City                      | ID
|---------------------------|----------
| *Berlin*                  | <span/>
| Adlershof                 | `6510388`
| Marzahn                   | `3010387`
| Steglitz                  | `10381`
| Tempelhof                 | `10384`
| *Brandenburg*             | <span/>
| Altdöbern                 | `6510496`
| Angermünde                | `10291`
| Bad Liebenwerda           | `6510482`
| Baruth/Mark               | `10376`
| Bernau                    | `3210383`
| Bestensee                 | `6510375`
| Brandenburg an der Havel  | `6510371`
| Coschen                   | `3010496`
| Cottbus                   | `10496a`
| Dahme/Mark                | `6510477`
| Doberlug/Kirchhain        | `10490`
| Eberswalde                | `6510290`
| Eisenhüttenstadt          | `3010398`
| Forst (Lausitz)           | `3210497`
| Frankfurt (Oder)          | `6510399`
| Fürstenberg/Havel         | `10277`
| Fürstenwalde/Spree        | `6510395`
| Gransee                   | `3010278a`
| Guben                     | `6510497`
| Guteborn                  | `6510491`
| Herzberg (Elster)         | `10476`
| Jüterbog                  | `3010476`
| Ketzin                    | `3210380`
| Klettewitz                | `3010493a`
| Kyritz                    | `10267`
| Lenzen (Elbe)             | `3010255`
| Liebenwalde               | `3110278`
| Lieberose                 | `10496b`
| Lindneberg                | `10393`
| Lübben (Spreewald)        | `3010376`
| Luckenwalde               | `6510376b`
| Ludwigsfelde              | `6510377`
| Manschnow                 | `10396a`
| Nauen                     | `6510373`
| Neuruppin                 | `10271`
| Oranienburg               | `6510374`
| Ortrand                   | `3210488`
| Perleberg                 | `6510263`
| Potsdam                   | `10379`
| Prenzlau                  | `10289`
| Pritzwalk                 | `3010266`
| Rathenow                  | `3210370`
| Schönefeld                | `10385`
| Seelow                    | `10396b`
| Senftenberg               | `3010493b`
| Stechlin                  | `3010277`
| Strausberg                | `3210393`
| Templin                   | `6510287`
| Treuenbrietzen            | `6510376a`
| Welzow                    | `6510492`
| Wiesenburg                | `10368`
| Wittstock/Dosse           | `3010273`
| Zehdenick                 | `3010278b`
| Ziesar                    | `3010366`

## License: MIT

See [LICENSE](LICENSE.txt)
