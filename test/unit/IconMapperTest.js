const assert = require('assert');
const sinon = require('sinon');

require('../../IconMapper');

describe('IconMapper', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('getIconPath', () => {

        it("should return 'day' path if RBB name is '100000'", () => {

            // Act
            const path = IconMapper.getIconPath('100000', 'subfolder');

            // Assert
            assert.strictEqual(path, 'vendor/amcharts/subfolder/day.svg');
        });

        it('should return undefined when rbb name is not mapped', () => {

            // Assert
            IconMapper._log = sinon.fake();

            // Act
            const path = IconMapper.getIconPath('notmapped', 'subfolder');

            // Assert
            assert.strictEqual(path, undefined);
        });

        it('should log not mapped RBB icons', () => {

            // Arrange
            IconMapper._log = sinon.spy();

            // Act
            IconMapper.getIconPath('notmapped', 'subfolder');

            // Assert
            assert.ok(IconMapper._log.calledWithMatch('notmapped'));
        });
    });
});
