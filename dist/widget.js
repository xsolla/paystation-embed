(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.XPayStationWidget = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],2:[function(require,module,exports){
module.exports = require('cssify');
},{"cssify":1}],3:[function(require,module,exports){
(function (global){
var Helpers = require('./helpers');
var Exception = require('./exception');
var LightBox = require('./lightbox');
var ChildWindow = require('./childwindow');
var Device = require('./device');

module.exports = (function () {
    function ready(fn) {
        if (document.readyState !== 'loading'){
          fn();
        } else {
          document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function App() {
        this.config = Object.assign({}, DEFAULT_CONFIG);
        this.eventObject = Helpers.addEventObject(this);
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
        STATUS_DONE: 'status-done',
        USER_COUNTRY: 'user-country'
    };

    var DEFAULT_CONFIG = {
        access_token: null,
        access_data: null,
        sandbox: false,
        lightbox: {},
        childWindow: {},
        host: 'secure.xsolla.com',
        iframeOnly: false
    };
    var SANDBOX_PAYSTATION_URL = 'https://sandbox-secure.xsolla.com/paystation2/?';
    var EVENT_NAMESPACE = '.xpaystation-widget';
    var ATTR_PREFIX = 'data-xpaystation-widget-open';

    /** Private Members **/
    App.prototype.config = {};
    App.prototype.isInitiated = false;
    App.prototype.eventObject = Helpers.addEventObject(this);

    App.prototype.getPaymentUrl = function () {
        if (this.config.payment_url) {
            return this.config.payment_url;
        }

        const query = {};
        if (this.config.access_token) {
            query.access_token = this.config.access_token;
        } else {
            query.access_data = JSON.stringify(this.config.access_data);
        }

        const urlWithoutQueryParams = this.config.sandbox ?
            SANDBOX_PAYSTATION_URL :
            'https://' + this.config.host + '/paystation2/?';
        return urlWithoutQueryParams + Helpers.param(query);
    };

    App.prototype.checkConfig = function () {
        if (Helpers.isEmpty(this.config.access_token) && Helpers.isEmpty(this.config.access_data) && Helpers.isEmpty(this.config.payment_url)) {
            this.throwError('No access token or access data or payment URL given');
        }

        if (!Helpers.isEmpty(this.config.access_data) && typeof this.config.access_data !== 'object') {
            this.throwError('Invalid access data format');
        }

        if (Helpers.isEmpty(this.config.host)) {
            this.throwError('Invalid host');
        }
    };

    App.prototype.checkApp = function () {
        if (this.isInitiated === undefined) {
            this.throwError('Initialize widget before opening');
        }
    };

    App.prototype.throwError = function (message) {
        throw new Exception(message);
    };

    App.prototype.triggerEvent = function (eventName, data) {
        if (arguments.length === 1) {
            [].forEach.call(arguments, (function (eventName) {
                var event = document.createEvent('HTMLEvents');
                event.initEvent(eventName, true, false);
                document.dispatchEvent(event);
            }).bind(this));
        } else {
            this.eventObject.trigger(eventName, data);
        }
    };

    App.prototype.triggerCustomEvent = function (eventName, data) {
        try {
            var event = new CustomEvent(eventName, {detail: data}); // Not working in IE
        } catch(e) {
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent(eventName, true, true, data);
        }
        document.dispatchEvent(event);
    };

    /**
     * Initialize widget with options
     * @param options
     */
    App.prototype.init = function(options) {
        function initialize(options) {
            this.isInitiated = true;
            this.config = Object.assign({}, DEFAULT_CONFIG, options);

            var bodyElement = global.document.body;
            var clickEventName = 'click' + EVENT_NAMESPACE;

            var handleClickEvent = (function(event) {
                var targetElement = document.querySelector('[' + ATTR_PREFIX + ']');
                if (event.sourceEvent.target === targetElement) {
                    this.open.call(this, targetElement);
                }
            }).bind(this);

            bodyElement.removeEventListener(clickEventName, handleClickEvent);

            var clickEvent = document.createEvent('Event');
            clickEvent.initEvent(clickEventName, false, true);

            bodyElement.addEventListener('click', (function(event) {
                clickEvent.sourceEvent = event;
                bodyElement.dispatchEvent(clickEvent);
            }).bind(this), false);

            bodyElement.addEventListener(clickEventName, handleClickEvent);
            this.triggerEvent(App.eventTypes.INIT);
        }
        ready(initialize.bind(this, options));
    }

    /**
     * Open payment interface (PayStation)
     */
    App.prototype.open = function () {
        this.checkConfig();
        this.checkApp();

        var triggerSplitStatus = (function (data) {
            switch (((data || {}).paymentInfo || {}).status) {
                case 'invoice':
                    this.triggerEvent(App.eventTypes.STATUS_INVOICE, data);
                    break;
                case 'delivering':
                    this.triggerEvent(App.eventTypes.STATUS_DELIVERING, data);
                    break;
                case 'troubled':
                    this.triggerEvent(App.eventTypes.STATUS_TROUBLED, data);
                    break;
                case 'done':
                    this.triggerEvent(App.eventTypes.STATUS_DONE, data);
                    break;
            }
        }).bind(this);

        var url = this.getPaymentUrl();
        var that = this;

        function handleStatus(event) {
            var statusData = event.detail;
            that.triggerEvent(App.eventTypes.STATUS, statusData);
            triggerSplitStatus(statusData);
        }

        function handleUserLocale(event) {
            var userCountry = {
                user_country: event.detail.user_country
            };
            that.triggerCustomEvent(App.eventTypes.USER_COUNTRY, userCountry);
        }

        this.postMessage = null;
        if ((new Device).isMobile() && !this.config.iframeOnly) {
            var childWindow = new ChildWindow;
            childWindow.on('open', function handleOpen() {
                that.postMessage = childWindow.getPostMessage();
                that.triggerEvent(App.eventTypes.OPEN);
                that.triggerEvent(App.eventTypes.OPEN_WINDOW);
                childWindow.off('open', handleOpen);
            });
            childWindow.on('load', function handleLoad() {
                that.triggerEvent(App.eventTypes.LOAD);
                childWindow.off('load', handleLoad);
            });
            childWindow.on('close', function handleClose() {
                that.triggerEvent(App.eventTypes.CLOSE);
                that.triggerEvent(App.eventTypes.CLOSE_WINDOW);
                childWindow.off('status', handleStatus);
                childWindow.off(App.eventTypes.USER_COUNTRY, handleUserLocale);
                childWindow.off('close', handleClose);
            });
            childWindow.on('status', handleStatus);
            childWindow.on(App.eventTypes.USER_COUNTRY, handleUserLocale);
            childWindow.open(url, this.config.childWindow);
        } else {
            var lightBox = new LightBox((new Device).isMobile() && this.config.iframeOnly);
            lightBox.on('open', function handleOpen() {
                that.postMessage = lightBox.getPostMessage();
                that.triggerEvent(App.eventTypes.OPEN);
                that.triggerEvent(App.eventTypes.OPEN_LIGHTBOX);
                lightBox.off('open', handleOpen);
            });
            lightBox.on('load', function handleLoad() {
                that.triggerEvent(App.eventTypes.LOAD);
                lightBox.off('load', handleLoad);
            });
            lightBox.on('close', function handleClose() {
                that.triggerEvent(App.eventTypes.CLOSE);
                that.triggerEvent(App.eventTypes.CLOSE_LIGHTBOX);
                lightBox.off('status', handleStatus);
                lightBox.off(App.eventTypes.USER_COUNTRY, handleUserLocale);
                lightBox.off('close', handleClose);
            });
            lightBox.on('status', handleStatus);
            lightBox.on(App.eventTypes.USER_COUNTRY, handleUserLocale);
            lightBox.openFrame(url, this.config.lightbox);
        }
    };

    /**
     * Attach an event handler function for one or more events to the widget
     * @param event One or more space-separated event types (init, open, load, close, status, status-invoice, status-delivering, status-troubled, status-done)
     * @param handler A function to execute when the event is triggered
     */
    App.prototype.on = function (event, handler, options) {
        if (typeof handler !== 'function') {
            return;
        }

        const handlerDecorator = function(event) {
            handler(event, event.detail);
        }

        this.eventObject.on(event, handlerDecorator, options);
    };

    /**
     * Remove an event handler
     * @param event One or more space-separated event types
     * @param handler A handler function previously attached for the event(s)
     */
    App.prototype.off = function (event, handler, options) {
        this.eventObject.off(event, handler, options);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./childwindow":4,"./device":5,"./exception":6,"./helpers":7,"./lightbox":8}],4:[function(require,module,exports){
(function (global){
var version = require('./version');
var Helpers = require('./helpers');
var PostMessage = require('./postmessage');

module.exports = (function () {
    function ChildWindow() {
        this.eventObject = Helpers.addEventObject(this, wrapEventInNamespace);
        this.message = null;
    }

    function wrapEventInNamespace(eventName) {
        return ChildWindow._NAMESPACE + '_' + eventName;
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

        var that = this;
        var addHandlers = function () {
            that.on('close', function handleClose() {
                if (timer) {
                    global.clearTimeout(timer);
                }
                if (that.childWindow) {
                    that.childWindow.close();
                }

                that.off('close', handleClose)
            });

            // Cross-window communication
            that.message = new PostMessage(that.childWindow);
            that.message.on('dimensions widget-detection', function handleWidgetDetection() {
                that.triggerEvent('load');
                that.message.off('dimensions widget-detection', handleWidgetDetection);
            });
            that.message.on('widget-detection', function handleWidgetDetection() {
                that.message.send('widget-detected', {version: version, childWindowOptions: options});
                that.message.off('widget-detection', handleWidgetDetection);
            });
            that.message.on('status', function (event) {
                that.triggerEvent('status', event.detail);
            });
            that.on('close', function handleClose() {
                that.message.off();
                that.off('close', handleClose);
            });
            that.message.on('user-country', function (event) {
                that.triggerEvent('user-country', event.detail);
            });
        };

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

    ChildWindow.prototype.on = function (event, handler, options) {
        if (typeof handler !== 'function') {
            return;
        }

        this.eventObject.on(event, handler, options);
    };

    ChildWindow.prototype.off = function (event, handler, options) {
        this.eventObject.off(event, handler, options);
    };

    ChildWindow.prototype.getPostMessage = function () {
        return this.message;
    };

    ChildWindow._NAMESPACE = 'CHILD_WINDOW';

    return ChildWindow;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./helpers":7,"./postmessage":10,"./version":14}],5:[function(require,module,exports){
var bowser = require('bowser');

module.exports = (function () {
    function Device() {
    }

    /**
     * Mobile devices
     * @returns {boolean}
     */
    Device.prototype.isMobile = function() {
        return bowser.mobile || bowser.tablet;
    };

    return Device;
})();

},{"bowser":"bowser"}],6:[function(require,module,exports){
module.exports = function (message) {
    this.message = message;
    this.name = "XsollaPayStationWidgetException";
    this.toString = (function () {
        return this.name + ': ' + this.message;
    }).bind(this);
};

},{}],7:[function(require,module,exports){
function isEmpty(value) {
  return value === null || value === undefined;
}

function uniq(list) {
  return list.filter(function(x, i, a) {
    return a.indexOf(x) == i
  });
}

function zipObject(props, values) {
  var index = -1,
      length = props ? props.length : 0,
      result = {};

  if (length && !values && !Array.isArray(props[0])) {
    values = [];
  }
  while (++index < length) {
    var key = props[index];
    if (values) {
      result[key] = values[index];
    } else if (key) {
      result[key[0]] = key[1];
    }
  }
  return result;
}

function param(a) {
  var s = [];

  var add = function (k, v) {
      v = typeof v === 'function' ? v() : v;
      v = v === null ? '' : v === undefined ? '' : v;
      s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
  };

  var buildParams = function (prefix, obj) {
      var i, len, key;

      if (prefix) {
          if (Array.isArray(obj)) {
              for (i = 0, len = obj.length; i < len; i++) {
                  buildParams(
                      prefix + '[' + (typeof obj[i] === 'object' && obj[i] ? i : '') + ']',
                      obj[i]
                  );
              }
          } else if (String(obj) === '[object Object]') {
              for (key in obj) {
                  buildParams(prefix + '[' + key + ']', obj[key]);
              }
          } else {
              add(prefix, obj);
          }
      } else if (Array.isArray(obj)) {
          for (i = 0, len = obj.length; i < len; i++) {
              add(obj[i].name, obj[i].value);
          }
      } else {
          for (key in obj) {
              buildParams(key, obj[key]);
          }
      }
      return s;
  };

  return buildParams('', a).join('&');
};


function once(f) {
  return function() {
      f(arguments);
      f = function() {};
  }
}

function addEventObject(context, wrapEventInNamespace) {
    var dummyWrapper = function(event) { return event };
    var wrapEventInNamespace = wrapEventInNamespace || dummyWrapper;
    var eventsList = [];

    function isStringContainedSpace(str) {
      return / /.test(str)
    }

    return {
      trigger: (function(eventName, data) {
          var eventInNamespace = wrapEventInNamespace(eventName);
          try {
              var event = new CustomEvent(eventInNamespace, {detail: data}); // Not working in IE
          } catch(e) {
              var event = document.createEvent('CustomEvent');
              event.initCustomEvent(eventInNamespace, true, true, data);
          }
          document.dispatchEvent(event);
      }).bind(context),
      on: (function(eventName, handle, options) {

        function addEvent(eventName, handle, options) {
          var eventInNamespace = wrapEventInNamespace(eventName);
          document.addEventListener(eventInNamespace, handle, options);
          eventsList.push({name: eventInNamespace, handle: handle, options: options });
        }

        if (isStringContainedSpace(eventName)) {
          var events = eventName.split(' ');
          events.forEach(function(parsedEventName) {
            addEvent(parsedEventName, handle, options)
          })
        } else {
          addEvent(eventName, handle, options);
        }

      }).bind(context),

      off: (function(eventName, handle, options) {
        const offAllEvents = !eventName && !handle && !options;

        if (offAllEvents) {
          eventsList.forEach(function(event) {
            document.removeEventListener(event.name, event.handle, event.options);
          });
          return;
        }

        function removeEvent(eventName, handle, options) {
          var eventInNamespace = wrapEventInNamespace(eventName);
          document.removeEventListener(eventInNamespace, handle, options);
          eventsList = eventsList.filter(function(event) {
            return event.name !== eventInNamespace;
          });
        }

        if (isStringContainedSpace(eventName)) {
          var events = eventName.split(' ');
          events.forEach(function(parsedEventName) {
            removeEvent(parsedEventName, handle, options)
          })
        } else {
          removeEvent(eventName, handle, options);
        }

      }).bind(context)
  };
}

module.exports = {
  addEventObject: addEventObject,
  isEmpty: isEmpty,
  uniq: uniq,
  zipObject: zipObject,
  param: param,
  once: once,
}

},{}],8:[function(require,module,exports){
(function (global){
var version = require('./version');
var Helpers = require('./helpers');
var PostMessage = require('./postmessage');

module.exports = (function () {
    function LightBox(isMobile) {
        require('./styles/lightbox.scss');
        this.eventObject = Helpers.addEventObject(this, wrapEventInNamespace);
        this.options = isMobile ? DEFAULT_OPTIONS_MOBILE : DEFAULT_OPTIONS;
        this.message = null;
    }

    var CLASS_PREFIX = 'xpaystation-widget-lightbox';
    var COMMON_OPTIONS = {
        zIndex: 1000,
        overlayOpacity: '.6',
        overlayBackground: '#000000',
        contentBackground: '#ffffff',
        closeByKeyboard: true,
        closeByClick: true,
        modal: false,
        spinner: 'xsolla',
        spinnerColor: null,
        spinnerUrl: null,
        spinnerRotationPeriod: 0
    };
    var DEFAULT_OPTIONS = Object.assign({}, COMMON_OPTIONS, {
        width: null,
        height: '100%',
        contentMargin: '10px'
    });
    var DEFAULT_OPTIONS_MOBILE = Object.assign({}, COMMON_OPTIONS, {
        width: '100%',
        height: '100%', 
        contentMargin: '0px'
    });

    var SPINNERS = {
        xsolla: require('./spinners/xsolla.svg'),
        round: require('./spinners/round.svg'),
        none: ' '
    };

    var MIN_PS_DIMENSIONS = {
        height: 500,
        width: 600
    };

    var handleKeyupEventName = wrapEventInNamespace('keyup');
    var handleResizeEventName = wrapEventInNamespace('resize');

    var handleGlobalKeyup = function(event) {

        var clickEvent = document.createEvent('Event');
        clickEvent.initEvent(handleKeyupEventName, false, true);
        clickEvent.sourceEvent = event;

        document.body.dispatchEvent(clickEvent);
    }

    var handleSpecificKeyup = function(event) {
        if (event.sourceEvent.which == 27) {
            this.closeFrame();
        }
    }

    var handleGlobalResize = function() {
        var resizeEvent = document.createEvent('Event');
        resizeEvent.initEvent(handleResizeEventName, false, true);

        window.dispatchEvent(resizeEvent);
    }

    function wrapEventInNamespace(eventName) {
        return LightBox._NAMESPACE + '_' + eventName;
    }

    /** Private Members **/
    LightBox.prototype.triggerEvent = function () {
        this.eventObject.trigger.apply(this.eventObject, arguments);
    };

    LightBox.prototype.measureScrollbar = function () { // thx walsh: https://davidwalsh.name/detect-scrollbar-width
        var scrollDiv = document.createElement("div");
        scrollDiv.classList.add("scrollbar-measure");
        scrollDiv.setAttribute("style",
            "position: absolute;" +
            "top: -9999px" +
            "width: 50px" +
            "height: 50px" +
            "overflow: scroll"
        );

        document.body.appendChild(scrollDiv);

        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);

        return scrollbarWidth;
    };

    /** Public Members **/
    LightBox.prototype.openFrame = function (url, options) {
        this.options = Object.assign({}, this.options, options);
        var HandleBoundSpecificKeyup = handleSpecificKeyup.bind(this);
        options = this.options;

        var spinner = options.spinner === 'custom' && !!options.spinnerUrl ?
            '<img class="spinner-custom" src="' + encodeURI(options.spinnerUrl) + '" />' : SPINNERS[options.spinner] || Object.values(SPINNERS)[0];

        var template = function (settings) {
            var host = document.createElement('div');
            host.className = settings.prefix;

            var overlay = document.createElement('div');
            overlay.className = settings.prefix + '-overlay';

            var content = document.createElement('div');
            content.className = settings.prefix + '-content' + ' ' + settings.prefix + '-content__hidden';

            var iframe = document.createElement('iframe');
            iframe.className = settings.prefix + '-content-iframe';
            iframe.src = settings.url;
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;

            var spinner = document.createElement('div');
            spinner.className = settings.prefix + '-spinner';
            spinner.innerHTML = settings.spinner;

            content.appendChild(iframe);

            host.appendChild(overlay);
            host.appendChild(content);
            host.appendChild(spinner);

            return host;
        };

        var bodyElement = global.document.body;
        var lightBoxElement = template({
            prefix: CLASS_PREFIX,
            url: url,
            spinner: spinner
        });
        var lightBoxOverlayElement = lightBoxElement.querySelector('.' + CLASS_PREFIX + '-overlay');
        var lightBoxContentElement = lightBoxElement.querySelector('.' + CLASS_PREFIX + '-content');
        var lightBoxIframeElement = lightBoxContentElement.querySelector('.' + CLASS_PREFIX + '-content-iframe');
        var lightBoxSpinnerElement = lightBoxElement.querySelector('.' + CLASS_PREFIX + '-spinner');

        var psDimensions = {
            width: withDefaultPXUnit(MIN_PS_DIMENSIONS.width),
            height: withDefaultPXUnit(MIN_PS_DIMENSIONS.height)
        };

        function withDefaultPXUnit(value) {
            var isStringWithoutUnit = typeof value === 'string' && String(parseFloat(value)).length === value.length;
            if (isStringWithoutUnit) {
                return value + 'px';
            }
            return typeof value === 'number' ? value + 'px' : value
        }

        lightBoxElement.style.zIndex = options.zIndex;

        lightBoxOverlayElement.style.opacity = options.overlayOpacity;
        lightBoxOverlayElement.style.backgroundColor = options.overlayBackground;

        lightBoxContentElement.style.backgroundColor = options.contentBackground;
        lightBoxContentElement.style.margin = withDefaultPXUnit(options.contentMargin);
        lightBoxContentElement.style.width = options.width ? withDefaultPXUnit(options.width) : 'auto';
        lightBoxContentElement.style.height = options.height ? withDefaultPXUnit(options.height) : 'auto';

        if (options.spinnerColor) {
            lightBoxSpinnerElement.querySelector('path').style.fill = options.spinnerColor;
        }

        if (options.spinner === 'custom') {
            var spinnerCustom = lightBoxSpinnerElement.querySelector('.spinner-custom');
            spinnerCustom.style['-webkit-animation-duration'] = options.spinnerRotationPeriod + 's;';
            spinnerCustom.style['animation-duration'] = options.spinnerRotationPeriod + 's;';
        }

        if (options.closeByClick) {
            lightBoxOverlayElement.addEventListener('click', (function () {
                this.closeFrame();
            }).bind(this));
        }

        bodyElement.appendChild(lightBoxElement);

        if (options.closeByKeyboard) {

            bodyElement.addEventListener(handleKeyupEventName, HandleBoundSpecificKeyup);

            bodyElement.addEventListener('keyup', handleGlobalKeyup, false);
        }

        var showContent = Helpers.once((function () {
            hideSpinner(options);
            lightBoxContentElement.classList.remove(CLASS_PREFIX + '-content__hidden');
            this.triggerEvent('load');
        }).bind(this));

        var lightBoxResize = function () {
            var width = options.width ? options.width : psDimensions.width;
            var height = options.height ? options.height : psDimensions.height;

            lightBoxContentElement.style.left = '0px';
            lightBoxContentElement.style.top = '0px';
            lightBoxContentElement.style.borderRadius = '8px';
            lightBoxContentElement.style.width = withDefaultPXUnit(width);
            lightBoxContentElement.style.height = withDefaultPXUnit(height);

            var containerWidth = lightBoxElement.clientWidth,
                containerHeight = lightBoxElement.clientHeight;

            var contentWidth = outerWidth(lightBoxContentElement),
                contentHeight = outerHeight(lightBoxContentElement);

            var horMargin = contentWidth - lightBoxContentElement.offsetWidth,
                vertMargin = contentHeight - lightBoxContentElement.offsetHeight;

            var horDiff = containerWidth - contentWidth,
                vertDiff = containerHeight - contentHeight;

            if (horDiff < 0) {
                lightBoxContentElement.style.width = containerWidth - horMargin + 'px';
            } else {
                lightBoxContentElement.style.left = Math.round(horDiff / 2) + 'px';
            }

            if (vertDiff < 0) {
                lightBoxContentElement.style.height = containerHeight - vertMargin + 'px';
            } else {
                lightBoxContentElement.style.top = Math.round(vertDiff / 2) + 'px';
            }
        };

        if (options.width && options.height) {
            lightBoxResize = Helpers.once(lightBoxResize.bind(this));
        }

        function outerWidth(el) {
            var width = el.offsetWidth;
            var style = getComputedStyle(el);

            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            return width;
        }

        function outerHeight(el) {
            var height = el.offsetHeight;
            var style = getComputedStyle(el);

            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
            return height;
        }

        var bodyStyles;
        var hideScrollbar = (function () {
            bodyStyles = Helpers.zipObject(['overflow', 'paddingRight'].map(function (key) {
                return [key, getComputedStyle(bodyElement)[key]];
            }));

            var bodyPad = parseInt((getComputedStyle(bodyElement)['paddingRight'] || 0), 10);
            bodyElement.style.overflow = 'hidden';
            bodyElement.style.paddingRight = withDefaultPXUnit(bodyPad + this.measureScrollbar());
        }).bind(this);

        var resetScrollbar = function () {
            if (bodyStyles) {
                Object.keys(bodyStyles).forEach(function(key) {
                    bodyElement.style[key] = bodyStyles[key];
                })
            }
        };

        var showSpinner = function () {
            lightBoxSpinnerElement.style.display = 'block';
        };

        var hideSpinner = function () {
            lightBoxSpinnerElement.style.display = 'none';
        };

        var loadTimer;
        lightBoxIframeElement.addEventListener('load', function handleLoad(event) {
            var timeout = !(options.width && options.height) ? (options.resizeTimeout || 30000) : 1000; // 30000 if psDimensions will not arrive and custom timeout is not provided
            loadTimer = global.setTimeout(function () {
                lightBoxResize();
                showContent();
            }, timeout);
            lightBoxIframeElement.removeEventListener('load', handleLoad);

        });

        var iframeWindow = lightBoxIframeElement.contentWindow || lightBoxIframeElement;

        // Cross-window communication
        this.message = new PostMessage(iframeWindow);
        if (options.width && options.height) {
            this.message.on('dimensions', (function () {
                lightBoxResize();
                showContent();
            }));
        } else {
            this.message.on('dimensions', (function (event) {
                var data = event.detail;
                if (data.dimensions) {
                    psDimensions = Helpers.zipObject(['width', 'height'].map(function (dim) {
                        return [dim, Math.max(MIN_PS_DIMENSIONS[dim] || 0, data.dimensions[dim] || 0) + 'px'];
                    }));

                    lightBoxResize();
                }
                showContent();
            }));
        }
        this.message.on('widget-detection', (function () {
            this.message.send('widget-detected', {version: version, lightBoxOptions: options});
        }).bind(this));
        this.message.on('widget-close', (function () {
            this.closeFrame();
        }).bind(this));
        this.message.on('status', (function (event) {
            this.triggerEvent('status', event.detail);
        }).bind(this));
        this.message.on('user-country', (function (event) {
            this.triggerEvent('user-country', event.detail);
        }).bind(this));

        // Resize
        window.addEventListener(handleResizeEventName, lightBoxResize);
        window.addEventListener('resize', handleGlobalResize);

        // Clean up after close
        var that = this;
        this.on('close', function handleClose(event) {
            that.message.off();
            bodyElement.removeEventListener(handleKeyupEventName, HandleBoundSpecificKeyup)
            bodyElement.removeEventListener('keyup', handleGlobalKeyup);

            window.removeEventListener('resize', handleGlobalResize)

            window.removeEventListener(handleResizeEventName, lightBoxResize);
            lightBoxElement.parentNode.removeChild(lightBoxElement);
            resetScrollbar();
            that.off('close', handleClose);
        });

        showSpinner();
        hideScrollbar();
        this.triggerEvent('open');
    };

    LightBox.prototype.closeFrame = function () {
        if (!this.options.modal) {
            this.triggerEvent('close');
        }
    };

    LightBox.prototype.on = function () {
        this.eventObject.on.apply(this.eventObject, arguments);
    };

    LightBox.prototype.off = function () {
        this.eventObject.off.apply(this.eventObject, arguments);
    };

    LightBox.prototype.getPostMessage = function () {
        return this.message;
    };

    LightBox._NAMESPACE = '.xpaystation-widget-lightbox';

    return LightBox;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./helpers":7,"./postmessage":10,"./spinners/round.svg":11,"./spinners/xsolla.svg":12,"./styles/lightbox.scss":13,"./version":14}],9:[function(require,module,exports){
function objectAssign() {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign Polyfill
  Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(e,r){"use strict";if(null==e)throw new TypeError("Cannot convert first argument to object");for(var t=Object(e),n=1;n<arguments.length;n++){var o=arguments[n];if(null!=o)for(var a=Object.keys(Object(o)),c=0,b=a.length;c<b;c++){var i=a[c],l=Object.getOwnPropertyDescriptor(o,i);void 0!==l&&l.enumerable&&(t[i]=o[i])}}return t}});
}

function arrayForEach() {
  Array.prototype.forEach||(Array.prototype.forEach=function(r,o){var t,n;if(null==this)throw new TypeError(" this is null or not defined");var e=Object(this),i=e.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(arguments.length>1&&(t=o),n=0;n<i;){var f;n in e&&(f=e[n],r.call(t,f,n,e)),n++}});
}

function applyPolyfills() {
  objectAssign();
  arrayForEach();
}

module.exports = {
  applyPolyfills: applyPolyfills
}

},{}],10:[function(require,module,exports){
(function (global){
var Helpers = require('./helpers');

module.exports = (function () {
    function wrapEventInNamespace(eventName) {
        return PostMessage._NAMESPACE + '_' + eventName;
    }

    function PostMessage(window) {
        this.eventObject = Helpers.addEventObject(this, wrapEventInNamespace);
        this.linkedWindow = window;

        global.window.addEventListener && global.window.addEventListener("message", (function (event) {
            if (event.source !== this.linkedWindow) {
                return;
            }

            var message = {};
            if (typeof event.data === 'string' && global.JSON !== undefined) {
                try {
                    message = global.JSON.parse(event.data);
                } catch (e) {
                }
            }

            if (message.command) {
                this.eventObject.trigger(message.command, message.data);
            }
        }).bind(this));
    }

    /** Private Members **/
    PostMessage.prototype.eventObject = null;
    PostMessage.prototype.linkedWindow = null;

    /** Public Members **/
    PostMessage.prototype.send = function(command, data, targetOrigin) {
        if (data === undefined) {
            data = {};
        }

        if (targetOrigin === undefined) {
            targetOrigin = '*';
        }

        if (!this.linkedWindow || this.linkedWindow.postMessage === undefined || global.window.JSON === undefined) {
            return false;
        }

        try {
            this.linkedWindow.postMessage(global.JSON.stringify({data: data, command: command}), targetOrigin);
        } catch (e) {
        }

        return true;
    };

    PostMessage.prototype.on = function (event, handle, options) {
        this.eventObject.on(event, handle, options);
    };

    PostMessage.prototype.off = function (event, handle, options) {
        this.eventObject.off(event, handle, options);
    };

    PostMessage._NAMESPACE = 'POST_MESSAGE';


    return PostMessage;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./helpers":7}],11:[function(require,module,exports){
module.exports = "<svg width=\"47px\" height=\"47px\" class=\"spinner-round\"><path d=\"M4.7852728,10.4210875 C2.94111664,13.0552197 1.63777109,16.0946106 1.03753956,19.3768556 L5.16638971,19.3768556 C5.6429615,17.187554 6.50125243,15.139164 7.66768899,13.305305 L5.95572428,11.5922705 L4.7852728,10.4210875 L4.7852728,10.4210875 Z M10.4693048,4.74565615 C13.1274873,2.8908061 16.1965976,1.58674648 19.5100161,1 L19.5100161,4.99523934 C17.2710923,5.48797782 15.1803193,6.3808529 13.3166907,7.59482153 L11.6337339,5.91081293 L10.4693048,4.74565615 L10.4693048,4.74565615 Z M42.2426309,36.5388386 C44.1112782,33.8575016 45.4206461,30.7581504 46,27.4117269 L41.9441211,27.4117269 C41.4527945,29.6618926 40.5583692,31.762911 39.3404412,33.6349356 L41.0332347,35.3287869 L42.2425306,36.5388386 L42.2426309,36.5388386 Z M36.5707441,42.2264227 C33.9167773,44.0867967 30.8509793,45.3972842 27.5398693,45.9911616 L27.5398693,41.7960549 C29.7376402,41.3202901 31.7936841,40.4593536 33.6336246,39.287568 L35.3554258,41.0104453 L36.5707441,42.2265231 L36.5707441,42.2264227 Z M4.71179965,36.4731535 C2.86744274,33.8069823 1.57463637,30.7309322 1,27.4118273 L5.16889904,27.4118273 C5.64828128,29.6073559 6.51159087,31.661069 7.68465205,33.4984432 L5.95572428,35.2284515 L4.71179965,36.4731535 L4.71179965,36.4731535 Z M10.3640133,42.180423 C13.0462854,44.0745435 16.1527345,45.40552 19.5101165,46 L19.5101165,41.7821947 C17.2817319,41.2916658 15.2000928,40.4048169 13.3430889,39.1995862 L11.6337339,40.9100094 L10.3640133,42.1805235 L10.3640133,42.180423 Z M42.1688567,10.3557038 C44.0373031,13.0048008 45.357411,16.0674929 45.9626612,19.3768556 L41.9469316,19.3768556 C41.4585158,17.1328164 40.5692095,15.0369202 39.3580065,13.1684109 L41.0335358,11.4918346 L42.168957,10.3557038 L42.1688567,10.3557038 Z M36.4651516,4.69995782 C33.8355754,2.87865336 30.8071162,1.59488179 27.5400701,1.00883836 L27.5400701,4.98117831 C29.7484805,5.45915272 31.8137587,6.3260149 33.6604242,7.50643794 L35.3555262,5.8102766 L36.4651516,4.69995782 L36.4651516,4.69995782 Z\" fill=\"#CCCCCC\"></path></svg>";

},{}],12:[function(require,module,exports){
module.exports = "<svg class=\"spinner-xsolla\" width=\"56\" height=\"55\"><path class=\"spinner-xsolla-x\" d=\"M21.03 5.042l-2.112-2.156-3.657 3.695-3.657-3.695-2.112 2.156 3.659 3.673-3.659 3.696 2.112 2.157 3.657-3.697 3.657 3.697 2.112-2.157-3.648-3.696 3.648-3.673z\" fill=\"#F2542D\"></path><path class=\"spinner-xsolla-s\" d=\"M41.232 6.896l2.941-2.974-2.134-2.132-2.92 2.973-.005-.008-2.134 2.135.005.008-.005.005 3.792 3.82-2.915 2.947 2.112 2.156 5.06-5.111-3.798-3.816.001-.001z\" fill=\"#FCCA20\"></path><path class=\"spinner-xsolla-o\" d=\"M48.066 29.159c-1.536 0-2.761 1.263-2.761 2.79 0 1.524 1.226 2.765 2.761 2.765 1.509 0 2.736-1.242 2.736-2.765 0-1.526-1.227-2.79-2.736-2.79m0 8.593c-3.179 0-5.771-2.594-5.771-5.804 0-3.213 2.592-5.808 5.771-5.808 3.155 0 5.745 2.594 5.745 5.808 0 3.21-2.589 5.804-5.745 5.804\" fill=\"#8C3EA4\"></path><path class=\"spinner-xsolla-l\" d=\"M24.389 42.323h2.99v10.437h-2.99v-10.437zm4.334 0h2.989v10.437h-2.989v-10.437z\" fill=\"#B5DC20\"></path><path class=\"spinner-xsolla-a\" d=\"M7.796 31.898l1.404 2.457h-2.835l1.431-2.457h-.001zm-.001-5.757l-6.363 11.102h12.703l-6.341-11.102z\" fill=\"#66CCDA\"></path></svg>";

},{}],13:[function(require,module,exports){
module.exports = require('sassify')('.xpaystation-widget-lightbox{position:fixed;top:0;left:0;bottom:0;right:0;width:100%;height:100%;-webkit-animation:xpaystation-widget-lightbox-fadein 0.15s;animation:xpaystation-widget-lightbox-fadein 0.15s}.xpaystation-widget-lightbox-overlay{position:absolute;top:0;left:0;bottom:0;right:0;z-index:1}.xpaystation-widget-lightbox-content{position:relative;top:0;left:0;z-index:3}.xpaystation-widget-lightbox-content__hidden{visibility:hidden;z-index:-1}.xpaystation-widget-lightbox-content-iframe{width:100%;height:100%;border:0;background:transparent}.xpaystation-widget-lightbox-spinner{position:absolute;top:50%;left:50%;display:none;z-index:2;pointer-events:none}.xpaystation-widget-lightbox-spinner .spinner-xsolla{width:56px;height:55px;margin-top:-28px;margin-left:-26px}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-x,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-s,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-o,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-l,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-a{-webkit-animation:xpaystation-widget-lightbox-bouncedelay 1s infinite ease-in-out;-webkit-animation-fill-mode:both;animation:xpaystation-widget-lightbox-bouncedelay 1s infinite ease-in-out;animation-fill-mode:both}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-x{-webkit-animation-delay:0s;animation-delay:0s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-s{-webkit-animation-delay:.2s;animation-delay:.2s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-o{-webkit-animation-delay:.4s;animation-delay:.4s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-l{-webkit-animation-delay:.6s;animation-delay:.6s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-a{-webkit-animation-delay:.8s;animation-delay:.8s}.xpaystation-widget-lightbox-spinner .spinner-round{margin-top:-23px;margin-left:-23px;-webkit-animation:xpaystation-widget-lightbox-spin 3s infinite linear;animation:xpaystation-widget-lightbox-spin 3s infinite linear}.xpaystation-widget-lightbox-spinner .spinner-custom{-webkit-animation:xpaystation-widget-lightbox-spin infinite linear;animation:xpaystation-widget-lightbox-spin infinite linear}@-webkit-keyframes xpaystation-widget-lightbox-bouncedelay{0%,80%,100%{opacity:0}40%{opacity:1}}@keyframes xpaystation-widget-lightbox-bouncedelay{0%,80%,100%{opacity:0}40%{opacity:1}}@-webkit-keyframes xpaystation-widget-lightbox-fadein{from{opacity:0}to{opacity:1}}@keyframes xpaystation-widget-lightbox-fadein{from{opacity:0}to{opacity:1}}@-webkit-keyframes xpaystation-widget-lightbox-spin{from{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes xpaystation-widget-lightbox-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}  /*# sourceMappingURL=data:application/json;base64,ewoJInZlcnNpb24iOiAzLAoJImZpbGUiOiAibGlnaHRib3guc2NzcyIsCgkic291cmNlcyI6IFsKCQkibGlnaHRib3guc2NzcyIKCV0sCgkic291cmNlc0NvbnRlbnQiOiBbCgkJIiRsaWdodGJveC1wcmVmaXg6ICd4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xyXG4kbGlnaHRib3gtY2xhc3M6ICcuJyArICRsaWdodGJveC1wcmVmaXg7XHJcblxyXG4jeyRsaWdodGJveC1jbGFzc30ge1xyXG4gIHBvc2l0aW9uOiBmaXhlZDtcclxuICB0b3A6IDA7XHJcbiAgbGVmdDogMDtcclxuICBib3R0b206IDA7XHJcbiAgcmlnaHQ6IDA7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAgaGVpZ2h0OiAxMDAlO1xyXG4gIC13ZWJraXQtYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LWZhZGVpbiAuMTVzO1xyXG4gIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1mYWRlaW4gLjE1cztcclxufVxyXG5cclxuI3skbGlnaHRib3gtY2xhc3N9LW92ZXJsYXkge1xyXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICB0b3A6MDtcclxuICBsZWZ0OiAwO1xyXG4gIGJvdHRvbTogMDtcclxuICByaWdodDogMDtcclxuICB6LWluZGV4OiAxO1xyXG59XHJcblxyXG4jeyRsaWdodGJveC1jbGFzc30tY29udGVudCB7XHJcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIHRvcDogMDtcclxuICBsZWZ0OiAwO1xyXG4gIHotaW5kZXg6IDM7XHJcbn1cclxuXHJcbiN7JGxpZ2h0Ym94LWNsYXNzfS1jb250ZW50X19oaWRkZW4ge1xyXG4gIHZpc2liaWxpdHk6IGhpZGRlbjtcclxuICB6LWluZGV4OiAtMTtcclxufVxyXG5cclxuI3skbGlnaHRib3gtY2xhc3N9LWNvbnRlbnQtaWZyYW1lIHtcclxuICB3aWR0aDogMTAwJTtcclxuICBoZWlnaHQ6IDEwMCU7XHJcbiAgYm9yZGVyOiAwO1xyXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG59XHJcblxyXG4jeyRsaWdodGJveC1jbGFzc30tc3Bpbm5lciB7XHJcbiAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gIHRvcDogNTAlO1xyXG4gIGxlZnQ6IDUwJTtcclxuICBkaXNwbGF5OiBub25lO1xyXG4gIHotaW5kZXg6IDI7XHJcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcblxyXG4gIC5zcGlubmVyLXhzb2xsYSB7XHJcbiAgICB3aWR0aDogNTZweDtcclxuICAgIGhlaWdodDogNTVweDtcclxuICAgIG1hcmdpbjoge1xyXG4gICAgICB0b3A6IC0yOHB4O1xyXG4gICAgICBsZWZ0OiAtMjZweDtcclxuICAgIH1cclxuXHJcbiAgICAuc3Bpbm5lci14c29sbGEteCwgLnNwaW5uZXIteHNvbGxhLXMsIC5zcGlubmVyLXhzb2xsYS1vLCAuc3Bpbm5lci14c29sbGEtbCwgLnNwaW5uZXIteHNvbGxhLWEge1xyXG4gICAgICAtd2Via2l0LWFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcclxuICAgICAgLXdlYmtpdC1hbmltYXRpb24tZmlsbC1tb2RlOiBib3RoO1xyXG4gICAgICBhbmltYXRpb246ICN7JGxpZ2h0Ym94LXByZWZpeH0tYm91bmNlZGVsYXkgMXMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XHJcbiAgICAgIGFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLnNwaW5uZXIteHNvbGxhLXgge1xyXG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMHM7XHJcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogMHM7XHJcbiAgICB9XHJcblxyXG4gICAgLnNwaW5uZXIteHNvbGxhLXMge1xyXG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjJzO1xyXG4gICAgICBhbmltYXRpb24tZGVsYXk6IC4ycztcclxuICAgIH1cclxuXHJcbiAgICAuc3Bpbm5lci14c29sbGEtbyB7XHJcbiAgICAgIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAuNHM7XHJcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLjRzO1xyXG4gICAgfVxyXG5cclxuICAgIC5zcGlubmVyLXhzb2xsYS1sIHtcclxuICAgICAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC42cztcclxuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuNnM7XHJcbiAgICB9XHJcblxyXG4gICAgLnNwaW5uZXIteHNvbGxhLWEge1xyXG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjhzO1xyXG4gICAgICBhbmltYXRpb24tZGVsYXk6IC44cztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC5zcGlubmVyLXJvdW5kIHtcclxuICAgIG1hcmdpbjoge1xyXG4gICAgICB0b3A6IC0yM3B4O1xyXG4gICAgICBsZWZ0OiAtMjNweDtcclxuICAgIH1cclxuICAgIC13ZWJraXQtYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4gM3MgaW5maW5pdGUgbGluZWFyO1xyXG4gICAgYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4gM3MgaW5maW5pdGUgbGluZWFyO1xyXG4gIH1cclxuXHJcbiAgLnNwaW5uZXItY3VzdG9tIHtcclxuICAgIC13ZWJraXQtYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4gaW5maW5pdGUgbGluZWFyO1xyXG4gICAgYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4gaW5maW5pdGUgbGluZWFyO1xyXG4gIH1cclxufVxyXG5cclxuQC13ZWJraXQta2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tYm91bmNlZGVsYXkge1xyXG4gIDAlLCA4MCUsIDEwMCUgeyBvcGFjaXR5OiAwOyB9XHJcbiAgNDAlIHsgb3BhY2l0eTogMSB9XHJcbn1cclxuXHJcbkBrZXlmcmFtZXMgI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSB7XHJcbiAgMCUsIDgwJSwgMTAwJSB7IG9wYWNpdHk6IDA7IH1cclxuICA0MCUgeyBvcGFjaXR5OiAxOyB9XHJcbn1cclxuXHJcbkAtd2Via2l0LWtleWZyYW1lcyAjeyRsaWdodGJveC1wcmVmaXh9LWZhZGVpbiB7XHJcbiAgZnJvbSB7IG9wYWNpdHk6IDA7IH1cclxuICB0byB7IG9wYWNpdHk6IDE7IH1cclxufVxyXG5cclxuQGtleWZyYW1lcyAjeyRsaWdodGJveC1wcmVmaXh9LWZhZGVpbiB7XHJcbiAgZnJvbSB7IG9wYWNpdHk6IDA7IH1cclxuICB0byB7IG9wYWNpdHk6IDE7IH1cclxufVxyXG5cclxuQC13ZWJraXQta2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tc3BpbiB7XHJcbiAgZnJvbSB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICB0byB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG59XHJcblxyXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tc3BpbiB7XHJcbiAgZnJvbSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgdG8geyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbn1cclxuIgoJXSwKCSJtYXBwaW5ncyI6ICJBQUdBLEFBQUEsNEJBQTRCLEFBQTVCLENBQ0UsUUFBUSxDQUFFLEtBQU0sQ0FDaEIsR0FBRyxDQUFFLENBQUUsQ0FDUCxJQUFJLENBQUUsQ0FBRSxDQUNSLE1BQU0sQ0FBRSxDQUFFLENBQ1YsS0FBSyxDQUFFLENBQUUsQ0FDVCxLQUFLLENBQUUsSUFBSyxDQUNaLE1BQU0sQ0FBRSxJQUFLLENBQ2IsaUJBQWlCLENBQUUsa0NBQTBCLENBQVEsS0FBSSxDQUN6RCxTQUFTLENBQUUsa0NBQTBCLENBQVEsS0FBSSxDQUNsRCxBQUVELEFBQUEsb0NBQW9DLEFBQXBDLENBQ0UsUUFBUSxDQUFFLFFBQVMsQ0FDbkIsR0FBRyxDQUFDLENBQUUsQ0FDTixJQUFJLENBQUUsQ0FBRSxDQUNSLE1BQU0sQ0FBRSxDQUFFLENBQ1YsS0FBSyxDQUFFLENBQUUsQ0FDVCxPQUFPLENBQUUsQ0FBRSxDQUNaLEFBRUQsQUFBQSxvQ0FBb0MsQUFBcEMsQ0FDRSxRQUFRLENBQUUsUUFBUyxDQUNuQixHQUFHLENBQUUsQ0FBRSxDQUNQLElBQUksQ0FBRSxDQUFFLENBQ1IsT0FBTyxDQUFFLENBQUUsQ0FDWixBQUVELEFBQUEsNENBQTRDLEFBQTVDLENBQ0UsVUFBVSxDQUFFLE1BQU8sQ0FDbkIsT0FBTyxDQUFFLEVBQUcsQ0FDYixBQUVELEFBQUEsMkNBQTJDLEFBQTNDLENBQ0UsS0FBSyxDQUFFLElBQUssQ0FDWixNQUFNLENBQUUsSUFBSyxDQUNiLE1BQU0sQ0FBRSxDQUFFLENBQ1YsVUFBVSxDQUFFLFdBQVksQ0FDekIsQUFFRCxBQUFBLG9DQUFvQyxBQUFwQyxDQUNFLFFBQVEsQ0FBRSxRQUFTLENBQ25CLEdBQUcsQ0FBRSxHQUFJLENBQ1QsSUFBSSxDQUFFLEdBQUksQ0FDVixPQUFPLENBQUUsSUFBSyxDQUNkLE9BQU8sQ0FBRSxDQUFFLENBQ1gsY0FBYyxDQUFFLElBQUssQ0F3RHRCLEFBOURELEFBUUUsb0NBUmtDLENBUWxDLGVBQWUsQUFBQyxDQUNkLEtBQUssQ0FBRSxJQUFLLENBQ1osTUFBTSxDQUFFLElBQUssQ0FDYixNQUFNLEFBQUMsQ0FBQyxBQUNOLEdBQUcsQ0FBRSxLQUFNLENBRGIsTUFBTSxBQUFDLENBQUMsQUFFTixJQUFJLENBQUUsS0FBTSxDQWtDZixBQS9DSCxBQWdCSSxvQ0FoQmdDLENBUWxDLGVBQWUsQ0FRYixpQkFBaUIsQ0FoQnJCLEFBZ0J1QixvQ0FoQmEsQ0FRbEMsZUFBZSxDQVFNLGlCQUFpQixDQWhCeEMsQUFnQjBDLG9DQWhCTixDQVFsQyxlQUFlLENBUXlCLGlCQUFpQixDQWhCM0QsQUFnQjZELG9DQWhCekIsQ0FRbEMsZUFBZSxDQVE0QyxpQkFBaUIsQ0FoQjlFLEFBZ0JnRixvQ0FoQjVDLENBUWxDLGVBQWUsQ0FRK0QsaUJBQWlCLEFBQUMsQ0FDNUYsaUJBQWlCLENBQUUsdUNBQStCLENBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQ3RGLDJCQUEyQixDQUFFLElBQUssQ0FDbEMsU0FBUyxDQUFFLHVDQUErQixDQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUM5RSxtQkFBbUIsQ0FBRSxJQUFLLENBQzNCLEFBckJMLEFBdUJJLG9DQXZCZ0MsQ0FRbEMsZUFBZSxDQWViLGlCQUFpQixBQUFDLENBQ2hCLHVCQUF1QixDQUFFLEVBQUcsQ0FDNUIsZUFBZSxDQUFFLEVBQUcsQ0FDckIsQUExQkwsQUE0Qkksb0NBNUJnQyxDQVFsQyxlQUFlLENBb0JiLGlCQUFpQixBQUFDLENBQ2hCLHVCQUF1QixDQUFFLEdBQUksQ0FDN0IsZUFBZSxDQUFFLEdBQUksQ0FDdEIsQUEvQkwsQUFpQ0ksb0NBakNnQyxDQVFsQyxlQUFlLENBeUJiLGlCQUFpQixBQUFDLENBQ2hCLHVCQUF1QixDQUFFLEdBQUksQ0FDN0IsZUFBZSxDQUFFLEdBQUksQ0FDdEIsQUFwQ0wsQUFzQ0ksb0NBdENnQyxDQVFsQyxlQUFlLENBOEJiLGlCQUFpQixBQUFDLENBQ2hCLHVCQUF1QixDQUFFLEdBQUksQ0FDN0IsZUFBZSxDQUFFLEdBQUksQ0FDdEIsQUF6Q0wsQUEyQ0ksb0NBM0NnQyxDQVFsQyxlQUFlLENBbUNiLGlCQUFpQixBQUFDLENBQ2hCLHVCQUF1QixDQUFFLEdBQUksQ0FDN0IsZUFBZSxDQUFFLEdBQUksQ0FDdEIsQUE5Q0wsQUFpREUsb0NBakRrQyxDQWlEbEMsY0FBYyxBQUFDLENBQ2IsTUFBTSxBQUFDLENBQUMsQUFDTixHQUFHLENBQUUsS0FBTSxDQURiLE1BQU0sQUFBQyxDQUFDLEFBRU4sSUFBSSxDQUFFLEtBQU0sQ0FFZCxpQkFBaUIsQ0FBRSxnQ0FBd0IsQ0FBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDbkUsU0FBUyxDQUFFLGdDQUF3QixDQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUM1RCxBQXhESCxBQTBERSxvQ0ExRGtDLENBMERsQyxlQUFlLEFBQUMsQ0FDZCxpQkFBaUIsQ0FBRSxnQ0FBd0IsQ0FBTSxRQUFRLENBQUMsTUFBTSxDQUNoRSxTQUFTLENBQUUsZ0NBQXdCLENBQU0sUUFBUSxDQUFDLE1BQU0sQ0FDekQsQUFHSCxrQkFBa0IsQ0FBbEIsdUNBQWtCLENBQ2hCLEFBQUEsRUFBRSxDQUFFLEFBQUEsR0FBRyxDQUFFLEFBQUEsSUFBSSxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQzNCLEFBQUEsR0FBRyxDQUFHLE9BQU8sQ0FBRSxDQUFHLEVBR3BCLFVBQVUsQ0FBVix1Q0FBVSxDQUNSLEFBQUEsRUFBRSxDQUFFLEFBQUEsR0FBRyxDQUFFLEFBQUEsSUFBSSxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQzNCLEFBQUEsR0FBRyxDQUFHLE9BQU8sQ0FBRSxDQUFFLEVBR25CLGtCQUFrQixDQUFsQixrQ0FBa0IsQ0FDaEIsQUFBQSxJQUFJLENBQUcsT0FBTyxDQUFFLENBQUUsQ0FDbEIsQUFBQSxFQUFFLENBQUcsT0FBTyxDQUFFLENBQUUsRUFHbEIsVUFBVSxDQUFWLGtDQUFVLENBQ1IsQUFBQSxJQUFJLENBQUcsT0FBTyxDQUFFLENBQUUsQ0FDbEIsQUFBQSxFQUFFLENBQUcsT0FBTyxDQUFFLENBQUUsRUFHbEIsa0JBQWtCLENBQWxCLGdDQUFrQixDQUNoQixBQUFBLElBQUksQ0FBRyxpQkFBaUIsQ0FBRSxZQUFNLENBQ2hDLEFBQUEsRUFBRSxDQUFHLGlCQUFpQixDQUFFLGNBQU0sRUFHaEMsVUFBVSxDQUFWLGdDQUFVLENBQ1IsQUFBQSxJQUFJLENBQUcsU0FBUyxDQUFFLFlBQU0sQ0FDeEIsQUFBQSxFQUFFLENBQUcsU0FBUyxDQUFFLGNBQU0iLAoJIm5hbWVzIjogW10KfQ== */');;
},{"sassify":2}],14:[function(require,module,exports){
module.exports = '1.2.6';

},{}],"bowser":[function(require,module,exports){
/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!function (root, name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else root[name] = definition()
}(this, 'bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
      , chromeos = /CrOS/.test(ua)
      , silk = /silk/i.test(ua)
      , sailfish = /sailfish/i.test(ua)
      , tizen = /tizen/i.test(ua)
      , webos = /(web|hpw)(o|0)s/i.test(ua)
      , windowsphone = /windows phone/i.test(ua)
      , samsungBrowser = /SamsungBrowser/i.test(ua)
      , windows = !windowsphone && /windows/i.test(ua)
      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
      , edgeVersion = getSecondMatch(/edg([ea]|ios)\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua) && !/tablet pc/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , xbox = /xbox/i.test(ua)
      , result

    if (/opera/i.test(ua)) {
      //  an old Opera
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
      }
    } else if (/opr\/|opios/i.test(ua)) {
      // a new Opera
      result = {
        name: 'Opera'
        , opera: t
        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result = {
        name: 'Samsung Internet for Android'
        , samsungBrowser: t
        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/Whale/i.test(ua)) {
      result = {
        name: 'NAVER Whale browser'
        , whale: t
        , version: getFirstMatch(/(?:whale)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/MZBrowser/i.test(ua)) {
      result = {
        name: 'MZ Browser'
        , mzbrowser: t
        , version: getFirstMatch(/(?:MZBrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/coast/i.test(ua)) {
      result = {
        name: 'Opera Coast'
        , coast: t
        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/focus/i.test(ua)) {
      result = {
        name: 'Focus'
        , focus: t
        , version: getFirstMatch(/(?:focus)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/ucbrowser/i.test(ua)) {
      result = {
          name: 'UC Browser'
        , ucbrowser: t
        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/mxios/i.test(ua)) {
      result = {
        name: 'Maxthon'
        , maxthon: t
        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/epiphany/i.test(ua)) {
      result = {
        name: 'Epiphany'
        , epiphany: t
        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/puffin/i.test(ua)) {
      result = {
        name: 'Puffin'
        , puffin: t
        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
        , sleipnir: t
        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/k-meleon/i.test(ua)) {
      result = {
        name: 'K-Meleon'
        , kMeleon: t
        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (windowsphone) {
      result = {
        name: 'Windows Phone'
      , osname: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    } else if (chromeos) {
      result = {
        name: 'Chrome'
      , osname: 'Chrome OS'
      , chromeos: t
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/edg([ea]|ios)/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/vivaldi/i.test(ua)) {
      result = {
        name: 'Vivaldi'
        , vivaldi: t
        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (sailfish) {
      result = {
        name: 'Sailfish'
      , osname: 'Sailfish OS'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
        result.osname = 'Firefox OS'
      }
    }
    else if (silk) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/slimerjs/i.test(ua)) {
      result = {
        name: 'SlimerJS'
        , slimer: t
        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , osname: 'BlackBerry OS'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (webos) {
      result = {
        name: 'WebOS'
      , osname: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , osname: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (tizen) {
      result = {
        name: 'Tizen'
      , osname: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/qupzilla/i.test(ua)) {
      result = {
        name: 'QupZilla'
        , qupzilla: t
        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
      }
    }
    else if (/chromium/i.test(ua)) {
      result = {
        name: 'Chromium'
        , chromium: t
        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
        , version: versionIdentifier
      }
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      }
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if(/googlebot/i.test(ua)) {
      result = {
        name: 'Googlebot'
      , googlebot: t
      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      if (/(apple)?webkit\/537\.36/i.test(ua)) {
        result.name = result.name || "Blink"
        result.blink = t
      } else {
        result.name = result.name || "Webkit"
        result.webkit = t
      }
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.windowsphone && (android || result.silk)) {
      result.android = t
      result.osname = 'Android'
    } else if (!result.windowsphone && iosdevice) {
      result[iosdevice] = t
      result.ios = t
      result.osname = 'iOS'
    } else if (mac) {
      result.mac = t
      result.osname = 'macOS'
    } else if (xbox) {
      result.xbox = t
      result.osname = 'Xbox'
    } else if (windows) {
      result.windows = t
      result.osname = 'Windows'
    } else if (linux) {
      result.linux = t
      result.osname = 'Linux'
    }

    function getWindowsVersion (s) {
      switch (s) {
        case 'NT': return 'NT'
        case 'XP': return 'XP'
        case 'NT 5.0': return '2000'
        case 'NT 5.1': return 'XP'
        case 'NT 5.2': return '2003'
        case 'NT 6.0': return 'Vista'
        case 'NT 6.1': return '7'
        case 'NT 6.2': return '8'
        case 'NT 6.3': return '8.1'
        case 'NT 10.0': return '10'
        default: return undefined
      }
    }

    // OS version extraction
    var osVersion = '';
    if (result.windows) {
      osVersion = getWindowsVersion(getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i))
    } else if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (result.mac) {
      osVersion = getFirstMatch(/Mac OS X (\d+([_\.\s]\d+)*)/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = !result.windows && osVersion.split('.')[0];
    if (
         tablet
      || nexusTablet
      || iosdevice == 'ipad'
      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
      || result.silk
    ) {
      result.tablet = t
    } else if (
         mobile
      || iosdevice == 'iphone'
      || iosdevice == 'ipod'
      || android
      || nexusMobile
      || result.blackberry
      || result.webos
      || result.bada
    ) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.yandexbrowser && result.version >= 15) ||
		    (result.vivaldi && result.version >= 1.0) ||
        (result.chrome && result.version >= 20) ||
        (result.samsungBrowser && result.version >= 4) ||
        (result.whale && compareVersions([result.version, '1.0']) === 1) ||
        (result.mzbrowser && compareVersions([result.version, '6.0']) === 1) ||
        (result.focus && compareVersions([result.version, '1.0']) === 1) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        || (result.chromium && result.version >= 20)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        || (result.chromium && result.version < 20)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  function getVersionPrecision(version) {
    return version.split(".").length;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  function map(arr, iterator) {
    var result = [], i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i++) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
   *
   * @param  {Array<String>} versions versions to compare
   * @return {Number} comparison result
   */
  function compareVersions(versions) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
    var chunks = map(versions, function (version) {
      var delta = precision - getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      version = version + new Array(delta + 1).join(".0");

      // 3) "9.0" -> ["000000000"", "000000009"]
      return map(version.split("."), function (chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });

    // iterate in reverse order by reversed chunks array
    while (--precision >= 0) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      else if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === 0) {
          // all version chunks are same
          return 0;
        }
      }
      else {
        return -1;
      }
    }
  }

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param  {Object}  minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function isUnsupportedBrowser(minVersions, strictMode, ua) {
    var _bowser = bowser;

    // make strictMode param optional with ua param usage
    if (typeof strictMode === 'string') {
      ua = strictMode;
      strictMode = void(0);
    }

    if (strictMode === void(0)) {
      strictMode = false;
    }
    if (ua) {
      _bowser = detect(ua);
    }

    var version = "" + _bowser.version;
    for (var browser in minVersions) {
      if (minVersions.hasOwnProperty(browser)) {
        if (_bowser[browser]) {
          if (typeof minVersions[browser] !== 'string') {
            throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
          }

          // browser version and min supported version.
          return compareVersions([version, minVersions[browser]]) < 0;
        }
      }
    }

    return strictMode; // not found
  }

  /**
   * Check if browser is supported
   *
   * @param  {Object} minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function check(minVersions, strictMode, ua) {
    return !isUnsupportedBrowser(minVersions, strictMode, ua);
  }

  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
  bowser.compareVersions = compareVersions;
  bowser.check = check;

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  /*
   * Set our detect public method to the main bowser object
   * This is needed to implement bowser in server side
   */
  bowser.detect = detect;
  return bowser
});

},{}],"main":[function(require,module,exports){
var Helpers = require('./helpers')
var App = require('./app');
var polyfills = require('./polyfills');

polyfills.applyPolyfills();

var instance;

module.exports = (function () {
    var getInstance = function () {
        if (!instance) {
            instance = new App();
        }
        return instance;
    };

    return Object.assign(Helpers.zipObject(['init', 'open', 'on', 'off', 'sendMessage', 'onMessage'].map(function (methodName) {
        var app = getInstance();
        return [methodName, function () {
            return app[methodName].apply(app, arguments);
        }];
    })), {
        eventTypes: App.eventTypes,
    });
})();

},{"./app":3,"./helpers":7,"./polyfills":9}]},{},["main"])("main")
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJib3dlcl9jb21wb25lbnRzL2Jvd3Nlci9zcmMvYm93c2VyLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckVBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTs7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzLCBjdXN0b21Eb2N1bWVudCkge1xuICB2YXIgZG9jID0gY3VzdG9tRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG4gIGlmIChkb2MuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHZhciBzaGVldCA9IGRvYy5jcmVhdGVTdHlsZVNoZWV0KClcbiAgICBzaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIHJldHVybiBzaGVldC5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgc3R5bGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIH1cblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuYnlVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCh1cmwpLm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHJldHVybiBsaW5rO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdjc3NpZnknKTsiLCJ2YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xyXG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcclxudmFyIExpZ2h0Qm94ID0gcmVxdWlyZSgnLi9saWdodGJveCcpO1xyXG52YXIgQ2hpbGRXaW5kb3cgPSByZXF1aXJlKCcuL2NoaWxkd2luZG93Jyk7XHJcbnZhciBEZXZpY2UgPSByZXF1aXJlKCcuL2RldmljZScpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIEFwcCgpIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfQ09ORklHKTtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzKTtcclxuICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgQXBwLmV2ZW50VHlwZXMgPSB7XHJcbiAgICAgICAgSU5JVDogJ2luaXQnLFxyXG4gICAgICAgIE9QRU46ICdvcGVuJyxcclxuICAgICAgICBPUEVOX1dJTkRPVzogJ29wZW4td2luZG93JyxcclxuICAgICAgICBPUEVOX0xJR0hUQk9YOiAnb3Blbi1saWdodGJveCcsXHJcbiAgICAgICAgTE9BRDogJ2xvYWQnLFxyXG4gICAgICAgIENMT1NFOiAnY2xvc2UnLFxyXG4gICAgICAgIENMT1NFX1dJTkRPVzogJ2Nsb3NlLXdpbmRvdycsXHJcbiAgICAgICAgQ0xPU0VfTElHSFRCT1g6ICdjbG9zZS1saWdodGJveCcsXHJcbiAgICAgICAgU1RBVFVTOiAnc3RhdHVzJyxcclxuICAgICAgICBTVEFUVVNfSU5WT0lDRTogJ3N0YXR1cy1pbnZvaWNlJyxcclxuICAgICAgICBTVEFUVVNfREVMSVZFUklORzogJ3N0YXR1cy1kZWxpdmVyaW5nJyxcclxuICAgICAgICBTVEFUVVNfVFJPVUJMRUQ6ICdzdGF0dXMtdHJvdWJsZWQnLFxyXG4gICAgICAgIFNUQVRVU19ET05FOiAnc3RhdHVzLWRvbmUnLFxyXG4gICAgICAgIFVTRVJfQ09VTlRSWTogJ3VzZXItY291bnRyeSdcclxuICAgIH07XHJcblxyXG4gICAgdmFyIERFRkFVTFRfQ09ORklHID0ge1xyXG4gICAgICAgIGFjY2Vzc190b2tlbjogbnVsbCxcclxuICAgICAgICBhY2Nlc3NfZGF0YTogbnVsbCxcclxuICAgICAgICBzYW5kYm94OiBmYWxzZSxcclxuICAgICAgICBsaWdodGJveDoge30sXHJcbiAgICAgICAgY2hpbGRXaW5kb3c6IHt9LFxyXG4gICAgICAgIGhvc3Q6ICdzZWN1cmUueHNvbGxhLmNvbScsXHJcbiAgICAgICAgaWZyYW1lT25seTogZmFsc2VcclxuICAgIH07XHJcbiAgICB2YXIgU0FOREJPWF9QQVlTVEFUSU9OX1VSTCA9ICdodHRwczovL3NhbmRib3gtc2VjdXJlLnhzb2xsYS5jb20vcGF5c3RhdGlvbjIvPyc7XHJcbiAgICB2YXIgRVZFTlRfTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQnO1xyXG4gICAgdmFyIEFUVFJfUFJFRklYID0gJ2RhdGEteHBheXN0YXRpb24td2lkZ2V0LW9wZW4nO1xyXG5cclxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXHJcbiAgICBBcHAucHJvdG90eXBlLmNvbmZpZyA9IHt9O1xyXG4gICAgQXBwLnByb3RvdHlwZS5pc0luaXRpYXRlZCA9IGZhbHNlO1xyXG4gICAgQXBwLnByb3RvdHlwZS5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XHJcblxyXG4gICAgQXBwLnByb3RvdHlwZS5nZXRQYXltZW50VXJsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5wYXltZW50X3VybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGF5bWVudF91cmw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBxdWVyeSA9IHt9O1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hY2Nlc3NfdG9rZW4pIHtcclxuICAgICAgICAgICAgcXVlcnkuYWNjZXNzX3Rva2VuID0gdGhpcy5jb25maWcuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LmFjY2Vzc19kYXRhID0gSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsV2l0aG91dFF1ZXJ5UGFyYW1zID0gdGhpcy5jb25maWcuc2FuZGJveCA/XHJcbiAgICAgICAgICAgIFNBTkRCT1hfUEFZU1RBVElPTl9VUkwgOlxyXG4gICAgICAgICAgICAnaHR0cHM6Ly8nICsgdGhpcy5jb25maWcuaG9zdCArICcvcGF5c3RhdGlvbjIvPyc7XHJcbiAgICAgICAgcmV0dXJuIHVybFdpdGhvdXRRdWVyeVBhcmFtcyArIEhlbHBlcnMucGFyYW0ocXVlcnkpO1xyXG4gICAgfTtcclxuXHJcbiAgICBBcHAucHJvdG90eXBlLmNoZWNrQ29uZmlnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX3Rva2VuKSAmJiBIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpICYmIEhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5wYXltZW50X3VybCkpIHtcclxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdObyBhY2Nlc3MgdG9rZW4gb3IgYWNjZXNzIGRhdGEgb3IgcGF5bWVudCBVUkwgZ2l2ZW4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKSAmJiB0eXBlb2YgdGhpcy5jb25maWcuYWNjZXNzX2RhdGEgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW52YWxpZCBhY2Nlc3MgZGF0YSBmb3JtYXQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuaG9zdCkpIHtcclxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdJbnZhbGlkIGhvc3QnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEFwcC5wcm90b3R5cGUuY2hlY2tBcHAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNJbml0aWF0ZWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0luaXRpYWxpemUgd2lkZ2V0IGJlZm9yZSBvcGVuaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBBcHAucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24obWVzc2FnZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwcC5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChhcmd1bWVudHMsIChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudE5hbWUsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQXBwLnByb3RvdHlwZS50cmlnZ2VyQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge2RldGFpbDogZGF0YX0pOyAvLyBOb3Qgd29ya2luZyBpbiBJRVxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgICAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemUgd2lkZ2V0IHdpdGggb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxpemUob3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcclxuICAgICAgICAgICAgdmFyIGNsaWNrRXZlbnROYW1lID0gJ2NsaWNrJyArIEVWRU5UX05BTUVTUEFDRTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVDbGlja0V2ZW50ID0gKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1snICsgQVRUUl9QUkVGSVggKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZUV2ZW50LnRhcmdldCA9PT0gdGFyZ2V0RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Blbi5jYWxsKHRoaXMsIHRhcmdldEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgICAgICAgICBjbGlja0V2ZW50LmluaXRFdmVudChjbGlja0V2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcclxuICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XHJcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudE5hbWUsIGhhbmRsZUNsaWNrRXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5JTklUKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVhZHkoaW5pdGlhbGl6ZS5iaW5kKHRoaXMsIG9wdGlvbnMpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gcGF5bWVudCBpbnRlcmZhY2UgKFBheVN0YXRpb24pXHJcbiAgICAgKi9cclxuICAgIEFwcC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNoZWNrQ29uZmlnKCk7XHJcbiAgICAgICAgdGhpcy5jaGVja0FwcCgpO1xyXG5cclxuICAgICAgICB2YXIgdHJpZ2dlclNwbGl0U3RhdHVzID0gKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoKChkYXRhIHx8IHt9KS5wYXltZW50SW5mbyB8fCB7fSkuc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdpbnZvaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfSU5WT0lDRSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxpdmVyaW5nJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfREVMSVZFUklORywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd0cm91YmxlZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX1RST1VCTEVELCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvbmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19ET05FLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmdldFBheW1lbnRVcmwoKTtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVN0YXR1cyhldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzRGF0YSA9IGV2ZW50LmRldGFpbDtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTLCBzdGF0dXNEYXRhKTtcclxuICAgICAgICAgICAgdHJpZ2dlclNwbGl0U3RhdHVzKHN0YXR1c0RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlVXNlckxvY2FsZShldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdXNlckNvdW50cnkgPSB7XHJcbiAgICAgICAgICAgICAgICB1c2VyX2NvdW50cnk6IGV2ZW50LmRldGFpbC51c2VyX2NvdW50cnlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyQ3VzdG9tRXZlbnQoQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCB1c2VyQ291bnRyeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gbnVsbDtcclxuICAgICAgICBpZiAoKG5ldyBEZXZpY2UpLmlzTW9iaWxlKCkgJiYgIXRoaXMuY29uZmlnLmlmcmFtZU9ubHkpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkV2luZG93ID0gbmV3IENoaWxkV2luZG93O1xyXG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignb3BlbicsIGZ1bmN0aW9uIGhhbmRsZU9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc3RNZXNzYWdlID0gY2hpbGRXaW5kb3cuZ2V0UG9zdE1lc3NhZ2UoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU4pO1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTl9XSU5ET1cpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdvcGVuJywgaGFuZGxlT3Blbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignbG9hZCcsIGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZignbG9hZCcsIGhhbmRsZUxvYWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRV9XSU5ET1cpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ3N0YXR1cycsIGhhbmRsZVN0YXR1cyk7XHJcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XHJcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9wZW4odXJsLCB0aGlzLmNvbmZpZy5jaGlsZFdpbmRvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGxpZ2h0Qm94ID0gbmV3IExpZ2h0Qm94KChuZXcgRGV2aWNlKS5pc01vYmlsZSgpICYmIHRoaXMuY29uZmlnLmlmcmFtZU9ubHkpO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vbignb3BlbicsIGZ1bmN0aW9uIGhhbmRsZU9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc3RNZXNzYWdlID0gbGlnaHRCb3guZ2V0UG9zdE1lc3NhZ2UoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU4pO1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTl9MSUdIVEJPWCk7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ29wZW4nLCBoYW5kbGVPcGVuKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdsb2FkJywgZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkxPQUQpO1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKCdsb2FkJywgaGFuZGxlTG9hZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkNMT1NFKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkNMT1NFX0xJR0hUQk9YKTtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZihBcHAuZXZlbnRUeXBlcy5VU0VSX0NPVU5UUlksIGhhbmRsZVVzZXJMb2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKCdjbG9zZScsIGhhbmRsZUNsb3NlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vbihBcHAuZXZlbnRUeXBlcy5VU0VSX0NPVU5UUlksIGhhbmRsZVVzZXJMb2NhbGUpO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vcGVuRnJhbWUodXJsLCB0aGlzLmNvbmZpZy5saWdodGJveCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBvbmUgb3IgbW9yZSBldmVudHMgdG8gdGhlIHdpZGdldFxyXG4gICAgICogQHBhcmFtIGV2ZW50IE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlcyAoaW5pdCwgb3BlbiwgbG9hZCwgY2xvc2UsIHN0YXR1cywgc3RhdHVzLWludm9pY2UsIHN0YXR1cy1kZWxpdmVyaW5nLCBzdGF0dXMtdHJvdWJsZWQsIHN0YXR1cy1kb25lKVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgQSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZFxyXG4gICAgICovXHJcbiAgICBBcHAucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGhhbmRsZXJEZWNvcmF0b3IgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGV2ZW50LCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlckRlY29yYXRvciwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXJcclxuICAgICAqIEBwYXJhbSBldmVudCBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXNcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIEEgaGFuZGxlciBmdW5jdGlvbiBwcmV2aW91c2x5IGF0dGFjaGVkIGZvciB0aGUgZXZlbnQocylcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgZGlyZWN0bHkgdG8gUGF5U3RhdGlvblxyXG4gICAgICogQHBhcmFtIGNvbW1hbmRcclxuICAgICAqIEBwYXJhbSBkYXRhXHJcbiAgICAgKi9cclxuICAgIEFwcC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbiAoY29tbWFuZCwgZGF0YSkge1xyXG4gICAgICAgIGlmICh0aGlzLnBvc3RNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uuc2VuZC5hcHBseSh0aGlzLnBvc3RNZXNzYWdlLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbiBmb3IgbWVzc2FnZSBldmVudCBmcm9tIFBheVN0YXRpb25cclxuICAgICAqIEBwYXJhbSBjb21tYW5kXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlclxyXG4gICAgICovXHJcbiAgICBBcHAucHJvdG90eXBlLm9uTWVzc2FnZSA9IGZ1bmN0aW9uIChjb21tYW5kLCBoYW5kbGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucG9zdE1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZS5vbi5hcHBseSh0aGlzLnBvc3RNZXNzYWdlLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIEFwcDtcclxufSkoKTtcclxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKTtcclxudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcclxudmFyIFBvc3RNZXNzYWdlID0gcmVxdWlyZSgnLi9wb3N0bWVzc2FnZScpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ2hpbGRXaW5kb3coKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcywgd3JhcEV2ZW50SW5OYW1lc3BhY2UpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIENoaWxkV2luZG93Ll9OQU1FU1BBQ0UgKyAnXycgKyBldmVudE5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIERFRkFVTFRfT1BUSU9OUyA9IHtcclxuICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBudWxsO1xyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmNoaWxkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyKGV2ZW50LCBkYXRhKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkV2luZG93ICYmICF0aGlzLmNoaWxkV2luZG93LmNsb3NlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGFkZEhhbmRsZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGF0Lm9uKCdjbG9zZScsIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLmNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5jaGlsZFdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2hpbGRXaW5kb3cuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGF0Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDcm9zcy13aW5kb3cgY29tbXVuaWNhdGlvblxyXG4gICAgICAgICAgICB0aGF0Lm1lc3NhZ2UgPSBuZXcgUG9zdE1lc3NhZ2UodGhhdC5jaGlsZFdpbmRvdyk7XHJcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignZGltZW5zaW9ucyB3aWRnZXQtZGV0ZWN0aW9uJywgZnVuY3Rpb24gaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ2xvYWQnKTtcclxuICAgICAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vZmYoJ2RpbWVuc2lvbnMgd2lkZ2V0LWRldGVjdGlvbicsIGhhbmRsZVdpZGdldERldGVjdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub24oJ3dpZGdldC1kZXRlY3Rpb24nLCBmdW5jdGlvbiBoYW5kbGVXaWRnZXREZXRlY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uuc2VuZCgnd2lkZ2V0LWRldGVjdGVkJywge3ZlcnNpb246IHZlcnNpb24sIGNoaWxkV2luZG93T3B0aW9uczogb3B0aW9uc30pO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZignd2lkZ2V0LWRldGVjdGlvbicsIGhhbmRsZVdpZGdldERldGVjdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub24oJ3N0YXR1cycsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ3N0YXR1cycsIGV2ZW50LmRldGFpbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGF0Lm9uKCdjbG9zZScsIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZigpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCd1c2VyLWNvdW50cnknLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCd1c2VyLWNvdW50cnknLCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ19zZWxmJzpcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBnbG9iYWwud2luZG93O1xyXG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcnMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdfcGFyZW50JzpcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBnbG9iYWwud2luZG93LnBhcmVudDtcclxuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnX2JsYW5rJzpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBnbG9iYWwud2luZG93Lm9wZW4odXJsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrV2luZG93ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXIgPSBnbG9iYWwuc2V0VGltZW91dChjaGVja1dpbmRvdywgMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGltZXIgPSBnbG9iYWwuc2V0VGltZW91dChjaGVja1dpbmRvdywgMTAwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ29wZW4nKTtcclxuICAgIH07XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xyXG4gICAgfTtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5nZXRQb3N0TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xyXG4gICAgfTtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5fTkFNRVNQQUNFID0gJ0NISUxEX1dJTkRPVyc7XHJcblxyXG4gICAgcmV0dXJuIENoaWxkV2luZG93O1xyXG59KSgpO1xyXG4iLCJ2YXIgYm93c2VyID0gcmVxdWlyZSgnYm93c2VyJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBEZXZpY2UoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNb2JpbGUgZGV2aWNlc1xyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIERldmljZS5wcm90b3R5cGUuaXNNb2JpbGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gYm93c2VyLm1vYmlsZSB8fCBib3dzZXIudGFibGV0O1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gRGV2aWNlO1xyXG59KSgpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5uYW1lID0gXCJYc29sbGFQYXlTdGF0aW9uV2lkZ2V0RXhjZXB0aW9uXCI7XHJcbiAgICB0aGlzLnRvU3RyaW5nID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgJzogJyArIHRoaXMubWVzc2FnZTtcclxuICAgIH0pLmJpbmQodGhpcyk7XHJcbn07XHJcbiIsImZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcclxuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcclxufVxyXG5cclxuZnVuY3Rpb24gdW5pcShsaXN0KSB7XHJcbiAgcmV0dXJuIGxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgsIGksIGEpIHtcclxuICAgIHJldHVybiBhLmluZGV4T2YoeCkgPT0gaVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB6aXBPYmplY3QocHJvcHMsIHZhbHVlcykge1xyXG4gIHZhciBpbmRleCA9IC0xLFxyXG4gICAgICBsZW5ndGggPSBwcm9wcyA/IHByb3BzLmxlbmd0aCA6IDAsXHJcbiAgICAgIHJlc3VsdCA9IHt9O1xyXG5cclxuICBpZiAobGVuZ3RoICYmICF2YWx1ZXMgJiYgIUFycmF5LmlzQXJyYXkocHJvcHNbMF0pKSB7XHJcbiAgICB2YWx1ZXMgPSBbXTtcclxuICB9XHJcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcclxuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XHJcbiAgICBpZiAodmFsdWVzKSB7XHJcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVzW2luZGV4XTtcclxuICAgIH0gZWxzZSBpZiAoa2V5KSB7XHJcbiAgICAgIHJlc3VsdFtrZXlbMF1dID0ga2V5WzFdO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJhbShhKSB7XHJcbiAgdmFyIHMgPSBbXTtcclxuXHJcbiAgdmFyIGFkZCA9IGZ1bmN0aW9uIChrLCB2KSB7XHJcbiAgICAgIHYgPSB0eXBlb2YgdiA9PT0gJ2Z1bmN0aW9uJyA/IHYoKSA6IHY7XHJcbiAgICAgIHYgPSB2ID09PSBudWxsID8gJycgOiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHY7XHJcbiAgICAgIHNbcy5sZW5ndGhdID0gZW5jb2RlVVJJQ29tcG9uZW50KGspICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHYpO1xyXG4gIH07XHJcblxyXG4gIHZhciBidWlsZFBhcmFtcyA9IGZ1bmN0aW9uIChwcmVmaXgsIG9iaikge1xyXG4gICAgICB2YXIgaSwgbGVuLCBrZXk7XHJcblxyXG4gICAgICBpZiAocHJlZml4KSB7XHJcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XHJcbiAgICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgIGJ1aWxkUGFyYW1zKFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJlZml4ICsgJ1snICsgKHR5cGVvZiBvYmpbaV0gPT09ICdvYmplY3QnICYmIG9ialtpXSA/IGkgOiAnJykgKyAnXScsXHJcbiAgICAgICAgICAgICAgICAgICAgICBvYmpbaV1cclxuICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKFN0cmluZyhvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xyXG4gICAgICAgICAgICAgIGZvciAoa2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhwcmVmaXggKyAnWycgKyBrZXkgKyAnXScsIG9ialtrZXldKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFkZChwcmVmaXgsIG9iaik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XHJcbiAgICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBvYmoubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICBhZGQob2JqW2ldLm5hbWUsIG9ialtpXS52YWx1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICBidWlsZFBhcmFtcyhrZXksIG9ialtrZXldKTtcclxuICAgICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcztcclxuICB9O1xyXG5cclxuICByZXR1cm4gYnVpbGRQYXJhbXMoJycsIGEpLmpvaW4oJyYnKTtcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBvbmNlKGYpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGYoYXJndW1lbnRzKTtcclxuICAgICAgZiA9IGZ1bmN0aW9uKCkge307XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRFdmVudE9iamVjdChjb250ZXh0LCB3cmFwRXZlbnRJbk5hbWVzcGFjZSkge1xyXG4gICAgdmFyIGR1bW15V3JhcHBlciA9IGZ1bmN0aW9uKGV2ZW50KSB7IHJldHVybiBldmVudCB9O1xyXG4gICAgdmFyIHdyYXBFdmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UgfHwgZHVtbXlXcmFwcGVyO1xyXG4gICAgdmFyIGV2ZW50c0xpc3QgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKHN0cikge1xyXG4gICAgICByZXR1cm4gLyAvLnRlc3Qoc3RyKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRyaWdnZXI6IChmdW5jdGlvbihldmVudE5hbWUsIGRhdGEpIHtcclxuICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50SW5OYW1lc3BhY2UsIHtkZXRhaWw6IGRhdGF9KTsgLy8gTm90IHdvcmtpbmcgaW4gSUVcclxuICAgICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudEluTmFtZXNwYWNlLCB0cnVlLCB0cnVlLCBkYXRhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICB9KS5iaW5kKGNvbnRleHQpLFxyXG4gICAgICBvbjogKGZ1bmN0aW9uKGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZEV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICBldmVudHNMaXN0LnB1c2goe25hbWU6IGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZTogaGFuZGxlLCBvcHRpb25zOiBvcHRpb25zIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzU3RyaW5nQ29udGFpbmVkU3BhY2UoZXZlbnROYW1lKSkge1xyXG4gICAgICAgICAgdmFyIGV2ZW50cyA9IGV2ZW50TmFtZS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24ocGFyc2VkRXZlbnROYW1lKSB7XHJcbiAgICAgICAgICAgIGFkZEV2ZW50KHBhcnNlZEV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYWRkRXZlbnQoZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0pLmJpbmQoY29udGV4dCksXHJcblxyXG4gICAgICBvZmY6IChmdW5jdGlvbihldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IG9mZkFsbEV2ZW50cyA9ICFldmVudE5hbWUgJiYgIWhhbmRsZSAmJiAhb3B0aW9ucztcclxuXHJcbiAgICAgICAgaWYgKG9mZkFsbEV2ZW50cykge1xyXG4gICAgICAgICAgZXZlbnRzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQubmFtZSwgZXZlbnQuaGFuZGxlLCBldmVudC5vcHRpb25zKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlRXZlbnQoZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcclxuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRJbk5hbWVzcGFjZSwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgICAgICAgIGV2ZW50c0xpc3QgPSBldmVudHNMaXN0LmZpbHRlcihmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnQubmFtZSAhPT0gZXZlbnRJbk5hbWVzcGFjZTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzU3RyaW5nQ29udGFpbmVkU3BhY2UoZXZlbnROYW1lKSkge1xyXG4gICAgICAgICAgdmFyIGV2ZW50cyA9IGV2ZW50TmFtZS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24ocGFyc2VkRXZlbnROYW1lKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50KHBhcnNlZEV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVtb3ZlRXZlbnQoZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0pLmJpbmQoY29udGV4dClcclxuICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBhZGRFdmVudE9iamVjdDogYWRkRXZlbnRPYmplY3QsXHJcbiAgaXNFbXB0eTogaXNFbXB0eSxcclxuICB1bmlxOiB1bmlxLFxyXG4gIHppcE9iamVjdDogemlwT2JqZWN0LFxyXG4gIHBhcmFtOiBwYXJhbSxcclxuICBvbmNlOiBvbmNlLFxyXG59XHJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJyk7XHJcbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XHJcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpZ2h0Qm94KGlzTW9iaWxlKSB7XHJcbiAgICAgICAgcmVxdWlyZSgnLi9zdHlsZXMvbGlnaHRib3guc2NzcycpO1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBpc01vYmlsZSA/IERFRkFVTFRfT1BUSU9OU19NT0JJTEUgOiBERUZBVUxUX09QVElPTlM7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgQ0xBU1NfUFJFRklYID0gJ3hwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveCc7XHJcbiAgICB2YXIgQ09NTU9OX09QVElPTlMgPSB7XHJcbiAgICAgICAgekluZGV4OiAxMDAwLFxyXG4gICAgICAgIG92ZXJsYXlPcGFjaXR5OiAnLjYnLFxyXG4gICAgICAgIG92ZXJsYXlCYWNrZ3JvdW5kOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgY29udGVudEJhY2tncm91bmQ6ICcjZmZmZmZmJyxcclxuICAgICAgICBjbG9zZUJ5S2V5Ym9hcmQ6IHRydWUsXHJcbiAgICAgICAgY2xvc2VCeUNsaWNrOiB0cnVlLFxyXG4gICAgICAgIG1vZGFsOiBmYWxzZSxcclxuICAgICAgICBzcGlubmVyOiAneHNvbGxhJyxcclxuICAgICAgICBzcGlubmVyQ29sb3I6IG51bGwsXHJcbiAgICAgICAgc3Bpbm5lclVybDogbnVsbCxcclxuICAgICAgICBzcGlubmVyUm90YXRpb25QZXJpb2Q6IDBcclxuICAgIH07XHJcbiAgICB2YXIgREVGQVVMVF9PUFRJT05TID0gT2JqZWN0LmFzc2lnbih7fSwgQ09NTU9OX09QVElPTlMsIHtcclxuICAgICAgICB3aWR0aDogbnVsbCxcclxuICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICBjb250ZW50TWFyZ2luOiAnMTBweCdcclxuICAgIH0pO1xyXG4gICAgdmFyIERFRkFVTFRfT1BUSU9OU19NT0JJTEUgPSBPYmplY3QuYXNzaWduKHt9LCBDT01NT05fT1BUSU9OUywge1xyXG4gICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsIFxyXG4gICAgICAgIGNvbnRlbnRNYXJnaW46ICcwcHgnXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU1BJTk5FUlMgPSB7XHJcbiAgICAgICAgeHNvbGxhOiByZXF1aXJlKCcuL3NwaW5uZXJzL3hzb2xsYS5zdmcnKSxcclxuICAgICAgICByb3VuZDogcmVxdWlyZSgnLi9zcGlubmVycy9yb3VuZC5zdmcnKSxcclxuICAgICAgICBub25lOiAnICdcclxuICAgIH07XHJcblxyXG4gICAgdmFyIE1JTl9QU19ESU1FTlNJT05TID0ge1xyXG4gICAgICAgIGhlaWdodDogNTAwLFxyXG4gICAgICAgIHdpZHRoOiA2MDBcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGhhbmRsZUtleXVwRXZlbnROYW1lID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoJ2tleXVwJyk7XHJcbiAgICB2YXIgaGFuZGxlUmVzaXplRXZlbnROYW1lID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoJ3Jlc2l6ZScpO1xyXG5cclxuICAgIHZhciBoYW5kbGVHbG9iYWxLZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG4gICAgICAgIHZhciBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XHJcbiAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICBjbGlja0V2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFuZGxlU3BlY2lmaWNLZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LnNvdXJjZUV2ZW50LndoaWNoID09IDI3KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFuZGxlR2xvYmFsUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHJlc2l6ZUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XHJcbiAgICAgICAgcmVzaXplRXZlbnQuaW5pdEV2ZW50KGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChyZXNpemVFdmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIExpZ2h0Qm94Ll9OQU1FU1BBQ0UgKyAnXycgKyBldmVudE5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5tZWFzdXJlU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkgeyAvLyB0aHggd2Fsc2g6IGh0dHBzOi8vZGF2aWR3YWxzaC5uYW1lL2RldGVjdC1zY3JvbGxiYXItd2lkdGhcclxuICAgICAgICB2YXIgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBzY3JvbGxEaXYuY2xhc3NMaXN0LmFkZChcInNjcm9sbGJhci1tZWFzdXJlXCIpO1xyXG4gICAgICAgIHNjcm9sbERpdi5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgIFwidG9wOiAtOTk5OXB4XCIgK1xyXG4gICAgICAgICAgICBcIndpZHRoOiA1MHB4XCIgK1xyXG4gICAgICAgICAgICBcImhlaWdodDogNTBweFwiICtcclxuICAgICAgICAgICAgXCJvdmVyZmxvdzogc2Nyb2xsXCJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XHJcblxyXG4gICAgICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aDtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcm9sbERpdik7XHJcblxyXG4gICAgICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9wZW5GcmFtZSA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHZhciBIYW5kbGVCb3VuZFNwZWNpZmljS2V5dXAgPSBoYW5kbGVTcGVjaWZpY0tleXVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAgICAgdmFyIHNwaW5uZXIgPSBvcHRpb25zLnNwaW5uZXIgPT09ICdjdXN0b20nICYmICEhb3B0aW9ucy5zcGlubmVyVXJsID9cclxuICAgICAgICAgICAgJzxpbWcgY2xhc3M9XCJzcGlubmVyLWN1c3RvbVwiIHNyYz1cIicgKyBlbmNvZGVVUkkob3B0aW9ucy5zcGlubmVyVXJsKSArICdcIiAvPicgOiBTUElOTkVSU1tvcHRpb25zLnNwaW5uZXJdIHx8IE9iamVjdC52YWx1ZXMoU1BJTk5FUlMpWzBdO1xyXG5cclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgdmFyIGhvc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgaG9zdC5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXg7XHJcblxyXG4gICAgICAgICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBvdmVybGF5LmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctb3ZlcmxheSc7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBjb250ZW50LmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctY29udGVudCcgKyAnICcgKyBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnRfX2hpZGRlbic7XHJcblxyXG4gICAgICAgICAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XHJcbiAgICAgICAgICAgIGlmcmFtZS5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnQtaWZyYW1lJztcclxuICAgICAgICAgICAgaWZyYW1lLnNyYyA9IHNldHRpbmdzLnVybDtcclxuICAgICAgICAgICAgaWZyYW1lLmZyYW1lQm9yZGVyID0gJzAnO1xyXG4gICAgICAgICAgICBpZnJhbWUuYWxsb3dGdWxsc2NyZWVuID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1zcGlubmVyJztcclxuICAgICAgICAgICAgc3Bpbm5lci5pbm5lckhUTUwgPSBzZXR0aW5ncy5zcGlubmVyO1xyXG5cclxuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG5cclxuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChvdmVybGF5KTtcclxuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChjb250ZW50KTtcclxuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChzcGlubmVyKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBob3N0O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBib2R5RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xyXG4gICAgICAgIHZhciBsaWdodEJveEVsZW1lbnQgPSB0ZW1wbGF0ZSh7XHJcbiAgICAgICAgICAgIHByZWZpeDogQ0xBU1NfUFJFRklYLFxyXG4gICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgc3Bpbm5lcjogc3Bpbm5lclxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBsaWdodEJveE92ZXJsYXlFbGVtZW50ID0gbGlnaHRCb3hFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1vdmVybGF5Jyk7XHJcbiAgICAgICAgdmFyIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLWNvbnRlbnQnKTtcclxuICAgICAgICB2YXIgbGlnaHRCb3hJZnJhbWVFbGVtZW50ID0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctY29udGVudC1pZnJhbWUnKTtcclxuICAgICAgICB2YXIgbGlnaHRCb3hTcGlubmVyRWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctc3Bpbm5lcicpO1xyXG5cclxuICAgICAgICB2YXIgcHNEaW1lbnNpb25zID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogd2l0aERlZmF1bHRQWFVuaXQoTUlOX1BTX0RJTUVOU0lPTlMud2lkdGgpLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHdpdGhEZWZhdWx0UFhVbml0KE1JTl9QU19ESU1FTlNJT05TLmhlaWdodClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB3aXRoRGVmYXVsdFBYVW5pdCh2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgaXNTdHJpbmdXaXRob3V0VW5pdCA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgU3RyaW5nKHBhcnNlRmxvYXQodmFsdWUpKS5sZW5ndGggPT09IHZhbHVlLmxlbmd0aDtcclxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nV2l0aG91dFVuaXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSArICdweCcgOiB2YWx1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGlnaHRCb3hFbGVtZW50LnN0eWxlLnpJbmRleCA9IG9wdGlvbnMuekluZGV4O1xyXG5cclxuICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBvcHRpb25zLm92ZXJsYXlPcGFjaXR5O1xyXG4gICAgICAgIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5vdmVybGF5QmFja2dyb3VuZDtcclxuXHJcbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLmNvbnRlbnRCYWNrZ3JvdW5kO1xyXG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubWFyZ2luID0gd2l0aERlZmF1bHRQWFVuaXQob3B0aW9ucy5jb250ZW50TWFyZ2luKTtcclxuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gb3B0aW9ucy53aWR0aCA/IHdpdGhEZWZhdWx0UFhVbml0KG9wdGlvbnMud2lkdGgpIDogJ2F1dG8nO1xyXG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyB3aXRoRGVmYXVsdFBYVW5pdChvcHRpb25zLmhlaWdodCkgOiAnYXV0byc7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLnNwaW5uZXJDb2xvcikge1xyXG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BhdGgnKS5zdHlsZS5maWxsID0gb3B0aW9ucy5zcGlubmVyQ29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5zcGlubmVyID09PSAnY3VzdG9tJykge1xyXG4gICAgICAgICAgICB2YXIgc3Bpbm5lckN1c3RvbSA9IGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNwaW5uZXItY3VzdG9tJyk7XHJcbiAgICAgICAgICAgIHNwaW5uZXJDdXN0b20uc3R5bGVbJy13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uJ10gPSBvcHRpb25zLnNwaW5uZXJSb3RhdGlvblBlcmlvZCArICdzOyc7XHJcbiAgICAgICAgICAgIHNwaW5uZXJDdXN0b20uc3R5bGVbJ2FuaW1hdGlvbi1kdXJhdGlvbiddID0gb3B0aW9ucy5zcGlubmVyUm90YXRpb25QZXJpb2QgKyAnczsnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUNsaWNrKSB7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XHJcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQobGlnaHRCb3hFbGVtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUtleWJvYXJkKSB7XHJcblxyXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGhhbmRsZUtleXVwRXZlbnROYW1lLCBIYW5kbGVCb3VuZFNwZWNpZmljS2V5dXApO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVHbG9iYWxLZXl1cCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHNob3dDb250ZW50ID0gSGVscGVycy5vbmNlKChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGhpZGVTcGlubmVyKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfUFJFRklYICsgJy1jb250ZW50X19oaWRkZW4nKTtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2xvYWQnKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdmFyIGxpZ2h0Qm94UmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoID8gb3B0aW9ucy53aWR0aCA6IHBzRGltZW5zaW9ucy53aWR0aDtcclxuICAgICAgICAgICAgdmFyIGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0ID8gb3B0aW9ucy5oZWlnaHQgOiBwc0RpbWVuc2lvbnMuaGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzhweCc7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSB3aXRoRGVmYXVsdFBYVW5pdCh3aWR0aCk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gd2l0aERlZmF1bHRQWFVuaXQoaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb250YWluZXJXaWR0aCA9IGxpZ2h0Qm94RWxlbWVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9IGxpZ2h0Qm94RWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29udGVudFdpZHRoID0gb3V0ZXJXaWR0aChsaWdodEJveENvbnRlbnRFbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnRIZWlnaHQgPSBvdXRlckhlaWdodChsaWdodEJveENvbnRlbnRFbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBob3JNYXJnaW4gPSBjb250ZW50V2lkdGggLSBsaWdodEJveENvbnRlbnRFbGVtZW50Lm9mZnNldFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgdmVydE1hcmdpbiA9IGNvbnRlbnRIZWlnaHQgLSBsaWdodEJveENvbnRlbnRFbGVtZW50Lm9mZnNldEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHZhciBob3JEaWZmID0gY29udGFpbmVyV2lkdGggLSBjb250ZW50V2lkdGgsXHJcbiAgICAgICAgICAgICAgICB2ZXJ0RGlmZiA9IGNvbnRhaW5lckhlaWdodCAtIGNvbnRlbnRIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoaG9yRGlmZiA8IDApIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSBjb250YWluZXJXaWR0aCAtIGhvck1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmxlZnQgPSBNYXRoLnJvdW5kKGhvckRpZmYgLyAyKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh2ZXJ0RGlmZiA8IDApIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0IC0gdmVydE1hcmdpbiArICdweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLnRvcCA9IE1hdGgucm91bmQodmVydERpZmYgLyAyKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xyXG4gICAgICAgICAgICBsaWdodEJveFJlc2l6ZSA9IEhlbHBlcnMub25jZShsaWdodEJveFJlc2l6ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG91dGVyV2lkdGgoZWwpIHtcclxuICAgICAgICAgICAgdmFyIHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xyXG5cclxuICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luTGVmdCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5SaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG91dGVySGVpZ2h0KGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBlbC5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xyXG5cclxuICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpblRvcCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5Cb3R0b20pO1xyXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGJvZHlTdHlsZXM7XHJcbiAgICAgICAgdmFyIGhpZGVTY3JvbGxiYXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBib2R5U3R5bGVzID0gSGVscGVycy56aXBPYmplY3QoWydvdmVyZmxvdycsICdwYWRkaW5nUmlnaHQnXS5tYXAoZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIGdldENvbXB1dGVkU3R5bGUoYm9keUVsZW1lbnQpW2tleV1dO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYm9keVBhZCA9IHBhcnNlSW50KChnZXRDb21wdXRlZFN0eWxlKGJvZHlFbGVtZW50KVsncGFkZGluZ1JpZ2h0J10gfHwgMCksIDEwKTtcclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gd2l0aERlZmF1bHRQWFVuaXQoYm9keVBhZCArIHRoaXMubWVhc3VyZVNjcm9sbGJhcigpKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB2YXIgcmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhib2R5U3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlW2tleV0gPSBib2R5U3R5bGVzW2tleV07XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHNob3dTcGlubmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBoaWRlU3Bpbm5lciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2FkVGltZXI7XHJcbiAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gIShvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSA/IChvcHRpb25zLnJlc2l6ZVRpbWVvdXQgfHwgMzAwMDApIDogMTAwMDsgLy8gMzAwMDAgaWYgcHNEaW1lbnNpb25zIHdpbGwgbm90IGFycml2ZSBhbmQgY3VzdG9tIHRpbWVvdXQgaXMgbm90IHByb3ZpZGVkXHJcbiAgICAgICAgICAgIGxvYWRUaW1lciA9IGdsb2JhbC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93Q29udGVudCgpO1xyXG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcclxuICAgICAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBpZnJhbWVXaW5kb3cgPSBsaWdodEJveElmcmFtZUVsZW1lbnQuY29udGVudFdpbmRvdyB8fCBsaWdodEJveElmcmFtZUVsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vIENyb3NzLXdpbmRvdyBjb21tdW5pY2F0aW9uXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKGlmcmFtZVdpbmRvdyk7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zJywgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93Q29udGVudCgpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zJywgKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBldmVudC5kZXRhaWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5kaW1lbnNpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHNEaW1lbnNpb25zID0gSGVscGVycy56aXBPYmplY3QoWyd3aWR0aCcsICdoZWlnaHQnXS5tYXAoZnVuY3Rpb24gKGRpbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2RpbSwgTWF0aC5tYXgoTUlOX1BTX0RJTUVOU0lPTlNbZGltXSB8fCAwLCBkYXRhLmRpbWVuc2lvbnNbZGltXSB8fCAwKSArICdweCddO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCd3aWRnZXQtZGV0ZWN0aW9uJywgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBsaWdodEJveE9wdGlvbnM6IG9wdGlvbnN9KTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3dpZGdldC1jbG9zZScsIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xyXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignc3RhdHVzJywgKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3VzZXItY291bnRyeScsIChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ3VzZXItY291bnRyeScsIGV2ZW50LmRldGFpbCk7XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIC8vIFJlc2l6ZVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSwgbGlnaHRCb3hSZXNpemUpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVHbG9iYWxSZXNpemUpO1xyXG5cclxuICAgICAgICAvLyBDbGVhbiB1cCBhZnRlciBjbG9zZVxyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICB0aGlzLm9uKCdjbG9zZScsIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vZmYoKTtcclxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgSGFuZGxlQm91bmRTcGVjaWZpY0tleXVwKVxyXG4gICAgICAgICAgICBib2R5RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIGhhbmRsZUdsb2JhbEtleXVwKTtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVHbG9iYWxSZXNpemUpXHJcblxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVSZXNpemVFdmVudE5hbWUsIGxpZ2h0Qm94UmVzaXplKTtcclxuICAgICAgICAgICAgbGlnaHRCb3hFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobGlnaHRCb3hFbGVtZW50KTtcclxuICAgICAgICAgICAgcmVzZXRTY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgdGhhdC5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzaG93U3Bpbm5lcigpO1xyXG4gICAgICAgIGhpZGVTY3JvbGxiYXIoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnb3BlbicpO1xyXG4gICAgfTtcclxuXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUuY2xvc2VGcmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5tb2RhbCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYuYXBwbHkodGhpcy5ldmVudE9iamVjdCwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcblxyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLmdldFBvc3RNZXNzYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94Ll9OQU1FU1BBQ0UgPSAnLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveCc7XHJcblxyXG4gICAgcmV0dXJuIExpZ2h0Qm94O1xyXG59KSgpO1xyXG4iLCJmdW5jdGlvbiBvYmplY3RBc3NpZ24oKSB7XHJcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnbiBQb2x5ZmlsbFxyXG4gIE9iamVjdC5hc3NpZ258fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QsXCJhc3NpZ25cIix7ZW51bWVyYWJsZTohMSxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6ZnVuY3Rpb24oZSxyKXtcInVzZSBzdHJpY3RcIjtpZihudWxsPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmaXJzdCBhcmd1bWVudCB0byBvYmplY3RcIik7Zm9yKHZhciB0PU9iamVjdChlKSxuPTE7bjxhcmd1bWVudHMubGVuZ3RoO24rKyl7dmFyIG89YXJndW1lbnRzW25dO2lmKG51bGwhPW8pZm9yKHZhciBhPU9iamVjdC5rZXlzKE9iamVjdChvKSksYz0wLGI9YS5sZW5ndGg7YzxiO2MrKyl7dmFyIGk9YVtjXSxsPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobyxpKTt2b2lkIDAhPT1sJiZsLmVudW1lcmFibGUmJih0W2ldPW9baV0pfX1yZXR1cm4gdH19KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXJyYXlGb3JFYWNoKCkge1xyXG4gIEFycmF5LnByb3RvdHlwZS5mb3JFYWNofHwoQXJyYXkucHJvdG90eXBlLmZvckVhY2g9ZnVuY3Rpb24ocixvKXt2YXIgdCxuO2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcihcIiB0aGlzIGlzIG51bGwgb3Igbm90IGRlZmluZWRcIik7dmFyIGU9T2JqZWN0KHRoaXMpLGk9ZS5sZW5ndGg+Pj4wO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcihyK1wiIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO2Zvcihhcmd1bWVudHMubGVuZ3RoPjEmJih0PW8pLG49MDtuPGk7KXt2YXIgZjtuIGluIGUmJihmPWVbbl0sci5jYWxsKHQsZixuLGUpKSxuKyt9fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5UG9seWZpbGxzKCkge1xyXG4gIG9iamVjdEFzc2lnbigpO1xyXG4gIGFycmF5Rm9yRWFjaCgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBhcHBseVBvbHlmaWxsczogYXBwbHlQb2x5ZmlsbHNcclxufVxyXG4iLCJ2YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIFBvc3RNZXNzYWdlLl9OQU1FU1BBQ0UgKyAnXycgKyBldmVudE5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gUG9zdE1lc3NhZ2Uod2luZG93KSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcywgd3JhcEV2ZW50SW5OYW1lc3BhY2UpO1xyXG4gICAgICAgIHRoaXMubGlua2VkV2luZG93ID0gd2luZG93O1xyXG5cclxuICAgICAgICBnbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgZ2xvYmFsLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgIT09IHRoaXMubGlua2VkV2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge307XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnQuZGF0YSA9PT0gJ3N0cmluZycgJiYgZ2xvYmFsLkpTT04gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZ2xvYmFsLkpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmNvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihtZXNzYWdlLmNvbW1hbmQsIG1lc3NhZ2UuZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xyXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLmV2ZW50T2JqZWN0ID0gbnVsbDtcclxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5saW5rZWRXaW5kb3cgPSBudWxsO1xyXG5cclxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cclxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oY29tbWFuZCwgZGF0YSwgdGFyZ2V0T3JpZ2luKSB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBkYXRhID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGFyZ2V0T3JpZ2luID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGFyZ2V0T3JpZ2luID0gJyonO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmxpbmtlZFdpbmRvdyB8fCB0aGlzLmxpbmtlZFdpbmRvdy5wb3N0TWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IGdsb2JhbC53aW5kb3cuSlNPTiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlua2VkV2luZG93LnBvc3RNZXNzYWdlKGdsb2JhbC5KU09OLnN0cmluZ2lmeSh7ZGF0YTogZGF0YSwgY29tbWFuZDogY29tbWFuZH0pLCB0YXJnZXRPcmlnaW4pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZSwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBQb3N0TWVzc2FnZS5fTkFNRVNQQUNFID0gJ1BPU1RfTUVTU0FHRSc7XHJcblxyXG5cclxuICAgIHJldHVybiBQb3N0TWVzc2FnZTtcclxufSkoKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgd2lkdGg9XFxcIjQ3cHhcXFwiIGhlaWdodD1cXFwiNDdweFxcXCIgY2xhc3M9XFxcInNwaW5uZXItcm91bmRcXFwiPjxwYXRoIGQ9XFxcIk00Ljc4NTI3MjgsMTAuNDIxMDg3NSBDMi45NDExMTY2NCwxMy4wNTUyMTk3IDEuNjM3NzcxMDksMTYuMDk0NjEwNiAxLjAzNzUzOTU2LDE5LjM3Njg1NTYgTDUuMTY2Mzg5NzEsMTkuMzc2ODU1NiBDNS42NDI5NjE1LDE3LjE4NzU1NCA2LjUwMTI1MjQzLDE1LjEzOTE2NCA3LjY2NzY4ODk5LDEzLjMwNTMwNSBMNS45NTU3MjQyOCwxMS41OTIyNzA1IEw0Ljc4NTI3MjgsMTAuNDIxMDg3NSBMNC43ODUyNzI4LDEwLjQyMTA4NzUgWiBNMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IEMxMy4xMjc0ODczLDIuODkwODA2MSAxNi4xOTY1OTc2LDEuNTg2NzQ2NDggMTkuNTEwMDE2MSwxIEwxOS41MTAwMTYxLDQuOTk1MjM5MzQgQzE3LjI3MTA5MjMsNS40ODc5Nzc4MiAxNS4xODAzMTkzLDYuMzgwODUyOSAxMy4zMTY2OTA3LDcuNTk0ODIxNTMgTDExLjYzMzczMzksNS45MTA4MTI5MyBMMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IEwxMC40NjkzMDQ4LDQuNzQ1NjU2MTUgWiBNNDIuMjQyNjMwOSwzNi41Mzg4Mzg2IEM0NC4xMTEyNzgyLDMzLjg1NzUwMTYgNDUuNDIwNjQ2MSwzMC43NTgxNTA0IDQ2LDI3LjQxMTcyNjkgTDQxLjk0NDEyMTEsMjcuNDExNzI2OSBDNDEuNDUyNzk0NSwyOS42NjE4OTI2IDQwLjU1ODM2OTIsMzEuNzYyOTExIDM5LjM0MDQ0MTIsMzMuNjM0OTM1NiBMNDEuMDMzMjM0NywzNS4zMjg3ODY5IEw0Mi4yNDI1MzA2LDM2LjUzODgzODYgTDQyLjI0MjYzMDksMzYuNTM4ODM4NiBaIE0zNi41NzA3NDQxLDQyLjIyNjQyMjcgQzMzLjkxNjc3NzMsNDQuMDg2Nzk2NyAzMC44NTA5NzkzLDQ1LjM5NzI4NDIgMjcuNTM5ODY5Myw0NS45OTExNjE2IEwyNy41Mzk4NjkzLDQxLjc5NjA1NDkgQzI5LjczNzY0MDIsNDEuMzIwMjkwMSAzMS43OTM2ODQxLDQwLjQ1OTM1MzYgMzMuNjMzNjI0NiwzOS4yODc1NjggTDM1LjM1NTQyNTgsNDEuMDEwNDQ1MyBMMzYuNTcwNzQ0MSw0Mi4yMjY1MjMxIEwzNi41NzA3NDQxLDQyLjIyNjQyMjcgWiBNNC43MTE3OTk2NSwzNi40NzMxNTM1IEMyLjg2NzQ0Mjc0LDMzLjgwNjk4MjMgMS41NzQ2MzYzNywzMC43MzA5MzIyIDEsMjcuNDExODI3MyBMNS4xNjg4OTkwNCwyNy40MTE4MjczIEM1LjY0ODI4MTI4LDI5LjYwNzM1NTkgNi41MTE1OTA4NywzMS42NjEwNjkgNy42ODQ2NTIwNSwzMy40OTg0NDMyIEw1Ljk1NTcyNDI4LDM1LjIyODQ1MTUgTDQuNzExNzk5NjUsMzYuNDczMTUzNSBMNC43MTE3OTk2NSwzNi40NzMxNTM1IFogTTEwLjM2NDAxMzMsNDIuMTgwNDIzIEMxMy4wNDYyODU0LDQ0LjA3NDU0MzUgMTYuMTUyNzM0NSw0NS40MDU1MiAxOS41MTAxMTY1LDQ2IEwxOS41MTAxMTY1LDQxLjc4MjE5NDcgQzE3LjI4MTczMTksNDEuMjkxNjY1OCAxNS4yMDAwOTI4LDQwLjQwNDgxNjkgMTMuMzQzMDg4OSwzOS4xOTk1ODYyIEwxMS42MzM3MzM5LDQwLjkxMDAwOTQgTDEwLjM2NDAxMzMsNDIuMTgwNTIzNSBMMTAuMzY0MDEzMyw0Mi4xODA0MjMgWiBNNDIuMTY4ODU2NywxMC4zNTU3MDM4IEM0NC4wMzczMDMxLDEzLjAwNDgwMDggNDUuMzU3NDExLDE2LjA2NzQ5MjkgNDUuOTYyNjYxMiwxOS4zNzY4NTU2IEw0MS45NDY5MzE2LDE5LjM3Njg1NTYgQzQxLjQ1ODUxNTgsMTcuMTMyODE2NCA0MC41NjkyMDk1LDE1LjAzNjkyMDIgMzkuMzU4MDA2NSwxMy4xNjg0MTA5IEw0MS4wMzM1MzU4LDExLjQ5MTgzNDYgTDQyLjE2ODk1NywxMC4zNTU3MDM4IEw0Mi4xNjg4NTY3LDEwLjM1NTcwMzggWiBNMzYuNDY1MTUxNiw0LjY5OTk1NzgyIEMzMy44MzU1NzU0LDIuODc4NjUzMzYgMzAuODA3MTE2MiwxLjU5NDg4MTc5IDI3LjU0MDA3MDEsMS4wMDg4MzgzNiBMMjcuNTQwMDcwMSw0Ljk4MTE3ODMxIEMyOS43NDg0ODA1LDUuNDU5MTUyNzIgMzEuODEzNzU4Nyw2LjMyNjAxNDkgMzMuNjYwNDI0Miw3LjUwNjQzNzk0IEwzNS4zNTU1MjYyLDUuODEwMjc2NiBMMzYuNDY1MTUxNiw0LjY5OTk1NzgyIEwzNi40NjUxNTE2LDQuNjk5OTU3ODIgWlxcXCIgZmlsbD1cXFwiI0NDQ0NDQ1xcXCI+PC9wYXRoPjwvc3ZnPlwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhXFxcIiB3aWR0aD1cXFwiNTZcXFwiIGhlaWdodD1cXFwiNTVcXFwiPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS14XFxcIiBkPVxcXCJNMjEuMDMgNS4wNDJsLTIuMTEyLTIuMTU2LTMuNjU3IDMuNjk1LTMuNjU3LTMuNjk1LTIuMTEyIDIuMTU2IDMuNjU5IDMuNjczLTMuNjU5IDMuNjk2IDIuMTEyIDIuMTU3IDMuNjU3LTMuNjk3IDMuNjU3IDMuNjk3IDIuMTEyLTIuMTU3LTMuNjQ4LTMuNjk2IDMuNjQ4LTMuNjczelxcXCIgZmlsbD1cXFwiI0YyNTQyRFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1zXFxcIiBkPVxcXCJNNDEuMjMyIDYuODk2bDIuOTQxLTIuOTc0LTIuMTM0LTIuMTMyLTIuOTIgMi45NzMtLjAwNS0uMDA4LTIuMTM0IDIuMTM1LjAwNS4wMDgtLjAwNS4wMDUgMy43OTIgMy44Mi0yLjkxNSAyLjk0NyAyLjExMiAyLjE1NiA1LjA2LTUuMTExLTMuNzk4LTMuODE2LjAwMS0uMDAxelxcXCIgZmlsbD1cXFwiI0ZDQ0EyMFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1vXFxcIiBkPVxcXCJNNDguMDY2IDI5LjE1OWMtMS41MzYgMC0yLjc2MSAxLjI2My0yLjc2MSAyLjc5IDAgMS41MjQgMS4yMjYgMi43NjUgMi43NjEgMi43NjUgMS41MDkgMCAyLjczNi0xLjI0MiAyLjczNi0yLjc2NSAwLTEuNTI2LTEuMjI3LTIuNzktMi43MzYtMi43OW0wIDguNTkzYy0zLjE3OSAwLTUuNzcxLTIuNTk0LTUuNzcxLTUuODA0IDAtMy4yMTMgMi41OTItNS44MDggNS43NzEtNS44MDggMy4xNTUgMCA1Ljc0NSAyLjU5NCA1Ljc0NSA1LjgwOCAwIDMuMjEtMi41ODkgNS44MDQtNS43NDUgNS44MDRcXFwiIGZpbGw9XFxcIiM4QzNFQTRcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtbFxcXCIgZD1cXFwiTTI0LjM4OSA0Mi4zMjNoMi45OXYxMC40MzdoLTIuOTl2LTEwLjQzN3ptNC4zMzQgMGgyLjk4OXYxMC40MzdoLTIuOTg5di0xMC40Mzd6XFxcIiBmaWxsPVxcXCIjQjVEQzIwXFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLWFcXFwiIGQ9XFxcIk03Ljc5NiAzMS44OThsMS40MDQgMi40NTdoLTIuODM1bDEuNDMxLTIuNDU3aC0uMDAxem0tLjAwMS01Ljc1N2wtNi4zNjMgMTEuMTAyaDEyLjcwM2wtNi4zNDEtMTEuMTAyelxcXCIgZmlsbD1cXFwiIzY2Q0NEQVxcXCI+PC9wYXRoPjwvc3ZnPlwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdzYXNzaWZ5JykoJy54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3h7cG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWluIDAuMTVzO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWluIDAuMTVzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtb3ZlcmxheXtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7Ym90dG9tOjA7cmlnaHQ6MDt6LWluZGV4OjF9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50e3Bvc2l0aW9uOnJlbGF0aXZlO3RvcDowO2xlZnQ6MDt6LWluZGV4OjN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50X19oaWRkZW57dmlzaWJpbGl0eTpoaWRkZW47ei1pbmRleDotMX0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWNvbnRlbnQtaWZyYW1le3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudH0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXJ7cG9zaXRpb246YWJzb2x1dGU7dG9wOjUwJTtsZWZ0OjUwJTtkaXNwbGF5Om5vbmU7ei1pbmRleDoyO3BvaW50ZXItZXZlbnRzOm5vbmV9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYXt3aWR0aDo1NnB4O2hlaWdodDo1NXB4O21hcmdpbi10b3A6LTI4cHg7bWFyZ2luLWxlZnQ6LTI2cHh9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEteCwueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1zLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLW8sLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtbCwueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1hey13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDstd2Via2l0LWFuaW1hdGlvbi1maWxsLW1vZGU6Ym90aDthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5IDFzIGluZmluaXRlIGVhc2UtaW4tb3V0O2FuaW1hdGlvbi1maWxsLW1vZGU6Ym90aH0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS14ey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OjBzO2FuaW1hdGlvbi1kZWxheTowc30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1zey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi4yczthbmltYXRpb24tZGVsYXk6LjJzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLW97LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjRzO2FuaW1hdGlvbi1kZWxheTouNHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtbHstd2Via2l0LWFuaW1hdGlvbi1kZWxheTouNnM7YW5pbWF0aW9uLWRlbGF5Oi42c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1hey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi44czthbmltYXRpb24tZGVsYXk6LjhzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci1yb3VuZHttYXJnaW4tdG9wOi0yM3B4O21hcmdpbi1sZWZ0Oi0yM3B4Oy13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIDNzIGluZmluaXRlIGxpbmVhcjthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gM3MgaW5maW5pdGUgbGluZWFyfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci1jdXN0b217LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gaW5maW5pdGUgbGluZWFyO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiBpbmZpbml0ZSBsaW5lYXJ9QC13ZWJraXQta2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheXswJSw4MCUsMTAwJXtvcGFjaXR5OjB9NDAle29wYWNpdHk6MX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXl7MCUsODAlLDEwMCV7b3BhY2l0eTowfTQwJXtvcGFjaXR5OjF9fUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWlue2Zyb217b3BhY2l0eTowfXRve29wYWNpdHk6MX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWlue2Zyb217b3BhY2l0eTowfXRve29wYWNpdHk6MX19QC13ZWJraXQta2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlue2Zyb217LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDBkZWcpfXRvey13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1Aa2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlue2Zyb217dHJhbnNmb3JtOnJvdGF0ZSgwZGVnKX10b3t0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fSAgLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxld29KSW5abGNuTnBiMjRpT2lBekxBb0pJbVpwYkdVaU9pQWliR2xuYUhSaWIzZ3VjMk56Y3lJc0Nna2ljMjkxY21ObGN5STZJRnNLQ1FraWJHbG5hSFJpYjNndWMyTnpjeUlLQ1Ywc0Nna2ljMjkxY21ObGMwTnZiblJsYm5RaU9pQmJDZ2tKSWlSc2FXZG9kR0p2ZUMxd2NtVm1hWGc2SUNkNGNHRjVjM1JoZEdsdmJpMTNhV1JuWlhRdGJHbG5hSFJpYjNnbk8xeHlYRzRrYkdsbmFIUmliM2d0WTJ4aGMzTTZJQ2N1SnlBcklDUnNhV2RvZEdKdmVDMXdjbVZtYVhnN1hISmNibHh5WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwZ2UxeHlYRzRnSUhCdmMybDBhVzl1T2lCbWFYaGxaRHRjY2x4dUlDQjBiM0E2SURBN1hISmNiaUFnYkdWbWREb2dNRHRjY2x4dUlDQmliM1IwYjIwNklEQTdYSEpjYmlBZ2NtbG5hSFE2SURBN1hISmNiaUFnZDJsa2RHZzZJREV3TUNVN1hISmNiaUFnYUdWcFoyaDBPaUF4TURBbE8xeHlYRzRnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxXWmhaR1ZwYmlBdU1UVnpPMXh5WEc0Z0lHRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFtWVdSbGFXNGdMakUxY3p0Y2NseHVmVnh5WEc1Y2NseHVJM3NrYkdsbmFIUmliM2d0WTJ4aGMzTjlMVzkyWlhKc1lYa2dlMXh5WEc0Z0lIQnZjMmwwYVc5dU9pQmhZbk52YkhWMFpUdGNjbHh1SUNCMGIzQTZNRHRjY2x4dUlDQnNaV1owT2lBd08xeHlYRzRnSUdKdmRIUnZiVG9nTUR0Y2NseHVJQ0J5YVdkb2REb2dNRHRjY2x4dUlDQjZMV2x1WkdWNE9pQXhPMXh5WEc1OVhISmNibHh5WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwdFkyOXVkR1Z1ZENCN1hISmNiaUFnY0c5emFYUnBiMjQ2SUhKbGJHRjBhWFpsTzF4eVhHNGdJSFJ2Y0RvZ01EdGNjbHh1SUNCc1pXWjBPaUF3TzF4eVhHNGdJSG90YVc1a1pYZzZJRE03WEhKY2JuMWNjbHh1WEhKY2JpTjdKR3hwWjJoMFltOTRMV05zWVhOemZTMWpiMjUwWlc1MFgxOW9hV1JrWlc0Z2UxeHlYRzRnSUhacGMybGlhV3hwZEhrNklHaHBaR1JsYmp0Y2NseHVJQ0I2TFdsdVpHVjRPaUF0TVR0Y2NseHVmVnh5WEc1Y2NseHVJM3NrYkdsbmFIUmliM2d0WTJ4aGMzTjlMV052Ym5SbGJuUXRhV1p5WVcxbElIdGNjbHh1SUNCM2FXUjBhRG9nTVRBd0pUdGNjbHh1SUNCb1pXbG5hSFE2SURFd01DVTdYSEpjYmlBZ1ltOXlaR1Z5T2lBd08xeHlYRzRnSUdKaFkydG5jbTkxYm1RNklIUnlZVzV6Y0dGeVpXNTBPMXh5WEc1OVhISmNibHh5WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwdGMzQnBibTVsY2lCN1hISmNiaUFnY0c5emFYUnBiMjQ2SUdGaWMyOXNkWFJsTzF4eVhHNGdJSFJ2Y0RvZ05UQWxPMXh5WEc0Z0lHeGxablE2SURVd0pUdGNjbHh1SUNCa2FYTndiR0Y1T2lCdWIyNWxPMXh5WEc0Z0lIb3RhVzVrWlhnNklESTdYSEpjYmlBZ2NHOXBiblJsY2kxbGRtVnVkSE02SUc1dmJtVTdYSEpjYmx4eVhHNGdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTQjdYSEpjYmlBZ0lDQjNhV1IwYURvZ05UWndlRHRjY2x4dUlDQWdJR2hsYVdkb2REb2dOVFZ3ZUR0Y2NseHVJQ0FnSUcxaGNtZHBiam9nZTF4eVhHNGdJQ0FnSUNCMGIzQTZJQzB5T0hCNE8xeHlYRzRnSUNBZ0lDQnNaV1owT2lBdE1qWndlRHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNBdWMzQnBibTVsY2kxNGMyOXNiR0V0ZUN3Z0xuTndhVzV1WlhJdGVITnZiR3hoTFhNc0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVMxdkxDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGJDd2dMbk53YVc1dVpYSXRlSE52Ykd4aExXRWdlMXh5WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQXhjeUJwYm1acGJtbDBaU0JsWVhObExXbHVMVzkxZER0Y2NseHVJQ0FnSUNBZ0xYZGxZbXRwZEMxaGJtbHRZWFJwYjI0dFptbHNiQzF0YjJSbE9pQmliM1JvTzF4eVhHNGdJQ0FnSUNCaGJtbHRZWFJwYjI0NklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRZbTkxYm1ObFpHVnNZWGtnTVhNZ2FXNW1hVzVwZEdVZ1pXRnpaUzFwYmkxdmRYUTdYSEpjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiaTFtYVd4c0xXMXZaR1U2SUdKdmRHZzdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMWGdnZTF4eVhHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTUhNN1hISmNiaUFnSUNBZ0lHRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ01ITTdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMWE1nZTF4eVhHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTGpKek8xeHlYRzRnSUNBZ0lDQmhibWx0WVhScGIyNHRaR1ZzWVhrNklDNHljenRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNBdWMzQnBibTVsY2kxNGMyOXNiR0V0YnlCN1hISmNiaUFnSUNBZ0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dUxXUmxiR0Y1T2lBdU5ITTdYSEpjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMalJ6TzF4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVMxc0lIdGNjbHh1SUNBZ0lDQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNHRaR1ZzWVhrNklDNDJjenRjY2x4dUlDQWdJQ0FnWVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF1Tm5NN1hISmNiaUFnSUNCOVhISmNibHh5WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExXRWdlMXh5WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMamh6TzF4eVhHNGdJQ0FnSUNCaGJtbHRZWFJwYjI0dFpHVnNZWGs2SUM0NGN6dGNjbHh1SUNBZ0lIMWNjbHh1SUNCOVhISmNibHh5WEc0Z0lDNXpjR2x1Ym1WeUxYSnZkVzVrSUh0Y2NseHVJQ0FnSUcxaGNtZHBiam9nZTF4eVhHNGdJQ0FnSUNCMGIzQTZJQzB5TTNCNE8xeHlYRzRnSUNBZ0lDQnNaV1owT2lBdE1qTndlRHRjY2x4dUlDQWdJSDFjY2x4dUlDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVPaUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFhOd2FXNGdNM01nYVc1bWFXNXBkR1VnYkdsdVpXRnlPMXh5WEc0Z0lDQWdZVzVwYldGMGFXOXVPaUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFhOd2FXNGdNM01nYVc1bWFXNXBkR1VnYkdsdVpXRnlPMXh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdMbk53YVc1dVpYSXRZM1Z6ZEc5dElIdGNjbHh1SUNBZ0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dU9pQWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z2FXNW1hVzVwZEdVZ2JHbHVaV0Z5TzF4eVhHNGdJQ0FnWVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnYVc1bWFXNXBkR1VnYkdsdVpXRnlPMXh5WEc0Z0lIMWNjbHh1ZlZ4eVhHNWNjbHh1UUMxM1pXSnJhWFF0YTJWNVpuSmhiV1Z6SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdFltOTFibU5sWkdWc1lYa2dlMXh5WEc0Z0lEQWxMQ0E0TUNVc0lERXdNQ1VnZXlCdmNHRmphWFI1T2lBd095QjlYSEpjYmlBZ05EQWxJSHNnYjNCaFkybDBlVG9nTVNCOVhISmNibjFjY2x4dVhISmNia0JyWlhsbWNtRnRaWE1nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQjdYSEpjYmlBZ01DVXNJRGd3SlN3Z01UQXdKU0I3SUc5d1lXTnBkSGs2SURBN0lIMWNjbHh1SUNBME1DVWdleUJ2Y0dGamFYUjVPaUF4T3lCOVhISmNibjFjY2x4dVhISmNia0F0ZDJWaWEybDBMV3RsZVdaeVlXMWxjeUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFdaaFpHVnBiaUI3WEhKY2JpQWdabkp2YlNCN0lHOXdZV05wZEhrNklEQTdJSDFjY2x4dUlDQjBieUI3SUc5d1lXTnBkSGs2SURFN0lIMWNjbHh1ZlZ4eVhHNWNjbHh1UUd0bGVXWnlZVzFsY3lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxXWmhaR1ZwYmlCN1hISmNiaUFnWm5KdmJTQjdJRzl3WVdOcGRIazZJREE3SUgxY2NseHVJQ0IwYnlCN0lHOXdZV05wZEhrNklERTdJSDFjY2x4dWZWeHlYRzVjY2x4dVFDMTNaV0pyYVhRdGEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRjM0JwYmlCN1hISmNiaUFnWm5KdmJTQjdJQzEzWldKcmFYUXRkSEpoYm5ObWIzSnRPaUJ5YjNSaGRHVW9NR1JsWnlrN0lIMWNjbHh1SUNCMGJ5QjdJQzEzWldKcmFYUXRkSEpoYm5ObWIzSnRPaUJ5YjNSaGRHVW9Nell3WkdWbktUc2dmVnh5WEc1OVhISmNibHh5WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRjM0JwYmlCN1hISmNiaUFnWm5KdmJTQjdJSFJ5WVc1elptOXliVG9nY205MFlYUmxLREJrWldjcE95QjlYSEpjYmlBZ2RHOGdleUIwY21GdWMyWnZjbTA2SUhKdmRHRjBaU2d6TmpCa1pXY3BPeUI5WEhKY2JuMWNjbHh1SWdvSlhTd0tDU0p0WVhCd2FXNW5jeUk2SUNKQlFVZEJMRUZCUVVFc05FSkJRVFJDTEVGQlFUVkNMRU5CUTBVc1VVRkJVU3hEUVVGRkxFdEJRVTBzUTBGRGFFSXNSMEZCUnl4RFFVRkZMRU5CUVVVc1EwRkRVQ3hKUVVGSkxFTkJRVVVzUTBGQlJTeERRVU5TTEUxQlFVMHNRMEZCUlN4RFFVRkZMRU5CUTFZc1MwRkJTeXhEUVVGRkxFTkJRVVVzUTBGRFZDeExRVUZMTEVOQlFVVXNTVUZCU3l4RFFVTmFMRTFCUVUwc1EwRkJSU3hKUVVGTExFTkJRMklzYVVKQlFXbENMRU5CUVVVc2EwTkJRVEJDTEVOQlFWRXNTMEZCU1N4RFFVTjZSQ3hUUVVGVExFTkJRVVVzYTBOQlFUQkNMRU5CUVZFc1MwRkJTU3hEUVVOc1JDeEJRVVZFTEVGQlFVRXNiME5CUVc5RExFRkJRWEJETEVOQlEwVXNVVUZCVVN4RFFVRkZMRkZCUVZNc1EwRkRia0lzUjBGQlJ5eERRVUZETEVOQlFVVXNRMEZEVGl4SlFVRkpMRU5CUVVVc1EwRkJSU3hEUVVOU0xFMUJRVTBzUTBGQlJTeERRVUZGTEVOQlExWXNTMEZCU3l4RFFVRkZMRU5CUVVVc1EwRkRWQ3hQUVVGUExFTkJRVVVzUTBGQlJTeERRVU5hTEVGQlJVUXNRVUZCUVN4dlEwRkJiME1zUVVGQmNFTXNRMEZEUlN4UlFVRlJMRU5CUVVVc1VVRkJVeXhEUVVOdVFpeEhRVUZITEVOQlFVVXNRMEZCUlN4RFFVTlFMRWxCUVVrc1EwRkJSU3hEUVVGRkxFTkJRMUlzVDBGQlR5eERRVUZGTEVOQlFVVXNRMEZEV2l4QlFVVkVMRUZCUVVFc05FTkJRVFJETEVGQlFUVkRMRU5CUTBVc1ZVRkJWU3hEUVVGRkxFMUJRVThzUTBGRGJrSXNUMEZCVHl4RFFVRkZMRVZCUVVjc1EwRkRZaXhCUVVWRUxFRkJRVUVzTWtOQlFUSkRMRUZCUVRORExFTkJRMFVzUzBGQlN5eERRVUZGTEVsQlFVc3NRMEZEV2l4TlFVRk5MRU5CUVVVc1NVRkJTeXhEUVVOaUxFMUJRVTBzUTBGQlJTeERRVUZGTEVOQlExWXNWVUZCVlN4RFFVRkZMRmRCUVZrc1EwRkRla0lzUVVGRlJDeEJRVUZCTEc5RFFVRnZReXhCUVVGd1F5eERRVU5GTEZGQlFWRXNRMEZCUlN4UlFVRlRMRU5CUTI1Q0xFZEJRVWNzUTBGQlJTeEhRVUZKTEVOQlExUXNTVUZCU1N4RFFVRkZMRWRCUVVrc1EwRkRWaXhQUVVGUExFTkJRVVVzU1VGQlN5eERRVU5rTEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUTFnc1kwRkJZeXhEUVVGRkxFbEJRVXNzUTBGM1JIUkNMRUZCT1VSRUxFRkJVVVVzYjBOQlVtdERMRU5CVVd4RExHVkJRV1VzUVVGQlF5eERRVU5rTEV0QlFVc3NRMEZCUlN4SlFVRkxMRU5CUTFvc1RVRkJUU3hEUVVGRkxFbEJRVXNzUTBGRFlpeE5RVUZOTEVGQlFVTXNRMEZCUXl4QlFVTk9MRWRCUVVjc1EwRkJSU3hMUVVGTkxFTkJSR0lzVFVGQlRTeEJRVUZETEVOQlFVTXNRVUZGVGl4SlFVRkpMRU5CUVVVc1MwRkJUU3hEUVd0RFppeEJRUzlEU0N4QlFXZENTU3h2UTBGb1FtZERMRU5CVVd4RExHVkJRV1VzUTBGUllpeHBRa0ZCYVVJc1EwRm9RbkpDTEVGQlowSjFRaXh2UTBGb1FtRXNRMEZSYkVNc1pVRkJaU3hEUVZGTkxHbENRVUZwUWl4RFFXaENlRU1zUVVGblFqQkRMRzlEUVdoQ1RpeERRVkZzUXl4bFFVRmxMRU5CVVhsQ0xHbENRVUZwUWl4RFFXaENNMFFzUVVGblFqWkVMRzlEUVdoQ2VrSXNRMEZSYkVNc1pVRkJaU3hEUVZFMFF5eHBRa0ZCYVVJc1EwRm9RamxGTEVGQlowSm5SaXh2UTBGb1FqVkRMRU5CVVd4RExHVkJRV1VzUTBGUkswUXNhVUpCUVdsQ0xFRkJRVU1zUTBGRE5VWXNhVUpCUVdsQ0xFTkJRVVVzZFVOQlFTdENMRU5CUVdFc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eFhRVUZYTEVOQlEzUkdMREpDUVVFeVFpeERRVUZGTEVsQlFVc3NRMEZEYkVNc1UwRkJVeXhEUVVGRkxIVkRRVUVyUWl4RFFVRmhMRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVU01UlN4dFFrRkJiVUlzUTBGQlJTeEpRVUZMTEVOQlF6TkNMRUZCY2tKTUxFRkJkVUpKTEc5RFFYWkNaME1zUTBGUmJFTXNaVUZCWlN4RFFXVmlMR2xDUVVGcFFpeEJRVUZETEVOQlEyaENMSFZDUVVGMVFpeERRVUZGTEVWQlFVY3NRMEZETlVJc1pVRkJaU3hEUVVGRkxFVkJRVWNzUTBGRGNrSXNRVUV4UWt3c1FVRTBRa2tzYjBOQk5VSm5ReXhEUVZGc1F5eGxRVUZsTEVOQmIwSmlMR2xDUVVGcFFpeEJRVUZETEVOQlEyaENMSFZDUVVGMVFpeERRVUZGTEVkQlFVa3NRMEZETjBJc1pVRkJaU3hEUVVGRkxFZEJRVWtzUTBGRGRFSXNRVUV2UWt3c1FVRnBRMGtzYjBOQmFrTm5ReXhEUVZGc1F5eGxRVUZsTEVOQmVVSmlMR2xDUVVGcFFpeEJRVUZETEVOQlEyaENMSFZDUVVGMVFpeERRVUZGTEVkQlFVa3NRMEZETjBJc1pVRkJaU3hEUVVGRkxFZEJRVWtzUTBGRGRFSXNRVUZ3UTB3c1FVRnpRMGtzYjBOQmRFTm5ReXhEUVZGc1F5eGxRVUZsTEVOQk9FSmlMR2xDUVVGcFFpeEJRVUZETEVOQlEyaENMSFZDUVVGMVFpeERRVUZGTEVkQlFVa3NRMEZETjBJc1pVRkJaU3hEUVVGRkxFZEJRVWtzUTBGRGRFSXNRVUY2UTB3c1FVRXlRMGtzYjBOQk0wTm5ReXhEUVZGc1F5eGxRVUZsTEVOQmJVTmlMR2xDUVVGcFFpeEJRVUZETEVOQlEyaENMSFZDUVVGMVFpeERRVUZGTEVkQlFVa3NRMEZETjBJc1pVRkJaU3hEUVVGRkxFZEJRVWtzUTBGRGRFSXNRVUU1UTB3c1FVRnBSRVVzYjBOQmFrUnJReXhEUVdsRWJFTXNZMEZCWXl4QlFVRkRMRU5CUTJJc1RVRkJUU3hCUVVGRExFTkJRVU1zUVVGRFRpeEhRVUZITEVOQlFVVXNTMEZCVFN4RFFVUmlMRTFCUVUwc1FVRkJReXhEUVVGRExFRkJSVTRzU1VGQlNTeERRVUZGTEV0QlFVMHNRMEZGWkN4cFFrRkJhVUlzUTBGQlJTeG5RMEZCZDBJc1EwRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZEYmtVc1UwRkJVeXhEUVVGRkxHZERRVUYzUWl4RFFVRk5MRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVU0xUkN4QlFYaEVTQ3hCUVRCRVJTeHZRMEV4Ukd0RExFTkJNRVJzUXl4bFFVRmxMRUZCUVVNc1EwRkRaQ3hwUWtGQmFVSXNRMEZCUlN4blEwRkJkMElzUTBGQlRTeFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVTm9SU3hUUVVGVExFTkJRVVVzWjBOQlFYZENMRU5CUVUwc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGRGVrUXNRVUZIU0N4clFrRkJhMElzUTBGQmJFSXNkVU5CUVd0Q0xFTkJRMmhDTEVGQlFVRXNSVUZCUlN4RFFVRkZMRUZCUVVFc1IwRkJSeXhEUVVGRkxFRkJRVUVzU1VGQlNTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUXpOQ0xFRkJRVUVzUjBGQlJ5eERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkhMRVZCUjNCQ0xGVkJRVlVzUTBGQlZpeDFRMEZCVlN4RFFVTlNMRUZCUVVFc1JVRkJSU3hEUVVGRkxFRkJRVUVzUjBGQlJ5eERRVUZGTEVGQlFVRXNTVUZCU1N4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRek5DTEVGQlFVRXNSMEZCUnl4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFVkJSMjVDTEd0Q1FVRnJRaXhEUVVGc1FpeHJRMEZCYTBJc1EwRkRhRUlzUVVGQlFTeEpRVUZKTEVOQlFVY3NUMEZCVHl4RFFVRkZMRU5CUVVVc1EwRkRiRUlzUVVGQlFTeEZRVUZGTEVOQlFVY3NUMEZCVHl4RFFVRkZMRU5CUVVVc1JVRkhiRUlzVlVGQlZTeERRVUZXTEd0RFFVRlZMRU5CUTFJc1FVRkJRU3hKUVVGSkxFTkJRVWNzVDBGQlR5eERRVUZGTEVOQlFVVXNRMEZEYkVJc1FVRkJRU3hGUVVGRkxFTkJRVWNzVDBGQlR5eERRVUZGTEVOQlFVVXNSVUZIYkVJc2EwSkJRV3RDTEVOQlFXeENMR2REUVVGclFpeERRVU5vUWl4QlFVRkJMRWxCUVVrc1EwRkJSeXhwUWtGQmFVSXNRMEZCUlN4WlFVRk5MRU5CUTJoRExFRkJRVUVzUlVGQlJTeERRVUZITEdsQ1FVRnBRaXhEUVVGRkxHTkJRVTBzUlVGSGFFTXNWVUZCVlN4RFFVRldMR2REUVVGVkxFTkJRMUlzUVVGQlFTeEpRVUZKTEVOQlFVY3NVMEZCVXl4RFFVRkZMRmxCUVUwc1EwRkRlRUlzUVVGQlFTeEZRVUZGTEVOQlFVY3NVMEZCVXl4RFFVRkZMR05CUVUwaUxBb0pJbTVoYldWeklqb2dXMTBLZlE9PSAqLycpOzsiLCJtb2R1bGUuZXhwb3J0cyA9ICcxLjIuNic7XHJcbiIsIi8qIVxuICogQm93c2VyIC0gYSBicm93c2VyIGRldGVjdG9yXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZGVkL2Jvd3NlclxuICogTUlUIExpY2Vuc2UgfCAoYykgRHVzdGluIERpYXogMjAxNVxuICovXG5cbiFmdW5jdGlvbiAocm9vdCwgbmFtZSwgZGVmaW5pdGlvbikge1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShuYW1lLCBkZWZpbml0aW9uKVxuICBlbHNlIHJvb3RbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0odGhpcywgJ2Jvd3NlcicsIGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAgKiBTZWUgdXNlcmFnZW50cy5qcyBmb3IgZXhhbXBsZXMgb2YgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICovXG5cbiAgdmFyIHQgPSB0cnVlXG5cbiAgZnVuY3Rpb24gZGV0ZWN0KHVhKSB7XG5cbiAgICBmdW5jdGlvbiBnZXRGaXJzdE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMV0pIHx8ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNlY29uZE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMl0pIHx8ICcnO1xuICAgIH1cblxuICAgIHZhciBpb3NkZXZpY2UgPSBnZXRGaXJzdE1hdGNoKC8oaXBvZHxpcGhvbmV8aXBhZCkvaSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBsaWtlQW5kcm9pZCA9IC9saWtlIGFuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBhbmRyb2lkID0gIWxpa2VBbmRyb2lkICYmIC9hbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgbmV4dXNNb2JpbGUgPSAvbmV4dXNcXHMqWzAtNl1cXHMqL2kudGVzdCh1YSlcbiAgICAgICwgbmV4dXNUYWJsZXQgPSAhbmV4dXNNb2JpbGUgJiYgL25leHVzXFxzKlswLTldKy9pLnRlc3QodWEpXG4gICAgICAsIGNocm9tZW9zID0gL0NyT1MvLnRlc3QodWEpXG4gICAgICAsIHNpbGsgPSAvc2lsay9pLnRlc3QodWEpXG4gICAgICAsIHNhaWxmaXNoID0gL3NhaWxmaXNoL2kudGVzdCh1YSlcbiAgICAgICwgdGl6ZW4gPSAvdGl6ZW4vaS50ZXN0KHVhKVxuICAgICAgLCB3ZWJvcyA9IC8od2VifGhwdykob3wwKXMvaS50ZXN0KHVhKVxuICAgICAgLCB3aW5kb3dzcGhvbmUgPSAvd2luZG93cyBwaG9uZS9pLnRlc3QodWEpXG4gICAgICAsIHNhbXN1bmdCcm93c2VyID0gL1NhbXN1bmdCcm93c2VyL2kudGVzdCh1YSlcbiAgICAgICwgd2luZG93cyA9ICF3aW5kb3dzcGhvbmUgJiYgL3dpbmRvd3MvaS50ZXN0KHVhKVxuICAgICAgLCBtYWMgPSAhaW9zZGV2aWNlICYmICFzaWxrICYmIC9tYWNpbnRvc2gvaS50ZXN0KHVhKVxuICAgICAgLCBsaW51eCA9ICFhbmRyb2lkICYmICFzYWlsZmlzaCAmJiAhdGl6ZW4gJiYgIXdlYm9zICYmIC9saW51eC9pLnRlc3QodWEpXG4gICAgICAsIGVkZ2VWZXJzaW9uID0gZ2V0U2Vjb25kTWF0Y2goL2VkZyhbZWFdfGlvcylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICAsIHZlcnNpb25JZGVudGlmaWVyID0gZ2V0Rmlyc3RNYXRjaCgvdmVyc2lvblxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgICwgdGFibGV0ID0gL3RhYmxldC9pLnRlc3QodWEpICYmICEvdGFibGV0IHBjL2kudGVzdCh1YSlcbiAgICAgICwgbW9iaWxlID0gIXRhYmxldCAmJiAvW14tXW1vYmkvaS50ZXN0KHVhKVxuICAgICAgLCB4Ym94ID0gL3hib3gvaS50ZXN0KHVhKVxuICAgICAgLCByZXN1bHRcblxuICAgIGlmICgvb3BlcmEvaS50ZXN0KHVhKSkge1xuICAgICAgLy8gIGFuIG9sZCBPcGVyYVxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEnXG4gICAgICAsIG9wZXJhOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/Om9wZXJhfG9wcnxvcGlvcylbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9vcHJcXC98b3Bpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgLy8gYSBuZXcgT3BlcmFcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhJ1xuICAgICAgICAsIG9wZXJhOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86b3ByfG9waW9zKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvU2Ftc3VuZ0Jyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2Ftc3VuZyBJbnRlcm5ldCBmb3IgQW5kcm9pZCdcbiAgICAgICAgLCBzYW1zdW5nQnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OlNhbXN1bmdCcm93c2VyKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvV2hhbGUvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTkFWRVIgV2hhbGUgYnJvd3NlcidcbiAgICAgICAgLCB3aGFsZTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OndoYWxlKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9NWkJyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTVogQnJvd3NlcidcbiAgICAgICAgLCBtemJyb3dzZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpNWkJyb3dzZXIpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2NvYXN0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhIENvYXN0J1xuICAgICAgICAsIGNvYXN0OiB0XG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86Y29hc3QpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9mb2N1cy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdGb2N1cydcbiAgICAgICAgLCBmb2N1czogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmZvY3VzKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC95YWJyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnWWFuZGV4IEJyb3dzZXInXG4gICAgICAsIHlhbmRleGJyb3dzZXI6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86eWFicm93c2VyKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvdWNicm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICBuYW1lOiAnVUMgQnJvd3NlcidcbiAgICAgICAgLCB1Y2Jyb3dzZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp1Y2Jyb3dzZXIpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL214aW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ01heHRob24nXG4gICAgICAgICwgbWF4dGhvbjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om14aW9zKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9lcGlwaGFueS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdFcGlwaGFueSdcbiAgICAgICAgLCBlcGlwaGFueTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmVwaXBoYW55KVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9wdWZmaW4vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUHVmZmluJ1xuICAgICAgICAsIHB1ZmZpbjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnB1ZmZpbilbXFxzXFwvXShcXGQrKD86XFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2xlaXBuaXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2xlaXBuaXInXG4gICAgICAgICwgc2xlaXBuaXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpzbGVpcG5pcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvay1tZWxlb24vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnSy1NZWxlb24nXG4gICAgICAgICwga01lbGVvbjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmstbWVsZW9uKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHdpbmRvd3NwaG9uZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2luZG93cyBQaG9uZSdcbiAgICAgICwgb3NuYW1lOiAnV2luZG93cyBQaG9uZSdcbiAgICAgICwgd2luZG93c3Bob25lOiB0XG4gICAgICB9XG4gICAgICBpZiAoZWRnZVZlcnNpb24pIHtcbiAgICAgICAgcmVzdWx0Lm1zZWRnZSA9IHRcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdC5tc2llID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2llbW9iaWxlXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXNpZXx0cmlkZW50L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ludGVybmV0IEV4cGxvcmVyJ1xuICAgICAgLCBtc2llOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om1zaWUgfHJ2OikoXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaHJvbWVvcykge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21lJ1xuICAgICAgLCBvc25hbWU6ICdDaHJvbWUgT1MnXG4gICAgICAsIGNocm9tZW9zOiB0XG4gICAgICAsIGNocm9tZUJvb2s6IHRcbiAgICAgICwgY2hyb21lOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9tZXxjcmlvc3xjcm1vKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9lZGcoW2VhXXxpb3MpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ01pY3Jvc29mdCBFZGdlJ1xuICAgICAgLCBtc2VkZ2U6IHRcbiAgICAgICwgdmVyc2lvbjogZWRnZVZlcnNpb25cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3ZpdmFsZGkvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnVml2YWxkaSdcbiAgICAgICAgLCB2aXZhbGRpOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvdml2YWxkaVxcLyhcXGQrKFxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2FpbGZpc2gpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhaWxmaXNoJ1xuICAgICAgLCBvc25hbWU6ICdTYWlsZmlzaCBPUydcbiAgICAgICwgc2FpbGZpc2g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2FpbGZpc2hcXHM/YnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NlYW1vbmtleVxcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTZWFNb25rZXknXG4gICAgICAsIHNlYW1vbmtleTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zZWFtb25rZXlcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9maXJlZm94fGljZXdlYXNlbHxmeGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdGaXJlZm94J1xuICAgICAgLCBmaXJlZm94OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmZpcmVmb3h8aWNld2Vhc2VsfGZ4aW9zKVsgXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICAgIGlmICgvXFwoKG1vYmlsZXx0YWJsZXQpO1teXFwpXSpydjpbXFxkXFwuXStcXCkvaS50ZXN0KHVhKSkge1xuICAgICAgICByZXN1bHQuZmlyZWZveG9zID0gdFxuICAgICAgICByZXN1bHQub3NuYW1lID0gJ0ZpcmVmb3ggT1MnXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNpbGspIHtcbiAgICAgIHJlc3VsdCA9ICB7XG4gICAgICAgIG5hbWU6ICdBbWF6b24gU2lsaydcbiAgICAgICwgc2lsazogdFxuICAgICAgLCB2ZXJzaW9uIDogZ2V0Rmlyc3RNYXRjaCgvc2lsa1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3BoYW50b20vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUGhhbnRvbUpTJ1xuICAgICAgLCBwaGFudG9tOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3BoYW50b21qc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NsaW1lcmpzL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NsaW1lckpTJ1xuICAgICAgICAsIHNsaW1lcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NsaW1lcmpzXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvYmxhY2tiZXJyeXxcXGJiYlxcZCsvaS50ZXN0KHVhKSB8fCAvcmltXFxzdGFibGV0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JsYWNrQmVycnknXG4gICAgICAsIG9zbmFtZTogJ0JsYWNrQmVycnkgT1MnXG4gICAgICAsIGJsYWNrYmVycnk6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvYmxhY2tiZXJyeVtcXGRdK1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAod2Vib3MpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1dlYk9TJ1xuICAgICAgLCBvc25hbWU6ICdXZWJPUydcbiAgICAgICwgd2Vib3M6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvdyg/OmViKT9vc2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgICAgL3RvdWNocGFkXFwvL2kudGVzdCh1YSkgJiYgKHJlc3VsdC50b3VjaHBhZCA9IHQpXG4gICAgfVxuICAgIGVsc2UgaWYgKC9iYWRhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JhZGEnXG4gICAgICAsIG9zbmFtZTogJ0JhZGEnXG4gICAgICAsIGJhZGE6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZG9sZmluXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGl6ZW4pIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1RpemVuJ1xuICAgICAgLCBvc25hbWU6ICdUaXplbidcbiAgICAgICwgdGl6ZW46IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86dGl6ZW5cXHM/KT9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoL3F1cHppbGxhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1F1cFppbGxhJ1xuICAgICAgICAsIHF1cHppbGxhOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86cXVwemlsbGEpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2Nocm9taXVtL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0Nocm9taXVtJ1xuICAgICAgICAsIGNocm9taXVtOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21pdW0pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2Nocm9tZXxjcmlvc3xjcm1vL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0Nocm9tZSdcbiAgICAgICAgLCBjaHJvbWU6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGFuZHJvaWQpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0FuZHJvaWQnXG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NhZmFyaXxhcHBsZXdlYmtpdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYWZhcmknXG4gICAgICAsIHNhZmFyaTogdFxuICAgICAgfVxuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaW9zZGV2aWNlKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWUgOiBpb3NkZXZpY2UgPT0gJ2lwaG9uZScgPyAnaVBob25lJyA6IGlvc2RldmljZSA9PSAnaXBhZCcgPyAnaVBhZCcgOiAnaVBvZCdcbiAgICAgIH1cbiAgICAgIC8vIFdURjogdmVyc2lvbiBpcyBub3QgcGFydCBvZiB1c2VyIGFnZW50IGluIHdlYiBhcHBzXG4gICAgICBpZiAodmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmKC9nb29nbGVib3QvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnR29vZ2xlYm90J1xuICAgICAgLCBnb29nbGVib3Q6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZ29vZ2xlYm90XFwvKFxcZCsoXFwuXFxkKykpL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiBnZXRGaXJzdE1hdGNoKC9eKC4qKVxcLyguKikgLyksXG4gICAgICAgIHZlcnNpb246IGdldFNlY29uZE1hdGNoKC9eKC4qKVxcLyguKikgLylcbiAgICAgfTtcbiAgIH1cblxuICAgIC8vIHNldCB3ZWJraXQgb3IgZ2Vja28gZmxhZyBmb3IgYnJvd3NlcnMgYmFzZWQgb24gdGhlc2UgZW5naW5lc1xuICAgIGlmICghcmVzdWx0Lm1zZWRnZSAmJiAvKGFwcGxlKT93ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgaWYgKC8oYXBwbGUpP3dlYmtpdFxcLzUzN1xcLjM2L2kudGVzdCh1YSkpIHtcbiAgICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIkJsaW5rXCJcbiAgICAgICAgcmVzdWx0LmJsaW5rID0gdFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIldlYmtpdFwiXG4gICAgICAgIHJlc3VsdC53ZWJraXQgPSB0XG4gICAgICB9XG4gICAgICBpZiAoIXJlc3VsdC52ZXJzaW9uICYmIHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQub3BlcmEgJiYgL2dlY2tvXFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdC5uYW1lID0gcmVzdWx0Lm5hbWUgfHwgXCJHZWNrb1wiXG4gICAgICByZXN1bHQuZ2Vja28gPSB0XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHJlc3VsdC52ZXJzaW9uIHx8IGdldEZpcnN0TWF0Y2goL2dlY2tvXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgIH1cblxuICAgIC8vIHNldCBPUyBmbGFncyBmb3IgcGxhdGZvcm1zIHRoYXQgaGF2ZSBtdWx0aXBsZSBicm93c2Vyc1xuICAgIGlmICghcmVzdWx0LndpbmRvd3NwaG9uZSAmJiAoYW5kcm9pZCB8fCByZXN1bHQuc2lsaykpIHtcbiAgICAgIHJlc3VsdC5hbmRyb2lkID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdBbmRyb2lkJ1xuICAgIH0gZWxzZSBpZiAoIXJlc3VsdC53aW5kb3dzcGhvbmUgJiYgaW9zZGV2aWNlKSB7XG4gICAgICByZXN1bHRbaW9zZGV2aWNlXSA9IHRcbiAgICAgIHJlc3VsdC5pb3MgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ2lPUydcbiAgICB9IGVsc2UgaWYgKG1hYykge1xuICAgICAgcmVzdWx0Lm1hYyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnbWFjT1MnXG4gICAgfSBlbHNlIGlmICh4Ym94KSB7XG4gICAgICByZXN1bHQueGJveCA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnWGJveCdcbiAgICB9IGVsc2UgaWYgKHdpbmRvd3MpIHtcbiAgICAgIHJlc3VsdC53aW5kb3dzID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdXaW5kb3dzJ1xuICAgIH0gZWxzZSBpZiAobGludXgpIHtcbiAgICAgIHJlc3VsdC5saW51eCA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnTGludXgnXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0V2luZG93c1ZlcnNpb24gKHMpIHtcbiAgICAgIHN3aXRjaCAocykge1xuICAgICAgICBjYXNlICdOVCc6IHJldHVybiAnTlQnXG4gICAgICAgIGNhc2UgJ1hQJzogcmV0dXJuICdYUCdcbiAgICAgICAgY2FzZSAnTlQgNS4wJzogcmV0dXJuICcyMDAwJ1xuICAgICAgICBjYXNlICdOVCA1LjEnOiByZXR1cm4gJ1hQJ1xuICAgICAgICBjYXNlICdOVCA1LjInOiByZXR1cm4gJzIwMDMnXG4gICAgICAgIGNhc2UgJ05UIDYuMCc6IHJldHVybiAnVmlzdGEnXG4gICAgICAgIGNhc2UgJ05UIDYuMSc6IHJldHVybiAnNydcbiAgICAgICAgY2FzZSAnTlQgNi4yJzogcmV0dXJuICc4J1xuICAgICAgICBjYXNlICdOVCA2LjMnOiByZXR1cm4gJzguMSdcbiAgICAgICAgY2FzZSAnTlQgMTAuMCc6IHJldHVybiAnMTAnXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPUyB2ZXJzaW9uIGV4dHJhY3Rpb25cbiAgICB2YXIgb3NWZXJzaW9uID0gJyc7XG4gICAgaWYgKHJlc3VsdC53aW5kb3dzKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRXaW5kb3dzVmVyc2lvbihnZXRGaXJzdE1hdGNoKC9XaW5kb3dzICgoTlR8WFApKCBcXGRcXGQ/LlxcZCk/KS9pKSlcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC53aW5kb3dzcGhvbmUpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3dpbmRvd3MgcGhvbmUgKD86b3MpP1xccz8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0Lm1hYykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvTWFjIE9TIFggKFxcZCsoW19cXC5cXHNdXFxkKykqKS9pKTtcbiAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9bX1xcc10vZywgJy4nKTtcbiAgICB9IGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvb3MgKFxcZCsoW19cXHNdXFxkKykqKSBsaWtlIG1hYyBvcyB4L2kpO1xuICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL1tfXFxzXS9nLCAnLicpO1xuICAgIH0gZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvYW5kcm9pZFsgXFwvLV0oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LndlYm9zKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC8oPzp3ZWJ8aHB3KW9zXFwvKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5ibGFja2JlcnJ5KSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9yaW1cXHN0YWJsZXRcXHNvc1xccyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuYmFkYSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvYmFkYVxcLyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQudGl6ZW4pIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3RpemVuW1xcL1xcc10oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH1cbiAgICBpZiAob3NWZXJzaW9uKSB7XG4gICAgICByZXN1bHQub3N2ZXJzaW9uID0gb3NWZXJzaW9uO1xuICAgIH1cblxuICAgIC8vIGRldmljZSB0eXBlIGV4dHJhY3Rpb25cbiAgICB2YXIgb3NNYWpvclZlcnNpb24gPSAhcmVzdWx0LndpbmRvd3MgJiYgb3NWZXJzaW9uLnNwbGl0KCcuJylbMF07XG4gICAgaWYgKFxuICAgICAgICAgdGFibGV0XG4gICAgICB8fCBuZXh1c1RhYmxldFxuICAgICAgfHwgaW9zZGV2aWNlID09ICdpcGFkJ1xuICAgICAgfHwgKGFuZHJvaWQgJiYgKG9zTWFqb3JWZXJzaW9uID09IDMgfHwgKG9zTWFqb3JWZXJzaW9uID49IDQgJiYgIW1vYmlsZSkpKVxuICAgICAgfHwgcmVzdWx0LnNpbGtcbiAgICApIHtcbiAgICAgIHJlc3VsdC50YWJsZXQgPSB0XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgIG1vYmlsZVxuICAgICAgfHwgaW9zZGV2aWNlID09ICdpcGhvbmUnXG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwb2QnXG4gICAgICB8fCBhbmRyb2lkXG4gICAgICB8fCBuZXh1c01vYmlsZVxuICAgICAgfHwgcmVzdWx0LmJsYWNrYmVycnlcbiAgICAgIHx8IHJlc3VsdC53ZWJvc1xuICAgICAgfHwgcmVzdWx0LmJhZGFcbiAgICApIHtcbiAgICAgIHJlc3VsdC5tb2JpbGUgPSB0XG4gICAgfVxuXG4gICAgLy8gR3JhZGVkIEJyb3dzZXIgU3VwcG9ydFxuICAgIC8vIGh0dHA6Ly9kZXZlbG9wZXIueWFob28uY29tL3l1aS9hcnRpY2xlcy9nYnNcbiAgICBpZiAocmVzdWx0Lm1zZWRnZSB8fFxuICAgICAgICAocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTApIHx8XG4gICAgICAgIChyZXN1bHQueWFuZGV4YnJvd3NlciAmJiByZXN1bHQudmVyc2lvbiA+PSAxNSkgfHxcblx0XHQgICAgKHJlc3VsdC52aXZhbGRpICYmIHJlc3VsdC52ZXJzaW9uID49IDEuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMjApIHx8XG4gICAgICAgIChyZXN1bHQuc2Ftc3VuZ0Jyb3dzZXIgJiYgcmVzdWx0LnZlcnNpb24gPj0gNCkgfHxcbiAgICAgICAgKHJlc3VsdC53aGFsZSAmJiBjb21wYXJlVmVyc2lvbnMoW3Jlc3VsdC52ZXJzaW9uLCAnMS4wJ10pID09PSAxKSB8fFxuICAgICAgICAocmVzdWx0Lm16YnJvd3NlciAmJiBjb21wYXJlVmVyc2lvbnMoW3Jlc3VsdC52ZXJzaW9uLCAnNi4wJ10pID09PSAxKSB8fFxuICAgICAgICAocmVzdWx0LmZvY3VzICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICcxLjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA+PSAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5ibGFja2JlcnJ5ICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjEpXG4gICAgICAgIHx8IChyZXN1bHQuY2hyb21pdW0gJiYgcmVzdWx0LnZlcnNpb24gPj0gMjApXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmEgPSB0O1xuICAgIH1cbiAgICBlbHNlIGlmICgocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPCAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPCAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uIDwgMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPCA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uIDwgMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA8IDYpXG4gICAgICAgIHx8IChyZXN1bHQuY2hyb21pdW0gJiYgcmVzdWx0LnZlcnNpb24gPCAyMClcbiAgICAgICAgKSB7XG4gICAgICByZXN1bHQuYyA9IHRcbiAgICB9IGVsc2UgcmVzdWx0LnggPSB0XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICB2YXIgYm93c2VyID0gZGV0ZWN0KHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJyA6ICcnKVxuXG4gIGJvd3Nlci50ZXN0ID0gZnVuY3Rpb24gKGJyb3dzZXJMaXN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBicm93c2VyTGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGJyb3dzZXJJdGVtID0gYnJvd3Nlckxpc3RbaV07XG4gICAgICBpZiAodHlwZW9mIGJyb3dzZXJJdGVtPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChicm93c2VySXRlbSBpbiBib3dzZXIpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHZlcnNpb24gcHJlY2lzaW9ucyBjb3VudFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgIGdldFZlcnNpb25QcmVjaXNpb24oXCIxLjEwLjNcIikgLy8gM1xuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHZlcnNpb25cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIHZlcnNpb24uc3BsaXQoXCIuXCIpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcnJheTo6bWFwIHBvbHlmaWxsXG4gICAqXG4gICAqIEBwYXJhbSAge0FycmF5fSBhcnJcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZnVuY3Rpb24gbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICB2YXIgcmVzdWx0ID0gW10sIGk7XG4gICAgaWYgKEFycmF5LnByb3RvdHlwZS5tYXApIHtcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyLCBpdGVyYXRvcik7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdC5wdXNoKGl0ZXJhdG9yKGFycltpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSBicm93c2VyIHZlcnNpb24gd2VpZ2h0XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4xMC4yLjEnLCAgJzEuOC4yLjEuOTAnXSkgICAgLy8gMVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMDEwLjIuMScsICcxLjA5LjIuMS45MCddKTsgIC8vIDFcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS4xMC4yLjEnXSk7ICAgICAvLyAwXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4xMC4yLjEnLCAgJzEuMDgwMC4yJ10pOyAgICAgLy8gLTFcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXk8U3RyaW5nPn0gdmVyc2lvbnMgdmVyc2lvbnMgdG8gY29tcGFyZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGNvbXBhcmlzb24gcmVzdWx0XG4gICAqL1xuICBmdW5jdGlvbiBjb21wYXJlVmVyc2lvbnModmVyc2lvbnMpIHtcbiAgICAvLyAxKSBnZXQgY29tbW9uIHByZWNpc2lvbiBmb3IgYm90aCB2ZXJzaW9ucywgZm9yIGV4YW1wbGUgZm9yIFwiMTAuMFwiIGFuZCBcIjlcIiBpdCBzaG91bGQgYmUgMlxuICAgIHZhciBwcmVjaXNpb24gPSBNYXRoLm1heChnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb25zWzBdKSwgZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uc1sxXSkpO1xuICAgIHZhciBjaHVua3MgPSBtYXAodmVyc2lvbnMsIGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG4gICAgICB2YXIgZGVsdGEgPSBwcmVjaXNpb24gLSBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb24pO1xuXG4gICAgICAvLyAyKSBcIjlcIiAtPiBcIjkuMFwiIChmb3IgcHJlY2lzaW9uID0gMilcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uICsgbmV3IEFycmF5KGRlbHRhICsgMSkuam9pbihcIi4wXCIpO1xuXG4gICAgICAvLyAzKSBcIjkuMFwiIC0+IFtcIjAwMDAwMDAwMFwiXCIsIFwiMDAwMDAwMDA5XCJdXG4gICAgICByZXR1cm4gbWFwKHZlcnNpb24uc3BsaXQoXCIuXCIpLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheSgyMCAtIGNodW5rLmxlbmd0aCkuam9pbihcIjBcIikgKyBjaHVuaztcbiAgICAgIH0pLnJldmVyc2UoKTtcbiAgICB9KTtcblxuICAgIC8vIGl0ZXJhdGUgaW4gcmV2ZXJzZSBvcmRlciBieSByZXZlcnNlZCBjaHVua3MgYXJyYXlcbiAgICB3aGlsZSAoLS1wcmVjaXNpb24gPj0gMCkge1xuICAgICAgLy8gNCkgY29tcGFyZTogXCIwMDAwMDAwMDlcIiA+IFwiMDAwMDAwMDEwXCIgPSBmYWxzZSAoYnV0IFwiOVwiID4gXCIxMFwiID0gdHJ1ZSlcbiAgICAgIGlmIChjaHVua3NbMF1bcHJlY2lzaW9uXSA+IGNodW5rc1sxXVtwcmVjaXNpb25dKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoY2h1bmtzWzBdW3ByZWNpc2lvbl0gPT09IGNodW5rc1sxXVtwcmVjaXNpb25dKSB7XG4gICAgICAgIGlmIChwcmVjaXNpb24gPT09IDApIHtcbiAgICAgICAgICAvLyBhbGwgdmVyc2lvbiBjaHVua3MgYXJlIHNhbWVcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYnJvd3NlciBpcyB1bnN1cHBvcnRlZFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgIGJvd3Nlci5pc1Vuc3VwcG9ydGVkQnJvd3Nlcih7XG4gICAqICAgICBtc2llOiBcIjEwXCIsXG4gICAqICAgICBmaXJlZm94OiBcIjIzXCIsXG4gICAqICAgICBjaHJvbWU6IFwiMjlcIixcbiAgICogICAgIHNhZmFyaTogXCI1LjFcIixcbiAgICogICAgIG9wZXJhOiBcIjE2XCIsXG4gICAqICAgICBwaGFudG9tOiBcIjUzNFwiXG4gICAqICAgfSk7XG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIG1pblZlcnNpb25zIG1hcCBvZiBtaW5pbWFsIHZlcnNpb24gdG8gYnJvd3NlclxuICAgKiBAcGFyYW0gIHtCb29sZWFufSBbc3RyaWN0TW9kZSA9IGZhbHNlXSBmbGFnIHRvIHJldHVybiBmYWxzZSBpZiBicm93c2VyIHdhc24ndCBmb3VuZCBpbiBtYXBcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgW3VhXSB1c2VyIGFnZW50IHN0cmluZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNVbnN1cHBvcnRlZEJyb3dzZXIobWluVmVyc2lvbnMsIHN0cmljdE1vZGUsIHVhKSB7XG4gICAgdmFyIF9ib3dzZXIgPSBib3dzZXI7XG5cbiAgICAvLyBtYWtlIHN0cmljdE1vZGUgcGFyYW0gb3B0aW9uYWwgd2l0aCB1YSBwYXJhbSB1c2FnZVxuICAgIGlmICh0eXBlb2Ygc3RyaWN0TW9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHVhID0gc3RyaWN0TW9kZTtcbiAgICAgIHN0cmljdE1vZGUgPSB2b2lkKDApO1xuICAgIH1cblxuICAgIGlmIChzdHJpY3RNb2RlID09PSB2b2lkKDApKSB7XG4gICAgICBzdHJpY3RNb2RlID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh1YSkge1xuICAgICAgX2Jvd3NlciA9IGRldGVjdCh1YSk7XG4gICAgfVxuXG4gICAgdmFyIHZlcnNpb24gPSBcIlwiICsgX2Jvd3Nlci52ZXJzaW9uO1xuICAgIGZvciAodmFyIGJyb3dzZXIgaW4gbWluVmVyc2lvbnMpIHtcbiAgICAgIGlmIChtaW5WZXJzaW9ucy5oYXNPd25Qcm9wZXJ0eShicm93c2VyKSkge1xuICAgICAgICBpZiAoX2Jvd3Nlclticm93c2VyXSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbWluVmVyc2lvbnNbYnJvd3Nlcl0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXIgdmVyc2lvbiBpbiB0aGUgbWluVmVyc2lvbiBtYXAgc2hvdWxkIGJlIGEgc3RyaW5nOiAnICsgYnJvd3NlciArICc6ICcgKyBTdHJpbmcobWluVmVyc2lvbnMpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBicm93c2VyIHZlcnNpb24gYW5kIG1pbiBzdXBwb3J0ZWQgdmVyc2lvbi5cbiAgICAgICAgICByZXR1cm4gY29tcGFyZVZlcnNpb25zKFt2ZXJzaW9uLCBtaW5WZXJzaW9uc1ticm93c2VyXV0pIDwgMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpY3RNb2RlOyAvLyBub3QgZm91bmRcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBicm93c2VyIGlzIHN1cHBvcnRlZFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IG1pblZlcnNpb25zIG1hcCBvZiBtaW5pbWFsIHZlcnNpb24gdG8gYnJvd3NlclxuICAgKiBAcGFyYW0gIHtCb29sZWFufSBbc3RyaWN0TW9kZSA9IGZhbHNlXSBmbGFnIHRvIHJldHVybiBmYWxzZSBpZiBicm93c2VyIHdhc24ndCBmb3VuZCBpbiBtYXBcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgW3VhXSB1c2VyIGFnZW50IHN0cmluZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gY2hlY2sobWluVmVyc2lvbnMsIHN0cmljdE1vZGUsIHVhKSB7XG4gICAgcmV0dXJuICFpc1Vuc3VwcG9ydGVkQnJvd3NlcihtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpO1xuICB9XG5cbiAgYm93c2VyLmlzVW5zdXBwb3J0ZWRCcm93c2VyID0gaXNVbnN1cHBvcnRlZEJyb3dzZXI7XG4gIGJvd3Nlci5jb21wYXJlVmVyc2lvbnMgPSBjb21wYXJlVmVyc2lvbnM7XG4gIGJvd3Nlci5jaGVjayA9IGNoZWNrO1xuXG4gIC8qXG4gICAqIFNldCBvdXIgZGV0ZWN0IG1ldGhvZCB0byB0aGUgbWFpbiBib3dzZXIgb2JqZWN0IHNvIHdlIGNhblxuICAgKiByZXVzZSBpdCB0byB0ZXN0IG90aGVyIHVzZXIgYWdlbnRzLlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBpbXBsZW1lbnQgZnV0dXJlIHRlc3RzLlxuICAgKi9cbiAgYm93c2VyLl9kZXRlY3QgPSBkZXRlY3Q7XG5cbiAgLypcbiAgICogU2V0IG91ciBkZXRlY3QgcHVibGljIG1ldGhvZCB0byB0aGUgbWFpbiBib3dzZXIgb2JqZWN0XG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGltcGxlbWVudCBib3dzZXIgaW4gc2VydmVyIHNpZGVcbiAgICovXG4gIGJvd3Nlci5kZXRlY3QgPSBkZXRlY3Q7XG4gIHJldHVybiBib3dzZXJcbn0pO1xuIiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxyXG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAnKTtcclxudmFyIHBvbHlmaWxscyA9IHJlcXVpcmUoJy4vcG9seWZpbGxzJyk7XHJcblxyXG5wb2x5ZmlsbHMuYXBwbHlQb2x5ZmlsbHMoKTtcclxuXHJcbnZhciBpbnN0YW5jZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBnZXRJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEFwcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKEhlbHBlcnMuemlwT2JqZWN0KFsnaW5pdCcsICdvcGVuJywgJ29uJywgJ29mZicsICdzZW5kTWVzc2FnZScsICdvbk1lc3NhZ2UnXS5tYXAoZnVuY3Rpb24gKG1ldGhvZE5hbWUpIHtcclxuICAgICAgICB2YXIgYXBwID0gZ2V0SW5zdGFuY2UoKTtcclxuICAgICAgICByZXR1cm4gW21ldGhvZE5hbWUsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFwcFttZXRob2ROYW1lXS5hcHBseShhcHAsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgfV07XHJcbiAgICB9KSksIHtcclxuICAgICAgICBldmVudFR5cGVzOiBBcHAuZXZlbnRUeXBlcyxcclxuICAgIH0pO1xyXG59KSgpO1xyXG4iXX0=
