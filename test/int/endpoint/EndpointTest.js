const assert = require('assert');

const fs = require('fs');
const path = require('path');
const https = require('https');
const libxml = require('libxmljs');

describe('Endpoints', function() {

    // Timeout and retries for endpoint connections
    this.retries(2);
    this.slow(1000);
    this.timeout(10000);

    describe('availability', () => {

        for (let day = 0; day <= 7; day++) {
            it(`should get data for day ${day}`, (done) => {

                // Arrange
                const url = `https://www.rbb24.de/include/wetter/data/data_bb_${day}.xml`;

                // Act
                https.get(url, (response) => {

                    // Assert
                    assert.strictEqual(response.statusCode, 200);
                    done();
                });
            });
        }

        it('should get no data for day 8', (done) => {

            // Arrange
            const url = 'https://www.rbb24.de/include/wetter/data/data_bb_8.xml';

            // Act
            https.get(url, (response) => {

                // Assert
                assert.strictEqual(response.statusCode, 404);
                done();
            });
        });
    });

    describe('content', () => {

        it('should get valid current data', (done) => {

            // Arrange
            const xsd = fs.readFileSync(path.join(__dirname, 'endpoint_current.xsd'));
            const xsdDoc = libxml.parseXml(xsd);

            const url = 'https://www.rbb24.de/include/wetter/data/data_bb_0.xml';

            // Act
            https.get(url, (response) => {

                let xml = '';
                response.on('data', (chunk) => {
                    xml += chunk;
                });

                response.on('end', () => {

                    // Parse XML
                    const xmlDoc = libxml.parseXml(xml);

                    // Assert
                    assert.strictEqual(xmlDoc.validate(xsdDoc), true);
                    done();
                });
            });
        });

        for (let day = 1; day <= 7; day++) {
            it(`should get valid forecast data for day ${day}`, (done) => {

                // Arrange
                const xsd = fs.readFileSync(path.join(__dirname, 'endpoint_forecast.xsd'));
                const xsdDoc = libxml.parseXml(xsd);

                const url = `https://www.rbb24.de/include/wetter/data/data_bb_${day}.xml`;

                // Act
                https.get(url, (response) => {

                    let xml = '';
                    response.on('data', (chunk) => {
                        xml += chunk;
                    });

                    response.on('end', () => {

                        // Parse XML
                        const xmlDoc = libxml.parseXml(xml);

                        // Assert
                        assert.strictEqual(xmlDoc.validate(xsdDoc), true);
                        done();
                    });
                });
            });
        }
    });
});
