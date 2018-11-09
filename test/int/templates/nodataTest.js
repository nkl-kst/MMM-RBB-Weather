const assert = require('assert');

const parser = require('fast-xml-parser');
const renderTemplate = require('./NunjucksTestEnv').renderTemplate;

describe('nodata.njk', function() {

    // Tested
    let output;

    before(async () => {

        // Render template output
        output = await renderTemplate('nodata.njk');
    });

    it('should render valid html', () => {

        // Assert
        assert.strictEqual(parser.validate(output), true);
    });

    it('should render translated "no data" text', async () => {

        // Assert
        assert(output.includes('<div>translated: TEXT_NODATA</div>'));
    });
});
