const proxyquire = require('proxyquire').noCallThru();

const assert = require('assert');
const sinon = require('sinon');

const helperFake = {
    create: function(helperDefinition) {
        return helperDefinition;
    }
};

const LoggerFake = {
    log: function() {},
    info: function() {},
    warn: function() {}
};

const HttpsFake = {
    get: function() {}
};

describe('node_helper', () => {

    // Tested
    let helper;

    beforeEach(() => {
        helper = proxyquire(
            '../../node_helper',
            { 'node_helper': helperFake, './Logger': LoggerFake, 'https': HttpsFake });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('socketNotificationReceived', () => {

        it('should set config and load data when notification is received', () => {

            // Arrange
            helper.loadData = sinon.fake();

            // Act
            helper.socketNotificationReceived('LOAD_DATA', { test: 'data' });

            // Assert
            assert.deepStrictEqual(helper.config, { test: 'data' });
            assert.ok(helper.loadData.calledOnce);
        });

        it('should restrict maximum days to seven', () => {

            // Arrange
            helper.loadData = sinon.fake();

            // Act
            helper.socketNotificationReceived('LOAD_DATA', { days: 8 });

            // Assert
            assert.deepStrictEqual(helper.config, { days: 7 });
        });

        it('should do nothing if notification is unknown', () => {

            // Arrange
            helper.loadData = sinon.fake();

            // Act
            helper.socketNotificationReceived('UNKNOWN_NOTIFICATION');

            // Assert
            assert.strictEqual(helper.config, null);
            assert.ok(helper.loadData.notCalled);
        });
    });

    describe('loadData', () => {

        it('should send socket notification with fetched data', async () => {

            // Arrange
            helper.config = { days: 0 };

            let resolvedPromise = new Promise((resolve) => {
                resolve({ test: 'data' });
            });
            helper.fetchDayData = sinon.fake.returns(resolvedPromise);
            helper.sendSocketNotification = sinon.fake();

            // Act
            await helper.loadData();

            // Assert
            assert.ok(helper.sendSocketNotification.calledWith('DATA_LOADED', [{ test: 'data' }]));
        });

        it('should send socket notification with cached data when error occures', async () => {

            // Arrange
            helper.config = { days: 0 };
            helper.cache = 'cached';

            helper.fetchDayData = sinon.fake.throws('test');
            helper.sendSocketNotification = sinon.fake();

            // Act
            await helper.loadData({ days: 0 });

            // Assert
            assert.ok(helper.sendSocketNotification.calledWith('DATA_LOADED', 'cached'));
        });

        it('should do nothing when error occurs and no cache is available', async () => {

            // Arrange
            helper.config = { days: 0 };

            helper.fetchDayData = sinon.fake.throws('test');
            helper.sendSocketNotification = sinon.fake();

            // Act
            await helper.loadData({ days: 0 });

            // Assert
            assert.ok(helper.sendSocketNotification.notCalled);
        });
    });

    describe('fetchDayData', () => {

        it('should request the RBB url', () => {

            // Arrange
            HttpsFake.get = sinon.fake();

            // Act
            helper.fetchDayData(0);

            // Assert
            assert.ok(HttpsFake.get.calledWith(
                'https://www.rbb24.de/include/wetter/data/data_bb_0.xml'));
        });

        it('should define listener for all events', async () => {

            // Arrange
            let responseFake = {
                on: sinon.fake((event, callback) => {
                    if (event === 'end') {
                        callback(); // Need this call for resolving the promise
                    }
                })
            };

            HttpsFake.get = async function(url, callback) {
                await callback(responseFake);
            };

            helper.parseData = sinon.fake();

            // Act
            await helper.fetchDayData();

            // Assert
            assert.ok(responseFake.on.calledWith('data'));
            assert.ok(responseFake.on.calledWith('error'));
            assert.ok(responseFake.on.calledWith('timeout'));
            assert.ok(responseFake.on.calledWith('end'));
        });

        it('should chunk xml data and parse on end of response', async () => {

            // Arrange
            let responseFake = {
                on: function(event, callback) {
                    if (event === 'data') {
                        callback('chunk');
                    }
                    if (event === 'end') {
                        callback();
                    }
                }
            };

            HttpsFake.get = async function(url, callback) {
                await callback(responseFake);
            };

            helper.parseData = sinon.fake((xml) => { return xml + ' parsed'; });

            // Act
            let data = await helper.fetchDayData();

            // Assert
            assert.strictEqual(data, 'chunk parsed');
        });

        it('should reject on error', async () => {

            // Arrange
            let responseFake = {
                on: function(event, callback) {
                    if (event === 'error') {
                        callback(new Error('error message'));
                    }
                }
            };

            HttpsFake.get = async function(url, callback) {
                await callback(responseFake);
            };

            // Act / Assert
            await assert.rejects(async () => {
                await helper.fetchDayData();
            }, Error('error message'));
        });

        it('should reject on timeout', async () => {

            // Arrange
            let responseFake = {
                on: function(event, callback) {
                    if (event === 'timeout') {
                        callback(new Error('timeout message'));
                    }
                }
            };

            HttpsFake.get = async function(url, callback) {
                await callback(responseFake);
            };

            // Act / Assert
            await assert.rejects(async () => {
                await helper.fetchDayData();
            }, Error('timeout message'));
        });
    });

    describe('parseData', () => {

        it('should return weather data', () => {

            // Arrange
            helper.config = { id: '2a' };
            let xml = '<data><city id="1" test="other"/><city id="2" test="data"/></data>';

            // Act
            let data = helper.parseData(xml, 1);

            // Assert
            assert.deepStrictEqual(data, { id: '2', test: 'data' });
        });

        it('should return nothing if xml parsing fails', () => {

            // Arrange
            let xml = 'no valid xml';

            // Act
            let data = helper.parseData(xml, 0);

            // Assert
            assert.deepStrictEqual(data, {});
        });

        it('should return nothing if no city id matches', () => {

            // Arrange
            helper.config = { id: 'no matching id' };
            let xml = '<data><city id="1" test="other"/><city id="2" test="data"/></data>';

            // Act
            let data = helper.parseData(xml, 0);

            // Assert
            assert.deepStrictEqual(data, {});
        });
    });
});
