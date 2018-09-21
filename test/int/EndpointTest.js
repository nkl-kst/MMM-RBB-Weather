const assert = require('assert');

const fs = require('fs');
const path = require('path');
const https = require('https');
const libxml = require('libxmljs');

describe("Endpoints", function() {

    this.timeout(10000);

    describe("availability", () => {

        for (let day = 0; day <= 7; day++) {
            it(`should get data for day ${day}`, (done) => {

                // Arrange
                let url = `https://www.rbb24.de/include/wetter/data/data_bb_${day}.xml`;

                // Act
                https.get(url, (response) => {

                    // Assert
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        }
    });

    describe("content", () => {

        it("should get valid current data", (done) => {

            // Arrange
            let xsd = fs.readFileSync(path.join(__dirname, 'endpoint_current.xsd'));
            let xsdDoc = libxml.parseXml(xsd);

            let url = `https://www.rbb24.de/include/wetter/data/data_bb_0.xml`;

            // Act
            https.get(url, (response) => {

                let xml = "";
                response.on('data', (chunk) => {
                    xml += chunk;
                });

                response.on('end', () => {

                    // Parse XML
                    let xmlDoc = libxml.parseXml(xml);

                    // Assert
                    assert.equal(xmlDoc.validate(xsdDoc), true);
                    done();
                });
            });
        });

        for (let day = 1; day <= 7; day++) {
            it(`should get valid forecast data for day ${day}`, (done) => {

                // Arrange
                let xsd = fs.readFileSync(path.join(__dirname, 'endpoint_forecast.xsd'));
                let xsdDoc = libxml.parseXml(xsd);

                let url = `https://www.rbb24.de/include/wetter/data/data_bb_${day}.xml`;

                // Act
                https.get(url, (response) => {

                    let xml = "";
                    response.on('data', (chunk) => {
                        xml += chunk;
                    });

                    response.on('end', () => {

                        // Parse XML
                        let xmlDoc = libxml.parseXml(xml);

                        // Assert
                        assert.equal(xmlDoc.validate(xsdDoc), true);
                        done();
                    });
                });
            });
        }
    });
});
