var _ = require('lodash');
var $ = require('jquery');
var App = require('./app');

var instance;

module.exports = (function () {
    var getInstance = function () {
        if (!instance) {
            instance = new App();
        }
        return instance;
    };

    return _.extend(_.object(_.map(['init', 'open', 'on', 'off', 'sendMessage', 'onMessage'], function (methodName) {
        var app = getInstance();
        return [methodName, function () {
            return app[methodName].apply(app, arguments);
        }];
    })), {
        eventTypes: App.eventTypes,
        $: $
    });
})();
