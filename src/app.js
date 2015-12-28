var $ = require('jquery');
var _ = require('lodash');
var Exception = require('exception');
var LightBox = require('lightbox');
var ChildWindow = require('childwindow');
var Device = require('device');

module.exports = (function () {
    function App() {
        this.config = _.extend({}, DEFAULT_CONFIG);
        this.eventObject = $({});
        this.isInitiated = false;
        this.postMessage = null;
    }

    App.eventTypes = {
        INIT: 'init',
        OPEN: 'open',
        OPEN_WINDOW: 'open-window',
        OPEN_LIGHTBOX: 'open-lightbox',
        LOAD: 'load',
        CLOSE: 'close',
        CLOSE_WINDOW: 'close-window',
        CLOSE_LIGHTBOX: 'close-lightbox',
        STATUS: 'status',
        STATUS_INVOICE: 'status-invoice',
        STATUS_DELIVERING: 'status-delivering',
        STATUS_TROUBLED: 'status-troubled',
        STATUS_DONE: 'status-done'
    };

    var PAYSTATION_URL = 'https://secure.xsolla.com/paystation2/?';
    var SANDBOX_PAYSTATION_URL = 'https://sandbox-secure.xsolla.com/paystation2/?';
    var DEFAULT_CONFIG = {
        access_token: null,
        sandbox: false,
        lightbox: {},
        childWindow: {}
    };
    var EVENT_NAMESPACE = '.xpaystation-widget';
    var ATTR_PREFIX = 'data-xpaystation-widget';

    /** Private Members **/
    App.prototype.config = {};
    App.prototype.isInitiated = false;
    App.prototype.eventObject = $({});

    App.prototype.checkConfig = function () {
        if (_.isEmpty(this.config.access_token)) {
            this.throwError('No access token given');
        }
    };

    App.prototype.checkApp = function () {
        if (_.isUndefined(this.isInitiated)) {
            this.throwError('Initialize widget before opening');
        }
    };

    App.prototype.throwError = function (message) {
        throw new Exception(message);
    };

    App.prototype.triggerEvent = function () {
        this.eventObject.trigger.apply(this.eventObject, arguments);
    };

    /**
     * Initialize widget with options
     * @param options
     */
    App.prototype.init = function (options) {
        this.isInitiated = true;
        this.config = _.extend({}, DEFAULT_CONFIG, options);

        var bodyElement = $(global.document.body);
        bodyElement.off(EVENT_NAMESPACE);
        bodyElement.on('click' + EVENT_NAMESPACE, '[' + ATTR_PREFIX + '-open]', _.bind(function () {
            this.open();
        }, this));

        this.triggerEvent(App.eventTypes.INIT);
    };

    /**
     * Open payment interface (PayStation)
     */
    App.prototype.open = function () {
        this.checkConfig();
        this.checkApp();

        var triggerSplitStatus = _.bind(function (data) {
            switch (((data || {}).paymentInfo || {}).status) {
                case 'invoice': this.triggerEvent(App.eventTypes.STATUS_INVOICE, data); break;
                case 'delivering': this.triggerEvent(App.eventTypes.STATUS_DELIVERING, data); break;
                case 'troubled': this.triggerEvent(App.eventTypes.STATUS_TROUBLED, data); break;
                case 'done': this.triggerEvent(App.eventTypes.STATUS_DONE, data); break;
            }
        }, this);

        var device = new Device;
        var url = (this.config.sandbox ? SANDBOX_PAYSTATION_URL : PAYSTATION_URL) + $.param({
            access_token: this.config.access_token
        });

        this.postMessage = null;
        if (device.isMobile()) {
            var childWindow = new ChildWindow;
            childWindow.on('open', _.bind(function () {
                this.postMessage = childWindow.getPostMessage();
                this.triggerEvent(App.eventTypes.OPEN);
                this.triggerEvent(App.eventTypes.OPEN_WINDOW);
            }, this));
            childWindow.on('load', _.bind(function () {
                this.triggerEvent(App.eventTypes.LOAD);
            }, this));
            childWindow.on('close', _.bind(function () {
                this.triggerEvent(App.eventTypes.CLOSE);
                this.triggerEvent(App.eventTypes.CLOSE_WINDOW);
            }, this));
            childWindow.on('status', _.bind(function (event, statusData) {
                this.triggerEvent(App.eventTypes.STATUS, statusData);
                triggerSplitStatus(statusData);
            }, this));
            childWindow.open(url, this.config.childWindow);
        } else {
            var lightBox = new LightBox;
            lightBox.on('open', _.bind(function () {
                this.postMessage = lightBox.getPostMessage();
                this.triggerEvent(App.eventTypes.OPEN);
                this.triggerEvent(App.eventTypes.OPEN_LIGHTBOX);
            }, this));
            lightBox.on('load', _.bind(function () {
                this.triggerEvent(App.eventTypes.LOAD);
            }, this));
            lightBox.on('close', _.bind(function () {
                this.triggerEvent(App.eventTypes.CLOSE);
                this.triggerEvent(App.eventTypes.CLOSE_LIGHTBOX);
            }, this));
            lightBox.on('status', _.bind(function (event, statusData) {
                this.triggerEvent(App.eventTypes.STATUS, statusData);
                triggerSplitStatus(statusData);
            }, this));
            lightBox.openFrame(url, this.config.lightbox);
        }
    };

    /**
     * Attach an event handler function for one or more events to the widget
     * @param event One or more space-separated event types (init, open, load, close, status, status-invoice, status-delivering, status-troubled, status-done)
     * @param handler A function to execute when the event is triggered
     */
    App.prototype.on = function (event, handler) {
        if (!_.isFunction(handler)) {
            return;
        }

        this.eventObject.on(event, handler);
    };

    /**
     * Remove an event handler
     * @param event One or more space-separated event types
     * @param handler A handler function previously attached for the event(s)
     */
    App.prototype.off = function (event, handler) {
        this.eventObject.off(event, handler);
    };

    /**
     * Send a message directly to PayStation
     * @param command
     * @param data
     */
    App.prototype.sendMessage = function (command, data) {
        if (this.postMessage) {
            this.postMessage.send.apply(this.postMessage, arguments);
        }
    };

    /**
     * Attach an event handler function for message event from PayStation
     * @param command
     * @param handler
     */
    App.prototype.onMessage = function (command, handler) {
        if (this.postMessage) {
            this.postMessage.on.apply(this.postMessage, arguments);
        }
    };

    return App;
})();
