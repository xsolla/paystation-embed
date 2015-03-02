var $ = require('jquery');
var _ = require('lodash');
var PostMessage = require('postmessage');

module.exports = (function () {
    function ChildWindow() {
        this.eventObject = $({});
    }

    /** Private Members **/
    ChildWindow.prototype.eventObject = null;
    ChildWindow.prototype.childWindow = null;

    ChildWindow.prototype.triggerEvent = function () {
        this.eventObject.trigger.apply(this.eventObject, arguments);
    };

    /** Public Members **/
    ChildWindow.prototype.open = function(url) {
        if (this.childWindow && !this.childWindow.closed) {
            this.childWindow.location.href = url;
        }

        this.childWindow = global.window.open(url);
        this.childWindow.focus();

        var checkWindow = _.bind(function () {
            if (this.childWindow) {
                if (this.childWindow.closed) {
                    this.triggerEvent('close');
                } else {
                    timer = global.setTimeout(checkWindow, 100);
                }
            }
        }, this);
        var timer = global.setTimeout(checkWindow, 100);
        this.on('close', _.bind(function (event) {
            if (timer) {
                global.clearTimeout(timer);
            }
            if (this.childWindow) {
                this.childWindow.close();
            }
            $(event.target).off(event);
        }, this));

        // Cross-window communication
        var message = new PostMessage(this.childWindow);
        message.on('dimensions widget-detection', _.bind(function (event) {
            this.triggerEvent('load');
            $(event.target).off(event);
        }, this));
        message.on('status', _.bind(function (event, data) {
            self.triggerEvent('status', data);
        }, this));
        this.on('close', function (event) {
            if (message) {
                message.off();
            }
            $(event.target).off(event);
        });

        this.triggerEvent('open');
    };

    ChildWindow.prototype.close = function() {
        this.triggerEvent('close');
    };

    ChildWindow.prototype.on = function () {
        this.eventObject.on.apply(this.eventObject, arguments);
    };

    ChildWindow.prototype.off = function () {
        this.eventObject.off.apply(this.eventObject, arguments);
    };

    return ChildWindow;
})();
