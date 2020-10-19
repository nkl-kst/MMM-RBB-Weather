# MMM-RBB-Weather Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

---

## [2.3.0] - 2020-10-19

### Updated
- Updated city IDs to new XML source data
- Updated all dependencies including dev

### Fixed
- Respect empty weather data fields in XML source data


## [2.2.0] - 2019-10-12

### Added
- Optionally show update time
- Define triggers to show/hide other modules based on weather data

### Updated
- eslint packages (dev-dependencies) and resulting new linting errors/warnings


## [2.1.0] - 2019-01-26

### Added
- Added option to show/hide current weather text
- Added option to set day format in forecast table
- Added option to break current weather text if it is too large

### Fixed
- Added icon mapping for RBB icon 333001 (thunder)
- Fixed current icon position when module is placed left


## [2.0.1] - 2019-01-16

### Fixed
- Use Font Awesome 5 with correct "fas" class


## [2.0.0] - 2018-12-04

### Added
- Use RBB fallback icons if no Amchart mapping was found
- e2e tests

### Changed
- **Magic Mirror 2.2.0 is now required to run this module (Nunjucks support required)**
- Reduced range of temperature icons from 8 to 7 degrees
- Moved current text and windspeed out of the temperature div
- Retry to connect to endpoint in integration tests up to two times


## [1.2.0] - 2018-11-14

### Added
- Rendering Nunjucks templates for modules HTML ouput
- lodash.clonedeep@^4.5.0 to devDependencies
- nunjucks@^3.0.1 to devDependencies
- 'no-unused-vars' warning in eslint config

### Fixed
- Use Font Awesome (and Font Awesome 5) CSS files in getStyles()
- Use Font Awesome 5 icons not before MagicMirror version 2.6.0
- Forecast table data is now right aligned

### Updated
- Test setup with ModuleTestEnv.js and NunjucksTestEnv.js
- Moved endpoint integration tests into 'endpoint' subfolder

### Removed
- getDom() and getCurrentDiv() module functions (use Nunjucks template instead)
- decache@^4.4.0 and jsdom@^13.0.0 dependencies


## [1.1.1] - 2018-10-31

### Added
- Icon mapping for thunder and additional rain types

### Updated
- eslint-plugin-node@^8.0.0
- jsdom@^13.0.0
- Use Font Awesome 5 icons if MagicMirror version is higher than 2.5.0


## [1.1.0] - 2018-10-26

- New minor version with new features (e.g. animated icons), bugfixes etc.
- For future merges this change log should be used consistently


## [1.0.0] - 2018-09-21

- First public release
