var $ = require('jquery');
var _ = require('lodash');
var version = require('./version');
var PostMessage = require('./postmessage');

module.exports = (function () {
    function ChildWindow() {
        this.eventObject = $({});
        this.message = null;
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

        var addHandlers = _.bind(function () {
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
            this.message = new PostMessage(this.childWindow);
            this.message.on('dimensions widget-detection', _.bind(function (event) {
                this.triggerEvent('load');
                $(event.target).off(event);
            }, this));
            this.message.on('widget-detection', _.bind(function () {
                this.message.send('widget-detected', {version: version, childWindowOptions: options});
            }, this));
            this.message.on('status', _.bind(function (event, data) {
                this.triggerEvent('status', data);
            }, this));
            this.on('close', _.bind(function (event) {
                this.message.off();
                $(event.target).off(event);
            }, this));
        }, this);

        switch (options.target) {
            case '_self':
                this.childWindow = global.window;
                addHandlers();
                this.childWindow.location.href = url;
                break;
            case '_parent':
                this.childWindow = global.window.parent;
                addHandlers();
                this.childWindow.location.href = url;
                break;
            case '_blank':
            default:
                this.childWindow = global.window.open(url);
                this.childWindow.focus();
                addHandlers();

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

        this.triggerEvent('open');
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

    ChildWindow.prototype.getPostMessage = function () {
        return this.message;
    };

    return ChildWindow;
})();
