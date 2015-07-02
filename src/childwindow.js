var $ = require('jquery');
var _ = require('lodash');
var PostMessage = require('postmessage');

module.exports = (function () {
    function ChildWindow() {
        this.eventObject = $({});
    }

    var DEFAULT_OPTIONS = {
        target: '_blank'
    };

    /** Private Members **/
    ChildWindow.prototype.eventObject = null;
    ChildWindow.prototype.childWindow = null;

    ChildWindow.prototype.triggerEvent = function () {
        this.eventObject.trigger.apply(this.eventObject, arguments);
    };

    /** Public Members **/
    ChildWindow.prototype.open = function (url, options) {
        options = _.extend({}, DEFAULT_OPTIONS, options);

        if (this.childWindow && !this.childWindow.closed) {
            this.childWindow.location.href = url;
        }

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
        message.on('widget-detection', function () {
            message.send('widget-detected', {version: version});
        });
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

        switch (options.target) {
            case '_self':
                global.window.location.href = url;
                break;
            case '_parent':
                global.window.parent.location.href = url;
                break;
            case '_blank':
            default:
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
                break;
        }
    };

    ChildWindow.prototype.close = function () {
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
