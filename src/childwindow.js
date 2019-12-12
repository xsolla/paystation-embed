var version = require('./version');
var PostMessage = require('./postmessage');

module.exports = (function () {
    function ChildWindow() {
        this.eventObject = {
            trigger: (function(eventName, data) {
                var eventInNamespace = wrapEventInNamespace(eventName);
                try {
                    var event = new CustomEvent(eventInNamespace, {detail: data}); // Not working in IE
                } catch(e) {
                    var event = document.createEvent('CustomEvent');
                    event.initCustomEvent(eventInNamespace, true, true, data);
                }
                document.dispatchEvent(event);
            }).bind(this),
            on: (function(eventName, handle, options) {
                var eventInNamespace = wrapEventInNamespace(eventName);
                document.addEventListener(eventInNamespace, handle, options);
            }).bind(this),
            off: (function(eventName, handle, options) {
                var eventInNamespace = wrapEventInNamespace(eventName);
                document.removeEventListener(eventInNamespace, handle, options);
            }).bind(this)
        };
        this.message = null;
    }

    function wrapEventInNamespace(eventName) {
        return eventName + '_' + ChildWindow._NAMESPACE;
    }

    var DEFAULT_OPTIONS = {
        target: '_blank'
    };

    /** Private Members **/
    ChildWindow.prototype.eventObject = null;
    ChildWindow.prototype.childWindow = null;

    ChildWindow.prototype.triggerEvent = function (event, data) {
        this.eventObject.trigger(event, data);
    };

    /** Public Members **/
    ChildWindow.prototype.open = function (url, options) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);

        if (this.childWindow && !this.childWindow.closed) {
            this.childWindow.location.href = url;
        }

        var addHandlers = (function () {
            this.on('close', (function handleClose(event) {
                if (timer) {
                    global.clearTimeout(timer);
                }
                if (this.childWindow) {
                    this.childWindow.close();
                }

                event.target.removeEventListener('close', handleClose)
            }).bind(this));

            // Cross-window communication
            this.message = new PostMessage(this.childWindow);
            this.message.on('dimensions widget-detection', (function widgetDetectionHandle(event) {
                this.triggerEvent('load');
                event.target.removeEventListener('dimensions widget-detection', handleWidgetDetection);
            }).bind(this));
            this.message.on('widget-detection', (function () {
                this.message.send('widget-detected', {version: version, childWindowOptions: options});
            }).bind(this));
            this.message.on('status', (function (event, data) {
                this.triggerEvent('status', data);
            }).bind(this));
            this.on('close', (function handleClose(event) {
                this.message.off();
                event.target.removeEventListener('close', handleClose);
            }).bind(this));
        }).bind(this);

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

                var checkWindow = (function () {
                    if (this.childWindow) {
                        if (this.childWindow.closed) {
                            this.triggerEvent('close');
                        } else {
                            timer = global.setTimeout(checkWindow, 100);
                        }
                    }
                }).bind(this);
                var timer = global.setTimeout(checkWindow, 100);
                break;
        }

        this.triggerEvent('open');
    };

    ChildWindow.prototype.close = function () {
        this.triggerEvent('close');
    };

    ChildWindow.prototype.on = function (event, handler) {
        if (typeof handler !== 'function') {
            return;
        }

        this.eventObject.on(event, handler);
    };

    ChildWindow.prototype.off = function (event, handler) {
        this.eventObject.off(event, handler);
    };

    ChildWindow.prototype.getPostMessage = function () {
        return this.message;
    };

    ChildWindow._NAMESPACE = 'CHILD_WINDOW';

    return ChildWindow;
})();
