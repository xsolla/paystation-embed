var $ = require('jquery');
var _ = require('lodash');

module.exports = (function () {
    function Device() {
    }

    var window = global.window;

    /**
     * Mobile devices
     * @returns {boolean}
     */
    Device.prototype.isMobile = function() {
        return !_.isUndefined(window.orientation) ||
            window.navigator.userAgent.match(/IEMobile/i) ||
            window.navigator.userAgent.match(/Opera Mobi/i);
    };

    return Device;
})();
