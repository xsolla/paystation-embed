var _ = require('lodash');

module.exports = function (message) {
    this.message = message;
    this.name = "XsollaPayStationWidgetException";
    this.toString = _.bind(function () {
        return this.name + ': ' + this.message;
    }, this);
};
