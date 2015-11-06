var $ = require('jquery');
var _ = require('lodash');

module.exports = (function () {
    function PostMessage(window) {
        this.eventObject = $({});
        this.linkedWindow = window;

        global.window.addEventListener && global.window.addEventListener("message", _.bind(function (event) {
            if (event.source !== this.linkedWindow) {
                return;
            }

            var message = {};
            if (_.isString(event.data) && !_.isUndefined(global.JSON)) {
                try {
                    message = global.JSON.parse(event.data);
                } catch (e) {
                }
            }

            if (message.command) {
                this.eventObject.trigger(message.command, message.data);
            }
        }, this));
    }

    /** Private Members **/
    PostMessage.prototype.eventObject = null;
    PostMessage.prototype.linkedWindow = null;

    /** Public Members **/
    PostMessage.prototype.send = function(command, data, targetOrigin) {
        if (_.isUndefined(data)) {
            data = {};
        }

        if (_.isUndefined(targetOrigin)) {
            targetOrigin = '*';
        }

        if (!this.linkedWindow || _.isUndefined(this.linkedWindow.postMessage) || _.isUndefined(global.window.JSON)) {
            return false;
        }

        try {
            this.linkedWindow.postMessage(global.JSON.stringify({data: data, command: command}), targetOrigin);
        } catch (e) {
        }

        return true;
    };

    PostMessage.prototype.on = function () {
        this.eventObject.on.apply(this.eventObject, arguments);
    };

    PostMessage.prototype.off = function () {
        this.eventObject.off.apply(this.eventObject, arguments);
    };

    return PostMessage;
})();
