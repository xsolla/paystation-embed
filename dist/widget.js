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
        this.childWindow = null;
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
        USER_COUNTRY: 'user-country',
        FCP: 'fcp',
        ERROR: 'error'
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

        function handleFcp(event) {
            that.triggerCustomEvent(App.eventTypes.FCP, event.detail);
        }

        function handleError(event) {
            that.triggerCustomEvent(App.eventTypes.ERROR, event.detail);
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
                childWindow.off(App.eventTypes.FCP, handleFcp);
                childWindow.off(App.eventTypes.ERROR, handleError);
                childWindow.off('close', handleClose);
            });
            childWindow.on('status', handleStatus);
            childWindow.on(App.eventTypes.USER_COUNTRY, handleUserLocale);
            childWindow.on(App.eventTypes.FCP, handleFcp);
            childWindow.on(App.eventTypes.ERROR, handleError);
            childWindow.open(url, this.config.childWindow);
            that.childWindow = childWindow;
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
                lightBox.off(App.eventTypes.FCP, handleFcp);
                lightBox.off(App.eventTypes.ERROR, handleError);
                lightBox.off('close', handleClose);
            });
            lightBox.on('status', handleStatus);
            lightBox.on(App.eventTypes.USER_COUNTRY, handleUserLocale);
            lightBox.on(App.eventTypes.FCP, handleFcp);
            lightBox.on(App.eventTypes.ERROR, handleError);
            lightBox.openFrame(url, this.config.lightbox);
            that.childWindow = lightBox;
        }
    };


    /**
     * Close payment interface (PayStation)
     */
    App.prototype.close = function () {
        this.childWindow.close();
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
            function closeChildWindow() {
                that.off('close', closeChildWindow)

                if (timer) {
                    global.clearTimeout(timer);
                }
                if (that.childWindow) {
                    that.childWindow.close();
                }
            }

            that.on('close', closeChildWindow);

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
            that.message.on('close', function handleClose() {
                closeChildWindow();
                that.message.off('close', handleClose);
            });
            that.message.on('user-country', function (event) {
                that.triggerEvent('user-country', event.detail);
            });
            that.message.on('fcp', function (event) {
                that.triggerEvent('fcp', event.detail);
            });
            that.message.on('error', function (event) {
                that.triggerEvent('error', event.detail);
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
        this.message.on('close', (function () {
            this.closeFrame();
        }).bind(this));
        this.message.on('status', (function (event) {
            this.triggerEvent('status', event.detail);
        }).bind(this));
        this.message.on('user-country', (function (event) {
            this.triggerEvent('user-country', event.detail);
        }).bind(this));
        this.message.on('fcp', (function (event) {
            this.triggerEvent('fcp', event.detail);
        }).bind(this));
        this.message.on('error', (function (event) {
            this.triggerEvent('error', event.detail);
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

    LightBox.prototype.close = function () {
        this.closeFrame();
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
module.exports = '1.2.10';

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

    return Object.assign(Helpers.zipObject(['init', 'open', 'close', 'on', 'off', 'sendMessage', 'onMessage'].map(function (methodName) {
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJib3dlcl9jb21wb25lbnRzL2Jvd3Nlci9zcmMvYm93c2VyLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JFQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7O0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcG9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcywgY3VzdG9tRG9jdW1lbnQpIHtcbiAgdmFyIGRvYyA9IGN1c3RvbURvY3VtZW50IHx8IGRvY3VtZW50O1xuICBpZiAoZG9jLmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICB2YXIgc2hlZXQgPSBkb2MuY3JlYXRlU3R5bGVTaGVldCgpXG4gICAgc2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICByZXR1cm4gc2hlZXQub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIHN0eWxlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICB9XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmJ5VXJsID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmIChkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQodXJsKS5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgbGluay5ocmVmID0gdXJsO1xuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICByZXR1cm4gbGluaztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnY3NzaWZ5Jyk7IiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcclxudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XHJcbnZhciBMaWdodEJveCA9IHJlcXVpcmUoJy4vbGlnaHRib3gnKTtcclxudmFyIENoaWxkV2luZG93ID0gcmVxdWlyZSgnLi9jaGlsZHdpbmRvdycpO1xyXG52YXIgRGV2aWNlID0gcmVxdWlyZSgnLi9kZXZpY2UnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIHJlYWR5KGZuKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJyl7XHJcbiAgICAgICAgICBmbigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBBcHAoKSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRyk7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XHJcbiAgICAgICAgdGhpcy5pc0luaXRpYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucG9zdE1lc3NhZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIEFwcC5ldmVudFR5cGVzID0ge1xyXG4gICAgICAgIElOSVQ6ICdpbml0JyxcclxuICAgICAgICBPUEVOOiAnb3BlbicsXHJcbiAgICAgICAgT1BFTl9XSU5ET1c6ICdvcGVuLXdpbmRvdycsXHJcbiAgICAgICAgT1BFTl9MSUdIVEJPWDogJ29wZW4tbGlnaHRib3gnLFxyXG4gICAgICAgIExPQUQ6ICdsb2FkJyxcclxuICAgICAgICBDTE9TRTogJ2Nsb3NlJyxcclxuICAgICAgICBDTE9TRV9XSU5ET1c6ICdjbG9zZS13aW5kb3cnLFxyXG4gICAgICAgIENMT1NFX0xJR0hUQk9YOiAnY2xvc2UtbGlnaHRib3gnLFxyXG4gICAgICAgIFNUQVRVUzogJ3N0YXR1cycsXHJcbiAgICAgICAgU1RBVFVTX0lOVk9JQ0U6ICdzdGF0dXMtaW52b2ljZScsXHJcbiAgICAgICAgU1RBVFVTX0RFTElWRVJJTkc6ICdzdGF0dXMtZGVsaXZlcmluZycsXHJcbiAgICAgICAgU1RBVFVTX1RST1VCTEVEOiAnc3RhdHVzLXRyb3VibGVkJyxcclxuICAgICAgICBTVEFUVVNfRE9ORTogJ3N0YXR1cy1kb25lJyxcclxuICAgICAgICBVU0VSX0NPVU5UUlk6ICd1c2VyLWNvdW50cnknLFxyXG4gICAgICAgIEZDUDogJ2ZjcCcsXHJcbiAgICAgICAgRVJST1I6ICdlcnJvcidcclxuICAgIH07XHJcblxyXG4gICAgdmFyIERFRkFVTFRfQ09ORklHID0ge1xyXG4gICAgICAgIGFjY2Vzc190b2tlbjogbnVsbCxcclxuICAgICAgICBhY2Nlc3NfZGF0YTogbnVsbCxcclxuICAgICAgICBzYW5kYm94OiBmYWxzZSxcclxuICAgICAgICBsaWdodGJveDoge30sXHJcbiAgICAgICAgY2hpbGRXaW5kb3c6IHt9LFxyXG4gICAgICAgIGhvc3Q6ICdzZWN1cmUueHNvbGxhLmNvbScsXHJcbiAgICAgICAgaWZyYW1lT25seTogZmFsc2VcclxuICAgIH07XHJcbiAgICB2YXIgU0FOREJPWF9QQVlTVEFUSU9OX1VSTCA9ICdodHRwczovL3NhbmRib3gtc2VjdXJlLnhzb2xsYS5jb20vcGF5c3RhdGlvbjIvPyc7XHJcbiAgICB2YXIgRVZFTlRfTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQnO1xyXG4gICAgdmFyIEFUVFJfUFJFRklYID0gJ2RhdGEteHBheXN0YXRpb24td2lkZ2V0LW9wZW4nO1xyXG5cclxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXHJcbiAgICBBcHAucHJvdG90eXBlLmNvbmZpZyA9IHt9O1xyXG4gICAgQXBwLnByb3RvdHlwZS5pc0luaXRpYXRlZCA9IGZhbHNlO1xyXG4gICAgQXBwLnByb3RvdHlwZS5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XHJcblxyXG4gICAgQXBwLnByb3RvdHlwZS5nZXRQYXltZW50VXJsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5wYXltZW50X3VybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWcucGF5bWVudF91cmw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBxdWVyeSA9IHt9O1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hY2Nlc3NfdG9rZW4pIHtcclxuICAgICAgICAgICAgcXVlcnkuYWNjZXNzX3Rva2VuID0gdGhpcy5jb25maWcuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LmFjY2Vzc19kYXRhID0gSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsV2l0aG91dFF1ZXJ5UGFyYW1zID0gdGhpcy5jb25maWcuc2FuZGJveCA/XHJcbiAgICAgICAgICAgIFNBTkRCT1hfUEFZU1RBVElPTl9VUkwgOlxyXG4gICAgICAgICAgICAnaHR0cHM6Ly8nICsgdGhpcy5jb25maWcuaG9zdCArICcvcGF5c3RhdGlvbjIvPyc7XHJcbiAgICAgICAgcmV0dXJuIHVybFdpdGhvdXRRdWVyeVBhcmFtcyArIEhlbHBlcnMucGFyYW0ocXVlcnkpO1xyXG4gICAgfTtcclxuXHJcbiAgICBBcHAucHJvdG90eXBlLmNoZWNrQ29uZmlnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX3Rva2VuKSAmJiBIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpICYmIEhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5wYXltZW50X3VybCkpIHtcclxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdObyBhY2Nlc3MgdG9rZW4gb3IgYWNjZXNzIGRhdGEgb3IgcGF5bWVudCBVUkwgZ2l2ZW4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKSAmJiB0eXBlb2YgdGhpcy5jb25maWcuYWNjZXNzX2RhdGEgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW52YWxpZCBhY2Nlc3MgZGF0YSBmb3JtYXQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuaG9zdCkpIHtcclxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdJbnZhbGlkIGhvc3QnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIEFwcC5wcm90b3R5cGUuY2hlY2tBcHAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNJbml0aWF0ZWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0luaXRpYWxpemUgd2lkZ2V0IGJlZm9yZSBvcGVuaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBBcHAucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24obWVzc2FnZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIEFwcC5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSkge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChhcmd1bWVudHMsIChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudE5hbWUsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQXBwLnByb3RvdHlwZS50cmlnZ2VyQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge2RldGFpbDogZGF0YX0pOyAvLyBOb3Qgd29ya2luZyBpbiBJRVxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgICAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemUgd2lkZ2V0IHdpdGggb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxpemUob3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcclxuICAgICAgICAgICAgdmFyIGNsaWNrRXZlbnROYW1lID0gJ2NsaWNrJyArIEVWRU5UX05BTUVTUEFDRTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVDbGlja0V2ZW50ID0gKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1snICsgQVRUUl9QUkVGSVggKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZUV2ZW50LnRhcmdldCA9PT0gdGFyZ2V0RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Blbi5jYWxsKHRoaXMsIHRhcmdldEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgICAgICAgICBjbGlja0V2ZW50LmluaXRFdmVudChjbGlja0V2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcclxuICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XHJcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudE5hbWUsIGhhbmRsZUNsaWNrRXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5JTklUKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVhZHkoaW5pdGlhbGl6ZS5iaW5kKHRoaXMsIG9wdGlvbnMpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gcGF5bWVudCBpbnRlcmZhY2UgKFBheVN0YXRpb24pXHJcbiAgICAgKi9cclxuICAgIEFwcC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNoZWNrQ29uZmlnKCk7XHJcbiAgICAgICAgdGhpcy5jaGVja0FwcCgpO1xyXG5cclxuICAgICAgICB2YXIgdHJpZ2dlclNwbGl0U3RhdHVzID0gKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoKChkYXRhIHx8IHt9KS5wYXltZW50SW5mbyB8fCB7fSkuc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdpbnZvaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfSU5WT0lDRSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxpdmVyaW5nJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfREVMSVZFUklORywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd0cm91YmxlZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX1RST1VCTEVELCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvbmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19ET05FLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmdldFBheW1lbnRVcmwoKTtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVN0YXR1cyhldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzRGF0YSA9IGV2ZW50LmRldGFpbDtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTLCBzdGF0dXNEYXRhKTtcclxuICAgICAgICAgICAgdHJpZ2dlclNwbGl0U3RhdHVzKHN0YXR1c0RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlVXNlckxvY2FsZShldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdXNlckNvdW50cnkgPSB7XHJcbiAgICAgICAgICAgICAgICB1c2VyX2NvdW50cnk6IGV2ZW50LmRldGFpbC51c2VyX2NvdW50cnlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyQ3VzdG9tRXZlbnQoQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCB1c2VyQ291bnRyeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVGY3AoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyQ3VzdG9tRXZlbnQoQXBwLmV2ZW50VHlwZXMuRkNQLCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyQ3VzdG9tRXZlbnQoQXBwLmV2ZW50VHlwZXMuRVJST1IsIGV2ZW50LmRldGFpbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gbnVsbDtcclxuICAgICAgICBpZiAoKG5ldyBEZXZpY2UpLmlzTW9iaWxlKCkgJiYgIXRoaXMuY29uZmlnLmlmcmFtZU9ubHkpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkV2luZG93ID0gbmV3IENoaWxkV2luZG93O1xyXG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignb3BlbicsIGZ1bmN0aW9uIGhhbmRsZU9wZW4oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBvc3RNZXNzYWdlID0gY2hpbGRXaW5kb3cuZ2V0UG9zdE1lc3NhZ2UoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU4pO1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTl9XSU5ET1cpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdvcGVuJywgaGFuZGxlT3Blbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignbG9hZCcsIGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZignbG9hZCcsIGhhbmRsZUxvYWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRV9XSU5ET1cpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoQXBwLmV2ZW50VHlwZXMuRkNQLCBoYW5kbGVGY3ApO1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKEFwcC5ldmVudFR5cGVzLkVSUk9SLCBoYW5kbGVFcnJvcik7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ3N0YXR1cycsIGhhbmRsZVN0YXR1cyk7XHJcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XHJcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKEFwcC5ldmVudFR5cGVzLkZDUCwgaGFuZGxlRmNwKTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oQXBwLmV2ZW50VHlwZXMuRVJST1IsIGhhbmRsZUVycm9yKTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub3Blbih1cmwsIHRoaXMuY29uZmlnLmNoaWxkV2luZG93KTtcclxuICAgICAgICAgICAgdGhhdC5jaGlsZFdpbmRvdyA9IGNoaWxkV2luZG93O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBsaWdodEJveCA9IG5ldyBMaWdodEJveCgobmV3IERldmljZSkuaXNNb2JpbGUoKSAmJiB0aGlzLmNvbmZpZy5pZnJhbWVPbmx5KTtcclxuICAgICAgICAgICAgbGlnaHRCb3gub24oJ29wZW4nLCBmdW5jdGlvbiBoYW5kbGVPcGVuKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5wb3N0TWVzc2FnZSA9IGxpZ2h0Qm94LmdldFBvc3RNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU5fTElHSFRCT1gpO1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKCdvcGVuJywgaGFuZGxlT3Blbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vbignbG9hZCcsIGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignbG9hZCcsIGhhbmRsZUxvYWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGlnaHRCb3gub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRV9MSUdIVEJPWCk7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ3N0YXR1cycsIGhhbmRsZVN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCBoYW5kbGVVc2VyTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZihBcHAuZXZlbnRUeXBlcy5GQ1AsIGhhbmRsZUZjcCk7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoQXBwLmV2ZW50VHlwZXMuRVJST1IsIGhhbmRsZUVycm9yKTtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vbignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcclxuICAgICAgICAgICAgbGlnaHRCb3gub24oQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCBoYW5kbGVVc2VyTG9jYWxlKTtcclxuICAgICAgICAgICAgbGlnaHRCb3gub24oQXBwLmV2ZW50VHlwZXMuRkNQLCBoYW5kbGVGY3ApO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vbihBcHAuZXZlbnRUeXBlcy5FUlJPUiwgaGFuZGxlRXJyb3IpO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vcGVuRnJhbWUodXJsLCB0aGlzLmNvbmZpZy5saWdodGJveCk7XHJcbiAgICAgICAgICAgIHRoYXQuY2hpbGRXaW5kb3cgPSBsaWdodEJveDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIHBheW1lbnQgaW50ZXJmYWNlIChQYXlTdGF0aW9uKVxyXG4gICAgICovXHJcbiAgICBBcHAucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2hpbGRXaW5kb3cuY2xvc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbiBmb3Igb25lIG9yIG1vcmUgZXZlbnRzIHRvIHRoZSB3aWRnZXRcclxuICAgICAqIEBwYXJhbSBldmVudCBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXMgKGluaXQsIG9wZW4sIGxvYWQsIGNsb3NlLCBzdGF0dXMsIHN0YXR1cy1pbnZvaWNlLCBzdGF0dXMtZGVsaXZlcmluZywgc3RhdHVzLXRyb3VibGVkLCBzdGF0dXMtZG9uZSlcclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIEEgZnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWRcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBoYW5kbGVyRGVjb3JhdG9yID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaGFuZGxlcihldmVudCwgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZXJEZWNvcmF0b3IsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhbiBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQgT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBBIGhhbmRsZXIgZnVuY3Rpb24gcHJldmlvdXNseSBhdHRhY2hlZCBmb3IgdGhlIGV2ZW50KHMpXHJcbiAgICAgKi9cclxuICAgIEFwcC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbmQgYSBtZXNzYWdlIGRpcmVjdGx5IHRvIFBheVN0YXRpb25cclxuICAgICAqIEBwYXJhbSBjb21tYW5kXHJcbiAgICAgKiBAcGFyYW0gZGF0YVxyXG4gICAgICovXHJcbiAgICBBcHAucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKGNvbW1hbmQsIGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5wb3N0TWVzc2FnZSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlLnNlbmQuYXBwbHkodGhpcy5wb3N0TWVzc2FnZSwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gZm9yIG1lc3NhZ2UgZXZlbnQgZnJvbSBQYXlTdGF0aW9uXHJcbiAgICAgKiBAcGFyYW0gY29tbWFuZFxyXG4gICAgICogQHBhcmFtIGhhbmRsZXJcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5vbk1lc3NhZ2UgPSBmdW5jdGlvbiAoY29tbWFuZCwgaGFuZGxlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnBvc3RNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uub24uYXBwbHkodGhpcy5wb3N0TWVzc2FnZSwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBBcHA7XHJcbn0pKCk7XHJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJyk7XHJcbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XHJcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENoaWxkV2luZG93KCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xyXG4gICAgICAgIHJldHVybiBDaGlsZFdpbmRvdy5fTkFNRVNQQUNFICsgJ18nICsgZXZlbnROYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmV2ZW50T2JqZWN0ID0gbnVsbDtcclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jaGlsZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudCwgZGF0YSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdyAmJiAhdGhpcy5jaGlsZFdpbmRvdy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHZhciBhZGRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2VDaGlsZFdpbmRvdygpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQub2ZmKCdjbG9zZScsIGNsb3NlQ2hpbGRXaW5kb3cpXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLmNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5jaGlsZFdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY2hpbGRXaW5kb3cuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhhdC5vbignY2xvc2UnLCBjbG9zZUNoaWxkV2luZG93KTtcclxuXHJcbiAgICAgICAgICAgIC8vIENyb3NzLXdpbmRvdyBjb21tdW5pY2F0aW9uXHJcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZSA9IG5ldyBQb3N0TWVzc2FnZSh0aGF0LmNoaWxkV2luZG93KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdkaW1lbnNpb25zIHdpZGdldC1kZXRlY3Rpb24nLCBmdW5jdGlvbiBoYW5kbGVXaWRnZXREZXRlY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudCgnbG9hZCcpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZignZGltZW5zaW9ucyB3aWRnZXQtZGV0ZWN0aW9uJywgaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignd2lkZ2V0LWRldGVjdGlvbicsIGZ1bmN0aW9uIGhhbmRsZVdpZGdldERldGVjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQubWVzc2FnZS5zZW5kKCd3aWRnZXQtZGV0ZWN0ZWQnLCB7dmVyc2lvbjogdmVyc2lvbiwgY2hpbGRXaW5kb3dPcHRpb25zOiBvcHRpb25zfSk7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub2ZmKCd3aWRnZXQtZGV0ZWN0aW9uJywgaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignc3RhdHVzJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIGNsb3NlQ2hpbGRXaW5kb3coKTtcclxuICAgICAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCd1c2VyLWNvdW50cnknLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCd1c2VyLWNvdW50cnknLCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdmY3AnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCdmY3AnLCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ2Vycm9yJywgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlICdfc2VsZic6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdztcclxuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnX3BhcmVudCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ19ibGFuayc6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5vcGVuKHVybCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjaGVja1dpbmRvdyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcclxuICAgIH07XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZ2V0UG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcclxuICAgIH07XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cuX05BTUVTUEFDRSA9ICdDSElMRF9XSU5ET1cnO1xyXG5cclxuICAgIHJldHVybiBDaGlsZFdpbmRvdztcclxufSkoKTtcclxuIiwidmFyIGJvd3NlciA9IHJlcXVpcmUoJ2Jvd3NlcicpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGV2aWNlKCkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTW9iaWxlIGRldmljZXNcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBEZXZpY2UucHJvdG90eXBlLmlzTW9iaWxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIGJvd3Nlci5tb2JpbGUgfHwgYm93c2VyLnRhYmxldDtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIERldmljZTtcclxufSkoKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuICAgIHRoaXMubmFtZSA9IFwiWHNvbGxhUGF5U3RhdGlvbldpZGdldEV4Y2VwdGlvblwiO1xyXG4gICAgdGhpcy50b1N0cmluZyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICc6ICcgKyB0aGlzLm1lc3NhZ2U7XHJcbiAgICB9KS5iaW5kKHRoaXMpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XHJcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuaXEobGlzdCkge1xyXG4gIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4LCBpLCBhKSB7XHJcbiAgICByZXR1cm4gYS5pbmRleE9mKHgpID09IGlcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gemlwT2JqZWN0KHByb3BzLCB2YWx1ZXMpIHtcclxuICB2YXIgaW5kZXggPSAtMSxcclxuICAgICAgbGVuZ3RoID0gcHJvcHMgPyBwcm9wcy5sZW5ndGggOiAwLFxyXG4gICAgICByZXN1bHQgPSB7fTtcclxuXHJcbiAgaWYgKGxlbmd0aCAmJiAhdmFsdWVzICYmICFBcnJheS5pc0FycmF5KHByb3BzWzBdKSkge1xyXG4gICAgdmFsdWVzID0gW107XHJcbiAgfVxyXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xyXG4gICAgaWYgKHZhbHVlcykge1xyXG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlc1tpbmRleF07XHJcbiAgICB9IGVsc2UgaWYgKGtleSkge1xyXG4gICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyYW0oYSkge1xyXG4gIHZhciBzID0gW107XHJcblxyXG4gIHZhciBhZGQgPSBmdW5jdGlvbiAoaywgdikge1xyXG4gICAgICB2ID0gdHlwZW9mIHYgPT09ICdmdW5jdGlvbicgPyB2KCkgOiB2O1xyXG4gICAgICB2ID0gdiA9PT0gbnVsbCA/ICcnIDogdiA9PT0gdW5kZWZpbmVkID8gJycgOiB2O1xyXG4gICAgICBzW3MubGVuZ3RoXSA9IGVuY29kZVVSSUNvbXBvbmVudChrKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2KTtcclxuICB9O1xyXG5cclxuICB2YXIgYnVpbGRQYXJhbXMgPSBmdW5jdGlvbiAocHJlZml4LCBvYmopIHtcclxuICAgICAgdmFyIGksIGxlbiwga2V5O1xyXG5cclxuICAgICAgaWYgKHByZWZpeCkge1xyXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhcclxuICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArICdbJyArICh0eXBlb2Ygb2JqW2ldID09PSAnb2JqZWN0JyAmJiBvYmpbaV0gPyBpIDogJycpICsgJ10nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgb2JqW2ldXHJcbiAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChTdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcclxuICAgICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgYnVpbGRQYXJhbXMocHJlZml4ICsgJ1snICsga2V5ICsgJ10nLCBvYmpba2V5XSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhZGQocHJlZml4LCBvYmopO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgYWRkKG9ialtpXS5uYW1lLCBvYmpbaV0udmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgYnVpbGRQYXJhbXMoa2V5LCBvYmpba2V5XSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIGJ1aWxkUGFyYW1zKCcnLCBhKS5qb2luKCcmJyk7XHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gb25jZShmKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICBmKGFyZ3VtZW50cyk7XHJcbiAgICAgIGYgPSBmdW5jdGlvbigpIHt9O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRXZlbnRPYmplY3QoY29udGV4dCwgd3JhcEV2ZW50SW5OYW1lc3BhY2UpIHtcclxuICAgIHZhciBkdW1teVdyYXBwZXIgPSBmdW5jdGlvbihldmVudCkgeyByZXR1cm4gZXZlbnQgfTtcclxuICAgIHZhciB3cmFwRXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlIHx8IGR1bW15V3JhcHBlcjtcclxuICAgIHZhciBldmVudHNMaXN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gaXNTdHJpbmdDb250YWluZWRTcGFjZShzdHIpIHtcclxuICAgICAgcmV0dXJuIC8gLy50ZXN0KHN0cilcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0cmlnZ2VyOiAoZnVuY3Rpb24oZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudEluTmFtZXNwYWNlLCB7ZGV0YWlsOiBkYXRhfSk7IC8vIE5vdCB3b3JraW5nIGluIElFXHJcbiAgICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgICAgICAgICAgICBldmVudC5pbml0Q3VzdG9tRXZlbnQoZXZlbnRJbk5hbWVzcGFjZSwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgfSkuYmluZChjb250ZXh0KSxcclxuICAgICAgb246IChmdW5jdGlvbihldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRFdmVudChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgdmFyIGV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudEluTmFtZXNwYWNlLCBoYW5kbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgZXZlbnRzTGlzdC5wdXNoKHtuYW1lOiBldmVudEluTmFtZXNwYWNlLCBoYW5kbGU6IGhhbmRsZSwgb3B0aW9uczogb3B0aW9ucyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKGV2ZW50TmFtZSkpIHtcclxuICAgICAgICAgIHZhciBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnNlZEV2ZW50TmFtZSkge1xyXG4gICAgICAgICAgICBhZGRFdmVudChwYXJzZWRFdmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucylcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGFkZEV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9KS5iaW5kKGNvbnRleHQpLFxyXG5cclxuICAgICAgb2ZmOiAoZnVuY3Rpb24oZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBvZmZBbGxFdmVudHMgPSAhZXZlbnROYW1lICYmICFoYW5kbGUgJiYgIW9wdGlvbnM7XHJcblxyXG4gICAgICAgIGlmIChvZmZBbGxFdmVudHMpIHtcclxuICAgICAgICAgIGV2ZW50c0xpc3QuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50Lm5hbWUsIGV2ZW50LmhhbmRsZSwgZXZlbnQub3B0aW9ucyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICBldmVudHNMaXN0ID0gZXZlbnRzTGlzdC5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50Lm5hbWUgIT09IGV2ZW50SW5OYW1lc3BhY2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKGV2ZW50TmFtZSkpIHtcclxuICAgICAgICAgIHZhciBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnNlZEV2ZW50TmFtZSkge1xyXG4gICAgICAgICAgICByZW1vdmVFdmVudChwYXJzZWRFdmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucylcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlbW92ZUV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9KS5iaW5kKGNvbnRleHQpXHJcbiAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgYWRkRXZlbnRPYmplY3Q6IGFkZEV2ZW50T2JqZWN0LFxyXG4gIGlzRW1wdHk6IGlzRW1wdHksXHJcbiAgdW5pcTogdW5pcSxcclxuICB6aXBPYmplY3Q6IHppcE9iamVjdCxcclxuICBwYXJhbTogcGFyYW0sXHJcbiAgb25jZTogb25jZSxcclxufVxyXG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpO1xyXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xyXG52YXIgUG9zdE1lc3NhZ2UgPSByZXF1aXJlKCcuL3Bvc3RtZXNzYWdlJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMaWdodEJveChpc01vYmlsZSkge1xyXG4gICAgICAgIHJlcXVpcmUoJy4vc3R5bGVzL2xpZ2h0Ym94LnNjc3MnKTtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzLCB3cmFwRXZlbnRJbk5hbWVzcGFjZSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gaXNNb2JpbGUgPyBERUZBVUxUX09QVElPTlNfTU9CSUxFIDogREVGQVVMVF9PUFRJT05TO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIENMQVNTX1BSRUZJWCA9ICd4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xyXG4gICAgdmFyIENPTU1PTl9PUFRJT05TID0ge1xyXG4gICAgICAgIHpJbmRleDogMTAwMCxcclxuICAgICAgICBvdmVybGF5T3BhY2l0eTogJy42JyxcclxuICAgICAgICBvdmVybGF5QmFja2dyb3VuZDogJyMwMDAwMDAnLFxyXG4gICAgICAgIGNvbnRlbnRCYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgY2xvc2VCeUtleWJvYXJkOiB0cnVlLFxyXG4gICAgICAgIGNsb3NlQnlDbGljazogdHJ1ZSxcclxuICAgICAgICBtb2RhbDogZmFsc2UsXHJcbiAgICAgICAgc3Bpbm5lcjogJ3hzb2xsYScsXHJcbiAgICAgICAgc3Bpbm5lckNvbG9yOiBudWxsLFxyXG4gICAgICAgIHNwaW5uZXJVcmw6IG51bGwsXHJcbiAgICAgICAgc3Bpbm5lclJvdGF0aW9uUGVyaW9kOiAwXHJcbiAgICB9O1xyXG4gICAgdmFyIERFRkFVTFRfT1BUSU9OUyA9IE9iamVjdC5hc3NpZ24oe30sIENPTU1PTl9PUFRJT05TLCB7XHJcbiAgICAgICAgd2lkdGg6IG51bGwsXHJcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgY29udGVudE1hcmdpbjogJzEwcHgnXHJcbiAgICB9KTtcclxuICAgIHZhciBERUZBVUxUX09QVElPTlNfTU9CSUxFID0gT2JqZWN0LmFzc2lnbih7fSwgQ09NTU9OX09QVElPTlMsIHtcclxuICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgIGhlaWdodDogJzEwMCUnLCBcclxuICAgICAgICBjb250ZW50TWFyZ2luOiAnMHB4J1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNQSU5ORVJTID0ge1xyXG4gICAgICAgIHhzb2xsYTogcmVxdWlyZSgnLi9zcGlubmVycy94c29sbGEuc3ZnJyksXHJcbiAgICAgICAgcm91bmQ6IHJlcXVpcmUoJy4vc3Bpbm5lcnMvcm91bmQuc3ZnJyksXHJcbiAgICAgICAgbm9uZTogJyAnXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBNSU5fUFNfRElNRU5TSU9OUyA9IHtcclxuICAgICAgICBoZWlnaHQ6IDUwMCxcclxuICAgICAgICB3aWR0aDogNjAwXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBoYW5kbGVLZXl1cEV2ZW50TmFtZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKCdrZXl1cCcpO1xyXG4gICAgdmFyIGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKCdyZXNpemUnKTtcclxuXHJcbiAgICB2YXIgaGFuZGxlR2xvYmFsS2V5dXAgPSBmdW5jdGlvbihldmVudCkge1xyXG5cclxuICAgICAgICB2YXIgY2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgICAgIGNsaWNrRXZlbnQuaW5pdEV2ZW50KGhhbmRsZUtleXVwRXZlbnROYW1lLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgY2xpY2tFdmVudC5zb3VyY2VFdmVudCA9IGV2ZW50O1xyXG5cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhbmRsZVNwZWNpZmljS2V5dXAgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC5zb3VyY2VFdmVudC53aGljaCA9PSAyNykge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhbmRsZUdsb2JhbFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciByZXNpemVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgICAgIHJlc2l6ZUV2ZW50LmluaXRFdmVudChoYW5kbGVSZXNpemVFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcclxuXHJcbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQocmVzaXplRXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xyXG4gICAgICAgIHJldHVybiBMaWdodEJveC5fTkFNRVNQQUNFICsgJ18nICsgZXZlbnROYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlci5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUubWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoOiBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9kZXRlY3Qtc2Nyb2xsYmFyLXdpZHRoXHJcbiAgICAgICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgc2Nyb2xsRGl2LmNsYXNzTGlzdC5hZGQoXCJzY3JvbGxiYXItbWVhc3VyZVwiKTtcclxuICAgICAgICBzY3JvbGxEaXYuc2V0QXR0cmlidXRlKFwic3R5bGVcIixcclxuICAgICAgICAgICAgXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICBcInRvcDogLTk5OTlweFwiICtcclxuICAgICAgICAgICAgXCJ3aWR0aDogNTBweFwiICtcclxuICAgICAgICAgICAgXCJoZWlnaHQ6IDUwcHhcIiArXHJcbiAgICAgICAgICAgIFwib3ZlcmZsb3c6IHNjcm9sbFwiXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JvbGxEaXYpO1xyXG5cclxuICAgICAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpO1xyXG5cclxuICAgICAgICByZXR1cm4gc2Nyb2xsYmFyV2lkdGg7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vcGVuRnJhbWUgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuICAgICAgICB2YXIgSGFuZGxlQm91bmRTcGVjaWZpY0tleXVwID0gaGFuZGxlU3BlY2lmaWNLZXl1cC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG4gICAgICAgIHZhciBzcGlubmVyID0gb3B0aW9ucy5zcGlubmVyID09PSAnY3VzdG9tJyAmJiAhIW9wdGlvbnMuc3Bpbm5lclVybCA/XHJcbiAgICAgICAgICAgICc8aW1nIGNsYXNzPVwic3Bpbm5lci1jdXN0b21cIiBzcmM9XCInICsgZW5jb2RlVVJJKG9wdGlvbnMuc3Bpbm5lclVybCkgKyAnXCIgLz4nIDogU1BJTk5FUlNbb3B0aW9ucy5zcGlubmVyXSB8fCBPYmplY3QudmFsdWVzKFNQSU5ORVJTKVswXTtcclxuXHJcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIHZhciBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIGhvc3QuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4O1xyXG5cclxuICAgICAgICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgb3ZlcmxheS5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLW92ZXJsYXknO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnQnICsgJyAnICsgc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50X19oaWRkZW4nO1xyXG5cclxuICAgICAgICAgICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG4gICAgICAgICAgICBpZnJhbWUuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50LWlmcmFtZSc7XHJcbiAgICAgICAgICAgIGlmcmFtZS5zcmMgPSBzZXR0aW5ncy51cmw7XHJcbiAgICAgICAgICAgIGlmcmFtZS5mcmFtZUJvcmRlciA9ICcwJztcclxuICAgICAgICAgICAgaWZyYW1lLmFsbG93RnVsbHNjcmVlbiA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBzcGlubmVyLmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctc3Bpbm5lcic7XHJcbiAgICAgICAgICAgIHNwaW5uZXIuaW5uZXJIVE1MID0gc2V0dGluZ3Muc3Bpbm5lcjtcclxuXHJcbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcclxuXHJcbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XHJcbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQoc3Bpbm5lcik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaG9zdDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcclxuICAgICAgICB2YXIgbGlnaHRCb3hFbGVtZW50ID0gdGVtcGxhdGUoe1xyXG4gICAgICAgICAgICBwcmVmaXg6IENMQVNTX1BSRUZJWCxcclxuICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgIHNwaW5uZXI6IHNwaW5uZXJcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgbGlnaHRCb3hPdmVybGF5RWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctb3ZlcmxheScpO1xyXG4gICAgICAgIHZhciBsaWdodEJveENvbnRlbnRFbGVtZW50ID0gbGlnaHRCb3hFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1jb250ZW50Jyk7XHJcbiAgICAgICAgdmFyIGxpZ2h0Qm94SWZyYW1lRWxlbWVudCA9IGxpZ2h0Qm94Q29udGVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLWNvbnRlbnQtaWZyYW1lJyk7XHJcbiAgICAgICAgdmFyIGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLXNwaW5uZXInKTtcclxuXHJcbiAgICAgICAgdmFyIHBzRGltZW5zaW9ucyA9IHtcclxuICAgICAgICAgICAgd2lkdGg6IHdpdGhEZWZhdWx0UFhVbml0KE1JTl9QU19ESU1FTlNJT05TLndpZHRoKSxcclxuICAgICAgICAgICAgaGVpZ2h0OiB3aXRoRGVmYXVsdFBYVW5pdChNSU5fUFNfRElNRU5TSU9OUy5oZWlnaHQpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gd2l0aERlZmF1bHRQWFVuaXQodmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGlzU3RyaW5nV2l0aG91dFVuaXQgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFN0cmluZyhwYXJzZUZsb2F0KHZhbHVlKSkubGVuZ3RoID09PSB2YWx1ZS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ1dpdGhvdXRVbml0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgKyAncHgnIDogdmFsdWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpZ2h0Qm94RWxlbWVudC5zdHlsZS56SW5kZXggPSBvcHRpb25zLnpJbmRleDtcclxuXHJcbiAgICAgICAgbGlnaHRCb3hPdmVybGF5RWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gb3B0aW9ucy5vdmVybGF5T3BhY2l0eTtcclxuICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMub3ZlcmxheUJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5jb250ZW50QmFja2dyb3VuZDtcclxuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLm1hcmdpbiA9IHdpdGhEZWZhdWx0UFhVbml0KG9wdGlvbnMuY29udGVudE1hcmdpbik7XHJcbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS53aWR0aCA9IG9wdGlvbnMud2lkdGggPyB3aXRoRGVmYXVsdFBYVW5pdChvcHRpb25zLndpZHRoKSA6ICdhdXRvJztcclxuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0ID8gd2l0aERlZmF1bHRQWFVuaXQob3B0aW9ucy5oZWlnaHQpIDogJ2F1dG8nO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5zcGlubmVyQ29sb3IpIHtcclxuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwYXRoJykuc3R5bGUuZmlsbCA9IG9wdGlvbnMuc3Bpbm5lckNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc3Bpbm5lciA9PT0gJ2N1c3RvbScpIHtcclxuICAgICAgICAgICAgdmFyIHNwaW5uZXJDdXN0b20gPSBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyLWN1c3RvbScpO1xyXG4gICAgICAgICAgICBzcGlubmVyQ3VzdG9tLnN0eWxlWyctd2Via2l0LWFuaW1hdGlvbi1kdXJhdGlvbiddID0gb3B0aW9ucy5zcGlubmVyUm90YXRpb25QZXJpb2QgKyAnczsnO1xyXG4gICAgICAgICAgICBzcGlubmVyQ3VzdG9tLnN0eWxlWydhbmltYXRpb24tZHVyYXRpb24nXSA9IG9wdGlvbnMuc3Bpbm5lclJvdGF0aW9uUGVyaW9kICsgJ3M7JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmNsb3NlQnlDbGljaykge1xyXG4gICAgICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xyXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKGxpZ2h0Qm94RWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmNsb3NlQnlLZXlib2FyZCkge1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgSGFuZGxlQm91bmRTcGVjaWZpY0tleXVwKTtcclxuXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGFuZGxlR2xvYmFsS2V5dXAsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzaG93Q29udGVudCA9IEhlbHBlcnMub25jZSgoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBoaWRlU3Bpbm5lcihvcHRpb25zKTtcclxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX1BSRUZJWCArICctY29udGVudF9faGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdsb2FkJyk7XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciBsaWdodEJveFJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCA/IG9wdGlvbnMud2lkdGggOiBwc0RpbWVuc2lvbnMud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCA/IG9wdGlvbnMuaGVpZ2h0IDogcHNEaW1lbnNpb25zLmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xyXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xyXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc4cHgnO1xyXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gd2l0aERlZmF1bHRQWFVuaXQod2lkdGgpO1xyXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IHdpdGhEZWZhdWx0UFhVbml0KGhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGggPSBsaWdodEJveEVsZW1lbnQuY2xpZW50V2lkdGgsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSBsaWdodEJveEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IG91dGVyV2lkdGgobGlnaHRCb3hDb250ZW50RWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBjb250ZW50SGVpZ2h0ID0gb3V0ZXJIZWlnaHQobGlnaHRCb3hDb250ZW50RWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgaG9yTWFyZ2luID0gY29udGVudFdpZHRoIC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRXaWR0aCxcclxuICAgICAgICAgICAgICAgIHZlcnRNYXJnaW4gPSBjb250ZW50SGVpZ2h0IC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgaG9yRGlmZiA9IGNvbnRhaW5lcldpZHRoIC0gY29udGVudFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgdmVydERpZmYgPSBjb250YWluZXJIZWlnaHQgLSBjb250ZW50SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgaWYgKGhvckRpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gY29udGFpbmVyV2lkdGggLSBob3JNYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5sZWZ0ID0gTWF0aC5yb3VuZChob3JEaWZmIC8gMikgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodmVydERpZmYgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHZlcnRNYXJnaW4gKyAncHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS50b3AgPSBNYXRoLnJvdW5kKHZlcnREaWZmIC8gMikgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUgPSBIZWxwZXJzLm9uY2UobGlnaHRCb3hSZXNpemUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvdXRlcldpZHRoKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IGVsLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuXHJcbiAgICAgICAgICAgIHdpZHRoICs9IHBhcnNlSW50KHN0eWxlLm1hcmdpbkxlZnQpICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luUmlnaHQpO1xyXG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvdXRlckhlaWdodChlbCkge1xyXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuXHJcbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBib2R5U3R5bGVzO1xyXG4gICAgICAgIHZhciBoaWRlU2Nyb2xsYmFyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYm9keVN0eWxlcyA9IEhlbHBlcnMuemlwT2JqZWN0KFsnb3ZlcmZsb3cnLCAncGFkZGluZ1JpZ2h0J10ubWFwKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBba2V5LCBnZXRDb21wdXRlZFN0eWxlKGJvZHlFbGVtZW50KVtrZXldXTtcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJvZHlQYWQgPSBwYXJzZUludCgoZ2V0Q29tcHV0ZWRTdHlsZShib2R5RWxlbWVudClbJ3BhZGRpbmdSaWdodCddIHx8IDApLCAxMCk7XHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IHdpdGhEZWZhdWx0UFhVbml0KGJvZHlQYWQgKyB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKSk7XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdmFyIHJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlcykge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoYm9keVN0eWxlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZVtrZXldID0gYm9keVN0eWxlc1trZXldO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBzaG93U3Bpbm5lciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgaGlkZVNwaW5uZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbG9hZFRpbWVyO1xyXG4gICAgICAgIGxpZ2h0Qm94SWZyYW1lRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gaGFuZGxlTG9hZChldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdGltZW91dCA9ICEob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkgPyAob3B0aW9ucy5yZXNpemVUaW1lb3V0IHx8IDMwMDAwKSA6IDEwMDA7IC8vIDMwMDAwIGlmIHBzRGltZW5zaW9ucyB3aWxsIG5vdCBhcnJpdmUgYW5kIGN1c3RvbSB0aW1lb3V0IGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgICAgICBsb2FkVGltZXIgPSBnbG9iYWwuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hvd0NvbnRlbnQoKTtcclxuICAgICAgICAgICAgfSwgdGltZW91dCk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94SWZyYW1lRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgaGFuZGxlTG9hZCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgaWZyYW1lV2luZG93ID0gbGlnaHRCb3hJZnJhbWVFbGVtZW50LmNvbnRlbnRXaW5kb3cgfHwgbGlnaHRCb3hJZnJhbWVFbGVtZW50O1xyXG5cclxuICAgICAgICAvLyBDcm9zcy13aW5kb3cgY29tbXVuaWNhdGlvblxyXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG5ldyBQb3N0TWVzc2FnZShpZnJhbWVXaW5kb3cpO1xyXG4gICAgICAgIGlmIChvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbignZGltZW5zaW9ucycsIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveFJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgc2hvd0NvbnRlbnQoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbignZGltZW5zaW9ucycsIChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZXZlbnQuZGV0YWlsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZGltZW5zaW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIHBzRGltZW5zaW9ucyA9IEhlbHBlcnMuemlwT2JqZWN0KFsnd2lkdGgnLCAnaGVpZ2h0J10ubWFwKGZ1bmN0aW9uIChkaW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtkaW0sIE1hdGgubWF4KE1JTl9QU19ESU1FTlNJT05TW2RpbV0gfHwgMCwgZGF0YS5kaW1lbnNpb25zW2RpbV0gfHwgMCkgKyAncHgnXTtcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzaG93Q29udGVudCgpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignd2lkZ2V0LWRldGVjdGlvbicsIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5zZW5kKCd3aWRnZXQtZGV0ZWN0ZWQnLCB7dmVyc2lvbjogdmVyc2lvbiwgbGlnaHRCb3hPcHRpb25zOiBvcHRpb25zfSk7XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCd3aWRnZXQtY2xvc2UnLCAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2Nsb3NlJywgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdzdGF0dXMnLCAoZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdzdGF0dXMnLCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS5vbigndXNlci1jb3VudHJ5JywgKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgndXNlci1jb3VudHJ5JywgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2ZjcCcsIChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2ZjcCcsIGV2ZW50LmRldGFpbCk7XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdlcnJvcicsIChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Vycm9yJywgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy8gUmVzaXplXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoaGFuZGxlUmVzaXplRXZlbnROYW1lLCBsaWdodEJveFJlc2l6ZSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZUdsb2JhbFJlc2l6ZSk7XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIGFmdGVyIGNsb3NlXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZigpO1xyXG4gICAgICAgICAgICBib2R5RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGhhbmRsZUtleXVwRXZlbnROYW1lLCBIYW5kbGVCb3VuZFNwZWNpZmljS2V5dXApXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGFuZGxlR2xvYmFsS2V5dXApO1xyXG5cclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZUdsb2JhbFJlc2l6ZSlcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSwgbGlnaHRCb3hSZXNpemUpO1xyXG4gICAgICAgICAgICBsaWdodEJveEVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsaWdodEJveEVsZW1lbnQpO1xyXG4gICAgICAgICAgICByZXNldFNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB0aGF0Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNob3dTcGlubmVyKCk7XHJcbiAgICAgICAgaGlkZVNjcm9sbGJhcigpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5jbG9zZUZyYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm1vZGFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbi5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5nZXRQb3N0TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xyXG4gICAgfTtcclxuXHJcbiAgICBMaWdodEJveC5fTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xyXG5cclxuICAgIHJldHVybiBMaWdodEJveDtcclxufSkoKTtcclxuIiwiZnVuY3Rpb24gb2JqZWN0QXNzaWduKCkge1xyXG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24gUG9seWZpbGxcclxuICBPYmplY3QuYXNzaWdufHxPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LFwiYXNzaWduXCIse2VudW1lcmFibGU6ITEsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOmZ1bmN0aW9uKGUscil7XCJ1c2Ugc3RyaWN0XCI7aWYobnVsbD09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0XCIpO2Zvcih2YXIgdD1PYmplY3QoZSksbj0xO248YXJndW1lbnRzLmxlbmd0aDtuKyspe3ZhciBvPWFyZ3VtZW50c1tuXTtpZihudWxsIT1vKWZvcih2YXIgYT1PYmplY3Qua2V5cyhPYmplY3QobykpLGM9MCxiPWEubGVuZ3RoO2M8YjtjKyspe3ZhciBpPWFbY10sbD1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8saSk7dm9pZCAwIT09bCYmbC5lbnVtZXJhYmxlJiYodFtpXT1vW2ldKX19cmV0dXJuIHR9fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFycmF5Rm9yRWFjaCgpIHtcclxuICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaHx8KEFycmF5LnByb3RvdHlwZS5mb3JFYWNoPWZ1bmN0aW9uKHIsbyl7dmFyIHQsbjtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3IoXCIgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkXCIpO3ZhciBlPU9iamVjdCh0aGlzKSxpPWUubGVuZ3RoPj4+MDtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiByKXRocm93IG5ldyBUeXBlRXJyb3IocitcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtmb3IoYXJndW1lbnRzLmxlbmd0aD4xJiYodD1vKSxuPTA7bjxpOyl7dmFyIGY7biBpbiBlJiYoZj1lW25dLHIuY2FsbCh0LGYsbixlKSksbisrfX0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseVBvbHlmaWxscygpIHtcclxuICBvYmplY3RBc3NpZ24oKTtcclxuICBhcnJheUZvckVhY2goKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgYXBwbHlQb2x5ZmlsbHM6IGFwcGx5UG9seWZpbGxzXHJcbn1cclxuIiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xyXG4gICAgICAgIHJldHVybiBQb3N0TWVzc2FnZS5fTkFNRVNQQUNFICsgJ18nICsgZXZlbnROYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIFBvc3RNZXNzYWdlKHdpbmRvdykge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcclxuICAgICAgICB0aGlzLmxpbmtlZFdpbmRvdyA9IHdpbmRvdztcclxuXHJcbiAgICAgICAgZ2xvYmFsLndpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmIGdsb2JhbC53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlICE9PSB0aGlzLmxpbmtlZFdpbmRvdykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHt9O1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50LmRhdGEgPT09ICdzdHJpbmcnICYmIGdsb2JhbC5KU09OICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGdsb2JhbC5KU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jb21tYW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50T2JqZWN0LnRyaWdnZXIobWVzc2FnZS5jb21tYW5kLCBtZXNzYWdlLmRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cclxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5ldmVudE9iamVjdCA9IG51bGw7XHJcbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUubGlua2VkV2luZG93ID0gbnVsbDtcclxuXHJcbiAgICAvKiogUHVibGljIE1lbWJlcnMgKiovXHJcbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGNvbW1hbmQsIGRhdGEsIHRhcmdldE9yaWdpbikge1xyXG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRhcmdldE9yaWdpbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRhcmdldE9yaWdpbiA9ICcqJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5saW5rZWRXaW5kb3cgfHwgdGhpcy5saW5rZWRXaW5kb3cucG9zdE1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBnbG9iYWwud2luZG93LkpTT04gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLmxpbmtlZFdpbmRvdy5wb3N0TWVzc2FnZShnbG9iYWwuSlNPTi5zdHJpbmdpZnkoe2RhdGE6IGRhdGEsIGNvbW1hbmQ6IGNvbW1hbmR9KSwgdGFyZ2V0T3JpZ2luKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZihldmVudCwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgIH07XHJcblxyXG4gICAgUG9zdE1lc3NhZ2UuX05BTUVTUEFDRSA9ICdQT1NUX01FU1NBR0UnO1xyXG5cclxuXHJcbiAgICByZXR1cm4gUG9zdE1lc3NhZ2U7XHJcbn0pKCk7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHdpZHRoPVxcXCI0N3B4XFxcIiBoZWlnaHQ9XFxcIjQ3cHhcXFwiIGNsYXNzPVxcXCJzcGlubmVyLXJvdW5kXFxcIj48cGF0aCBkPVxcXCJNNC43ODUyNzI4LDEwLjQyMTA4NzUgQzIuOTQxMTE2NjQsMTMuMDU1MjE5NyAxLjYzNzc3MTA5LDE2LjA5NDYxMDYgMS4wMzc1Mzk1NiwxOS4zNzY4NTU2IEw1LjE2NjM4OTcxLDE5LjM3Njg1NTYgQzUuNjQyOTYxNSwxNy4xODc1NTQgNi41MDEyNTI0MywxNS4xMzkxNjQgNy42Njc2ODg5OSwxMy4zMDUzMDUgTDUuOTU1NzI0MjgsMTEuNTkyMjcwNSBMNC43ODUyNzI4LDEwLjQyMTA4NzUgTDQuNzg1MjcyOCwxMC40MjEwODc1IFogTTEwLjQ2OTMwNDgsNC43NDU2NTYxNSBDMTMuMTI3NDg3MywyLjg5MDgwNjEgMTYuMTk2NTk3NiwxLjU4Njc0NjQ4IDE5LjUxMDAxNjEsMSBMMTkuNTEwMDE2MSw0Ljk5NTIzOTM0IEMxNy4yNzEwOTIzLDUuNDg3OTc3ODIgMTUuMTgwMzE5Myw2LjM4MDg1MjkgMTMuMzE2NjkwNyw3LjU5NDgyMTUzIEwxMS42MzM3MzM5LDUuOTEwODEyOTMgTDEwLjQ2OTMwNDgsNC43NDU2NTYxNSBMMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IFogTTQyLjI0MjYzMDksMzYuNTM4ODM4NiBDNDQuMTExMjc4MiwzMy44NTc1MDE2IDQ1LjQyMDY0NjEsMzAuNzU4MTUwNCA0NiwyNy40MTE3MjY5IEw0MS45NDQxMjExLDI3LjQxMTcyNjkgQzQxLjQ1Mjc5NDUsMjkuNjYxODkyNiA0MC41NTgzNjkyLDMxLjc2MjkxMSAzOS4zNDA0NDEyLDMzLjYzNDkzNTYgTDQxLjAzMzIzNDcsMzUuMzI4Nzg2OSBMNDIuMjQyNTMwNiwzNi41Mzg4Mzg2IEw0Mi4yNDI2MzA5LDM2LjUzODgzODYgWiBNMzYuNTcwNzQ0MSw0Mi4yMjY0MjI3IEMzMy45MTY3NzczLDQ0LjA4Njc5NjcgMzAuODUwOTc5Myw0NS4zOTcyODQyIDI3LjUzOTg2OTMsNDUuOTkxMTYxNiBMMjcuNTM5ODY5Myw0MS43OTYwNTQ5IEMyOS43Mzc2NDAyLDQxLjMyMDI5MDEgMzEuNzkzNjg0MSw0MC40NTkzNTM2IDMzLjYzMzYyNDYsMzkuMjg3NTY4IEwzNS4zNTU0MjU4LDQxLjAxMDQ0NTMgTDM2LjU3MDc0NDEsNDIuMjI2NTIzMSBMMzYuNTcwNzQ0MSw0Mi4yMjY0MjI3IFogTTQuNzExNzk5NjUsMzYuNDczMTUzNSBDMi44Njc0NDI3NCwzMy44MDY5ODIzIDEuNTc0NjM2MzcsMzAuNzMwOTMyMiAxLDI3LjQxMTgyNzMgTDUuMTY4ODk5MDQsMjcuNDExODI3MyBDNS42NDgyODEyOCwyOS42MDczNTU5IDYuNTExNTkwODcsMzEuNjYxMDY5IDcuNjg0NjUyMDUsMzMuNDk4NDQzMiBMNS45NTU3MjQyOCwzNS4yMjg0NTE1IEw0LjcxMTc5OTY1LDM2LjQ3MzE1MzUgTDQuNzExNzk5NjUsMzYuNDczMTUzNSBaIE0xMC4zNjQwMTMzLDQyLjE4MDQyMyBDMTMuMDQ2Mjg1NCw0NC4wNzQ1NDM1IDE2LjE1MjczNDUsNDUuNDA1NTIgMTkuNTEwMTE2NSw0NiBMMTkuNTEwMTE2NSw0MS43ODIxOTQ3IEMxNy4yODE3MzE5LDQxLjI5MTY2NTggMTUuMjAwMDkyOCw0MC40MDQ4MTY5IDEzLjM0MzA4ODksMzkuMTk5NTg2MiBMMTEuNjMzNzMzOSw0MC45MTAwMDk0IEwxMC4zNjQwMTMzLDQyLjE4MDUyMzUgTDEwLjM2NDAxMzMsNDIuMTgwNDIzIFogTTQyLjE2ODg1NjcsMTAuMzU1NzAzOCBDNDQuMDM3MzAzMSwxMy4wMDQ4MDA4IDQ1LjM1NzQxMSwxNi4wNjc0OTI5IDQ1Ljk2MjY2MTIsMTkuMzc2ODU1NiBMNDEuOTQ2OTMxNiwxOS4zNzY4NTU2IEM0MS40NTg1MTU4LDE3LjEzMjgxNjQgNDAuNTY5MjA5NSwxNS4wMzY5MjAyIDM5LjM1ODAwNjUsMTMuMTY4NDEwOSBMNDEuMDMzNTM1OCwxMS40OTE4MzQ2IEw0Mi4xNjg5NTcsMTAuMzU1NzAzOCBMNDIuMTY4ODU2NywxMC4zNTU3MDM4IFogTTM2LjQ2NTE1MTYsNC42OTk5NTc4MiBDMzMuODM1NTc1NCwyLjg3ODY1MzM2IDMwLjgwNzExNjIsMS41OTQ4ODE3OSAyNy41NDAwNzAxLDEuMDA4ODM4MzYgTDI3LjU0MDA3MDEsNC45ODExNzgzMSBDMjkuNzQ4NDgwNSw1LjQ1OTE1MjcyIDMxLjgxMzc1ODcsNi4zMjYwMTQ5IDMzLjY2MDQyNDIsNy41MDY0Mzc5NCBMMzUuMzU1NTI2Miw1LjgxMDI3NjYgTDM2LjQ2NTE1MTYsNC42OTk5NTc4MiBMMzYuNDY1MTUxNiw0LjY5OTk1NzgyIFpcXFwiIGZpbGw9XFxcIiNDQ0NDQ0NcXFwiPjwvcGF0aD48L3N2Zz5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYVxcXCIgd2lkdGg9XFxcIjU2XFxcIiBoZWlnaHQ9XFxcIjU1XFxcIj48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEteFxcXCIgZD1cXFwiTTIxLjAzIDUuMDQybC0yLjExMi0yLjE1Ni0zLjY1NyAzLjY5NS0zLjY1Ny0zLjY5NS0yLjExMiAyLjE1NiAzLjY1OSAzLjY3My0zLjY1OSAzLjY5NiAyLjExMiAyLjE1NyAzLjY1Ny0zLjY5NyAzLjY1NyAzLjY5NyAyLjExMi0yLjE1Ny0zLjY0OC0zLjY5NiAzLjY0OC0zLjY3M3pcXFwiIGZpbGw9XFxcIiNGMjU0MkRcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtc1xcXCIgZD1cXFwiTTQxLjIzMiA2Ljg5NmwyLjk0MS0yLjk3NC0yLjEzNC0yLjEzMi0yLjkyIDIuOTczLS4wMDUtLjAwOC0yLjEzNCAyLjEzNS4wMDUuMDA4LS4wMDUuMDA1IDMuNzkyIDMuODItMi45MTUgMi45NDcgMi4xMTIgMi4xNTYgNS4wNi01LjExMS0zLjc5OC0zLjgxNi4wMDEtLjAwMXpcXFwiIGZpbGw9XFxcIiNGQ0NBMjBcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtb1xcXCIgZD1cXFwiTTQ4LjA2NiAyOS4xNTljLTEuNTM2IDAtMi43NjEgMS4yNjMtMi43NjEgMi43OSAwIDEuNTI0IDEuMjI2IDIuNzY1IDIuNzYxIDIuNzY1IDEuNTA5IDAgMi43MzYtMS4yNDIgMi43MzYtMi43NjUgMC0xLjUyNi0xLjIyNy0yLjc5LTIuNzM2LTIuNzltMCA4LjU5M2MtMy4xNzkgMC01Ljc3MS0yLjU5NC01Ljc3MS01LjgwNCAwLTMuMjEzIDIuNTkyLTUuODA4IDUuNzcxLTUuODA4IDMuMTU1IDAgNS43NDUgMi41OTQgNS43NDUgNS44MDggMCAzLjIxLTIuNTg5IDUuODA0LTUuNzQ1IDUuODA0XFxcIiBmaWxsPVxcXCIjOEMzRUE0XFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLWxcXFwiIGQ9XFxcIk0yNC4zODkgNDIuMzIzaDIuOTl2MTAuNDM3aC0yLjk5di0xMC40Mzd6bTQuMzM0IDBoMi45ODl2MTAuNDM3aC0yLjk4OXYtMTAuNDM3elxcXCIgZmlsbD1cXFwiI0I1REMyMFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1hXFxcIiBkPVxcXCJNNy43OTYgMzEuODk4bDEuNDA0IDIuNDU3aC0yLjgzNWwxLjQzMS0yLjQ1N2gtLjAwMXptLS4wMDEtNS43NTdsLTYuMzYzIDExLjEwMmgxMi43MDNsLTYuMzQxLTExLjEwMnpcXFwiIGZpbGw9XFxcIiM2NkNDREFcXFwiPjwvcGF0aD48L3N2Zz5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnc2Fzc2lmeScpKCcueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94e3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbiAwLjE1czthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbiAwLjE1c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LW92ZXJsYXl7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjA7ei1pbmRleDoxfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudHtwb3NpdGlvbjpyZWxhdGl2ZTt0b3A6MDtsZWZ0OjA7ei1pbmRleDozfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudF9faGlkZGVue3Zpc2liaWxpdHk6aGlkZGVuO3otaW5kZXg6LTF9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50LWlmcmFtZXt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnR9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVye3Bvc2l0aW9uOmFic29sdXRlO3RvcDo1MCU7bGVmdDo1MCU7ZGlzcGxheTpub25lO3otaW5kZXg6Mjtwb2ludGVyLWV2ZW50czpub25lfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGF7d2lkdGg6NTZweDtoZWlnaHQ6NTVweDttYXJnaW4tdG9wOi0yOHB4O21hcmdpbi1sZWZ0Oi0yNnB4fS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXgsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtcywueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1vLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWwsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtYXstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXkgMXMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7LXdlYmtpdC1hbmltYXRpb24tZmlsbC1tb2RlOmJvdGg7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDthbmltYXRpb24tZmlsbC1tb2RlOmJvdGh9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEteHstd2Via2l0LWFuaW1hdGlvbi1kZWxheTowczthbmltYXRpb24tZGVsYXk6MHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtc3std2Via2l0LWFuaW1hdGlvbi1kZWxheTouMnM7YW5pbWF0aW9uLWRlbGF5Oi4yc30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1vey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi40czthbmltYXRpb24tZGVsYXk6LjRzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWx7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjZzO2FuaW1hdGlvbi1kZWxheTouNnN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtYXstd2Via2l0LWFuaW1hdGlvbi1kZWxheTouOHM7YW5pbWF0aW9uLWRlbGF5Oi44c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXItcm91bmR7bWFyZ2luLXRvcDotMjNweDttYXJnaW4tbGVmdDotMjNweDstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXI7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIDNzIGluZmluaXRlIGxpbmVhcn0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXItY3VzdG9tey13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIGluZmluaXRlIGxpbmVhcjthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gaW5maW5pdGUgbGluZWFyfUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXl7MCUsODAlLDEwMCV7b3BhY2l0eTowfTQwJXtvcGFjaXR5OjF9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5ezAlLDgwJSwxMDAle29wYWNpdHk6MH00MCV7b3BhY2l0eToxfX1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbntmcm9te29wYWNpdHk6MH10b3tvcGFjaXR5OjF9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbntmcm9te29wYWNpdHk6MH10b3tvcGFjaXR5OjF9fUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbntmcm9tey13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgwZGVnKX10b3std2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbntmcm9te3RyYW5zZm9ybTpyb3RhdGUoMGRlZyl9dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX0gIC8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXdvSkluWmxjbk5wYjI0aU9pQXpMQW9KSW1acGJHVWlPaUFpYkdsbmFIUmliM2d1YzJOemN5SXNDZ2tpYzI5MWNtTmxjeUk2SUZzS0NRa2liR2xuYUhSaWIzZ3VjMk56Y3lJS0NWMHNDZ2tpYzI5MWNtTmxjME52Ym5SbGJuUWlPaUJiQ2drSklpUnNhV2RvZEdKdmVDMXdjbVZtYVhnNklDZDRjR0Y1YzNSaGRHbHZiaTEzYVdSblpYUXRiR2xuYUhSaWIzZ25PMXh5WEc0a2JHbG5hSFJpYjNndFkyeGhjM002SUNjdUp5QXJJQ1JzYVdkb2RHSnZlQzF3Y21WbWFYZzdYSEpjYmx4eVhHNGpleVJzYVdkb2RHSnZlQzFqYkdGemMzMGdlMXh5WEc0Z0lIQnZjMmwwYVc5dU9pQm1hWGhsWkR0Y2NseHVJQ0IwYjNBNklEQTdYSEpjYmlBZ2JHVm1kRG9nTUR0Y2NseHVJQ0JpYjNSMGIyMDZJREE3WEhKY2JpQWdjbWxuYUhRNklEQTdYSEpjYmlBZ2QybGtkR2c2SURFd01DVTdYSEpjYmlBZ2FHVnBaMmgwT2lBeE1EQWxPMXh5WEc0Z0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dU9pQWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMV1poWkdWcGJpQXVNVFZ6TzF4eVhHNGdJR0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxbVlXUmxhVzRnTGpFMWN6dGNjbHh1ZlZ4eVhHNWNjbHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFc5MlpYSnNZWGtnZTF4eVhHNGdJSEJ2YzJsMGFXOXVPaUJoWW5OdmJIVjBaVHRjY2x4dUlDQjBiM0E2TUR0Y2NseHVJQ0JzWldaME9pQXdPMXh5WEc0Z0lHSnZkSFJ2YlRvZ01EdGNjbHh1SUNCeWFXZG9kRG9nTUR0Y2NseHVJQ0I2TFdsdVpHVjRPaUF4TzF4eVhHNTlYSEpjYmx4eVhHNGpleVJzYVdkb2RHSnZlQzFqYkdGemMzMHRZMjl1ZEdWdWRDQjdYSEpjYmlBZ2NHOXphWFJwYjI0NklISmxiR0YwYVhabE8xeHlYRzRnSUhSdmNEb2dNRHRjY2x4dUlDQnNaV1owT2lBd08xeHlYRzRnSUhvdGFXNWtaWGc2SURNN1hISmNibjFjY2x4dVhISmNiaU43Skd4cFoyaDBZbTk0TFdOc1lYTnpmUzFqYjI1MFpXNTBYMTlvYVdSa1pXNGdlMXh5WEc0Z0lIWnBjMmxpYVd4cGRIazZJR2hwWkdSbGJqdGNjbHh1SUNCNkxXbHVaR1Y0T2lBdE1UdGNjbHh1ZlZ4eVhHNWNjbHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFdOdmJuUmxiblF0YVdaeVlXMWxJSHRjY2x4dUlDQjNhV1IwYURvZ01UQXdKVHRjY2x4dUlDQm9aV2xuYUhRNklERXdNQ1U3WEhKY2JpQWdZbTl5WkdWeU9pQXdPMXh5WEc0Z0lHSmhZMnRuY205MWJtUTZJSFJ5WVc1emNHRnlaVzUwTzF4eVhHNTlYSEpjYmx4eVhHNGpleVJzYVdkb2RHSnZlQzFqYkdGemMzMHRjM0JwYm01bGNpQjdYSEpjYmlBZ2NHOXphWFJwYjI0NklHRmljMjlzZFhSbE8xeHlYRzRnSUhSdmNEb2dOVEFsTzF4eVhHNGdJR3hsWm5RNklEVXdKVHRjY2x4dUlDQmthWE53YkdGNU9pQnViMjVsTzF4eVhHNGdJSG90YVc1a1pYZzZJREk3WEhKY2JpQWdjRzlwYm5SbGNpMWxkbVZ1ZEhNNklHNXZibVU3WEhKY2JseHlYRzRnSUM1emNHbHVibVZ5TFhoemIyeHNZU0I3WEhKY2JpQWdJQ0IzYVdSMGFEb2dOVFp3ZUR0Y2NseHVJQ0FnSUdobGFXZG9kRG9nTlRWd2VEdGNjbHh1SUNBZ0lHMWhjbWRwYmpvZ2UxeHlYRzRnSUNBZ0lDQjBiM0E2SUMweU9IQjRPMXh5WEc0Z0lDQWdJQ0JzWldaME9pQXRNalp3ZUR0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGVDd2dMbk53YVc1dVpYSXRlSE52Ykd4aExYTXNJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMXZMQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRiQ3dnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMV0VnZTF4eVhHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMWliM1Z1WTJWa1pXeGhlU0F4Y3lCcGJtWnBibWwwWlNCbFlYTmxMV2x1TFc5MWREdGNjbHh1SUNBZ0lDQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNHRabWxzYkMxdGIyUmxPaUJpYjNSb08xeHlYRzRnSUNBZ0lDQmhibWx0WVhScGIyNDZJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0WW05MWJtTmxaR1ZzWVhrZ01YTWdhVzVtYVc1cGRHVWdaV0Z6WlMxcGJpMXZkWFE3WEhKY2JpQWdJQ0FnSUdGdWFXMWhkR2x2YmkxbWFXeHNMVzF2WkdVNklHSnZkR2c3WEhKY2JpQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0xuTndhVzV1WlhJdGVITnZiR3hoTFhnZ2UxeHlYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ01ITTdYSEpjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dNSE03WEhKY2JpQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0xuTndhVzV1WlhJdGVITnZiR3hoTFhNZ2UxeHlYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqSnpPMXh5WEc0Z0lDQWdJQ0JoYm1sdFlYUnBiMjR0WkdWc1lYazZJQzR5Y3p0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGJ5QjdYSEpjYmlBZ0lDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVOSE03WEhKY2JpQWdJQ0FnSUdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTGpSek8xeHlYRzRnSUNBZ2ZWeHlYRzVjY2x4dUlDQWdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMXNJSHRjY2x4dUlDQWdJQ0FnTFhkbFltdHBkQzFoYm1sdFlYUnBiMjR0WkdWc1lYazZJQzQyY3p0Y2NseHVJQ0FnSUNBZ1lXNXBiV0YwYVc5dUxXUmxiR0Y1T2lBdU5uTTdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMV0VnZTF4eVhHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTGpoek8xeHlYRzRnSUNBZ0lDQmhibWx0WVhScGIyNHRaR1ZzWVhrNklDNDRjenRjY2x4dUlDQWdJSDFjY2x4dUlDQjlYSEpjYmx4eVhHNGdJQzV6Y0dsdWJtVnlMWEp2ZFc1a0lIdGNjbHh1SUNBZ0lHMWhjbWRwYmpvZ2UxeHlYRzRnSUNBZ0lDQjBiM0E2SUMweU0zQjRPMXh5WEc0Z0lDQWdJQ0JzWldaME9pQXRNak53ZUR0Y2NseHVJQ0FnSUgxY2NseHVJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnTTNNZ2FXNW1hVzVwZEdVZ2JHbHVaV0Z5TzF4eVhHNGdJQ0FnWVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnTTNNZ2FXNW1hVzVwZEdVZ2JHbHVaV0Z5TzF4eVhHNGdJSDFjY2x4dVhISmNiaUFnTG5Od2FXNXVaWEl0WTNWemRHOXRJSHRjY2x4dUlDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVPaUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFhOd2FXNGdhVzVtYVc1cGRHVWdiR2x1WldGeU8xeHlYRzRnSUNBZ1lXNXBiV0YwYVc5dU9pQWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z2FXNW1hVzVwZEdVZ2JHbHVaV0Z5TzF4eVhHNGdJSDFjY2x4dWZWeHlYRzVjY2x4dVFDMTNaV0pyYVhRdGEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRZbTkxYm1ObFpHVnNZWGtnZTF4eVhHNGdJREFsTENBNE1DVXNJREV3TUNVZ2V5QnZjR0ZqYVhSNU9pQXdPeUI5WEhKY2JpQWdOREFsSUhzZ2IzQmhZMmwwZVRvZ01TQjlYSEpjYm4xY2NseHVYSEpjYmtCclpYbG1jbUZ0WlhNZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMWliM1Z1WTJWa1pXeGhlU0I3WEhKY2JpQWdNQ1VzSURnd0pTd2dNVEF3SlNCN0lHOXdZV05wZEhrNklEQTdJSDFjY2x4dUlDQTBNQ1VnZXlCdmNHRmphWFI1T2lBeE95QjlYSEpjYm4xY2NseHVYSEpjYmtBdGQyVmlhMmwwTFd0bGVXWnlZVzFsY3lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxXWmhaR1ZwYmlCN1hISmNiaUFnWm5KdmJTQjdJRzl3WVdOcGRIazZJREE3SUgxY2NseHVJQ0IwYnlCN0lHOXdZV05wZEhrNklERTdJSDFjY2x4dWZWeHlYRzVjY2x4dVFHdGxlV1p5WVcxbGN5QWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMV1poWkdWcGJpQjdYSEpjYmlBZ1puSnZiU0I3SUc5d1lXTnBkSGs2SURBN0lIMWNjbHh1SUNCMGJ5QjdJRzl3WVdOcGRIazZJREU3SUgxY2NseHVmVnh5WEc1Y2NseHVRQzEzWldKcmFYUXRhMlY1Wm5KaGJXVnpJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0YzNCcGJpQjdYSEpjYmlBZ1puSnZiU0I3SUMxM1pXSnJhWFF0ZEhKaGJuTm1iM0p0T2lCeWIzUmhkR1VvTUdSbFp5azdJSDFjY2x4dUlDQjBieUI3SUMxM1pXSnJhWFF0ZEhKaGJuTm1iM0p0T2lCeWIzUmhkR1VvTXpZd1pHVm5LVHNnZlZ4eVhHNTlYSEpjYmx4eVhHNUFhMlY1Wm5KaGJXVnpJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0YzNCcGJpQjdYSEpjYmlBZ1puSnZiU0I3SUhSeVlXNXpabTl5YlRvZ2NtOTBZWFJsS0RCa1pXY3BPeUI5WEhKY2JpQWdkRzhnZXlCMGNtRnVjMlp2Y20wNklISnZkR0YwWlNnek5qQmtaV2NwT3lCOVhISmNibjFjY2x4dUlnb0pYU3dLQ1NKdFlYQndhVzVuY3lJNklDSkJRVWRCTEVGQlFVRXNORUpCUVRSQ0xFRkJRVFZDTEVOQlEwVXNVVUZCVVN4RFFVRkZMRXRCUVUwc1EwRkRhRUlzUjBGQlJ5eERRVUZGTEVOQlFVVXNRMEZEVUN4SlFVRkpMRU5CUVVVc1EwRkJSU3hEUVVOU0xFMUJRVTBzUTBGQlJTeERRVUZGTEVOQlExWXNTMEZCU3l4RFFVRkZMRU5CUVVVc1EwRkRWQ3hMUVVGTExFTkJRVVVzU1VGQlN5eERRVU5hTEUxQlFVMHNRMEZCUlN4SlFVRkxMRU5CUTJJc2FVSkJRV2xDTEVOQlFVVXNhME5CUVRCQ0xFTkJRVkVzUzBGQlNTeERRVU42UkN4VFFVRlRMRU5CUVVVc2EwTkJRVEJDTEVOQlFWRXNTMEZCU1N4RFFVTnNSQ3hCUVVWRUxFRkJRVUVzYjBOQlFXOURMRUZCUVhCRExFTkJRMFVzVVVGQlVTeERRVUZGTEZGQlFWTXNRMEZEYmtJc1IwRkJSeXhEUVVGRExFTkJRVVVzUTBGRFRpeEpRVUZKTEVOQlFVVXNRMEZCUlN4RFFVTlNMRTFCUVUwc1EwRkJSU3hEUVVGRkxFTkJRMVlzUzBGQlN5eERRVUZGTEVOQlFVVXNRMEZEVkN4UFFVRlBMRU5CUVVVc1EwRkJSU3hEUVVOYUxFRkJSVVFzUVVGQlFTeHZRMEZCYjBNc1FVRkJjRU1zUTBGRFJTeFJRVUZSTEVOQlFVVXNVVUZCVXl4RFFVTnVRaXhIUVVGSExFTkJRVVVzUTBGQlJTeERRVU5RTEVsQlFVa3NRMEZCUlN4RFFVRkZMRU5CUTFJc1QwRkJUeXhEUVVGRkxFTkJRVVVzUTBGRFdpeEJRVVZFTEVGQlFVRXNORU5CUVRSRExFRkJRVFZETEVOQlEwVXNWVUZCVlN4RFFVRkZMRTFCUVU4c1EwRkRia0lzVDBGQlR5eERRVUZGTEVWQlFVY3NRMEZEWWl4QlFVVkVMRUZCUVVFc01rTkJRVEpETEVGQlFUTkRMRU5CUTBVc1MwRkJTeXhEUVVGRkxFbEJRVXNzUTBGRFdpeE5RVUZOTEVOQlFVVXNTVUZCU3l4RFFVTmlMRTFCUVUwc1EwRkJSU3hEUVVGRkxFTkJRMVlzVlVGQlZTeERRVUZGTEZkQlFWa3NRMEZEZWtJc1FVRkZSQ3hCUVVGQkxHOURRVUZ2UXl4QlFVRndReXhEUVVORkxGRkJRVkVzUTBGQlJTeFJRVUZUTEVOQlEyNUNMRWRCUVVjc1EwRkJSU3hIUVVGSkxFTkJRMVFzU1VGQlNTeERRVUZGTEVkQlFVa3NRMEZEVml4UFFVRlBMRU5CUVVVc1NVRkJTeXhEUVVOa0xFOUJRVThzUTBGQlJTeERRVUZGTEVOQlExZ3NZMEZCWXl4RFFVRkZMRWxCUVVzc1EwRjNSSFJDTEVGQk9VUkVMRUZCVVVVc2IwTkJVbXRETEVOQlVXeERMR1ZCUVdVc1FVRkJReXhEUVVOa0xFdEJRVXNzUTBGQlJTeEpRVUZMTEVOQlExb3NUVUZCVFN4RFFVRkZMRWxCUVVzc1EwRkRZaXhOUVVGTkxFRkJRVU1zUTBGQlF5eEJRVU5PTEVkQlFVY3NRMEZCUlN4TFFVRk5MRU5CUkdJc1RVRkJUU3hCUVVGRExFTkJRVU1zUVVGRlRpeEpRVUZKTEVOQlFVVXNTMEZCVFN4RFFXdERaaXhCUVM5RFNDeEJRV2RDU1N4dlEwRm9RbWRETEVOQlVXeERMR1ZCUVdVc1EwRlJZaXhwUWtGQmFVSXNRMEZvUW5KQ0xFRkJaMEoxUWl4dlEwRm9RbUVzUTBGUmJFTXNaVUZCWlN4RFFWRk5MR2xDUVVGcFFpeERRV2hDZUVNc1FVRm5RakJETEc5RFFXaENUaXhEUVZGc1F5eGxRVUZsTEVOQlVYbENMR2xDUVVGcFFpeERRV2hDTTBRc1FVRm5RalpFTEc5RFFXaENla0lzUTBGUmJFTXNaVUZCWlN4RFFWRTBReXhwUWtGQmFVSXNRMEZvUWpsRkxFRkJaMEpuUml4dlEwRm9RalZETEVOQlVXeERMR1ZCUVdVc1EwRlJLMFFzYVVKQlFXbENMRUZCUVVNc1EwRkROVVlzYVVKQlFXbENMRU5CUVVVc2RVTkJRU3RDTEVOQlFXRXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhYUVVGWExFTkJRM1JHTERKQ1FVRXlRaXhEUVVGRkxFbEJRVXNzUTBGRGJFTXNVMEZCVXl4RFFVRkZMSFZEUVVFclFpeERRVUZoTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVNNVJTeHRRa0ZCYlVJc1EwRkJSU3hKUVVGTExFTkJRek5DTEVGQmNrSk1MRUZCZFVKSkxHOURRWFpDWjBNc1EwRlJiRU1zWlVGQlpTeERRV1ZpTEdsQ1FVRnBRaXhCUVVGRExFTkJRMmhDTEhWQ1FVRjFRaXhEUVVGRkxFVkJRVWNzUTBGRE5VSXNaVUZCWlN4RFFVRkZMRVZCUVVjc1EwRkRja0lzUVVFeFFrd3NRVUUwUWtrc2IwTkJOVUpuUXl4RFFWRnNReXhsUVVGbExFTkJiMEppTEdsQ1FVRnBRaXhCUVVGRExFTkJRMmhDTEhWQ1FVRjFRaXhEUVVGRkxFZEJRVWtzUTBGRE4wSXNaVUZCWlN4RFFVRkZMRWRCUVVrc1EwRkRkRUlzUVVFdlFrd3NRVUZwUTBrc2IwTkJha05uUXl4RFFWRnNReXhsUVVGbExFTkJlVUppTEdsQ1FVRnBRaXhCUVVGRExFTkJRMmhDTEhWQ1FVRjFRaXhEUVVGRkxFZEJRVWtzUTBGRE4wSXNaVUZCWlN4RFFVRkZMRWRCUVVrc1EwRkRkRUlzUVVGd1Ewd3NRVUZ6UTBrc2IwTkJkRU5uUXl4RFFWRnNReXhsUVVGbExFTkJPRUppTEdsQ1FVRnBRaXhCUVVGRExFTkJRMmhDTEhWQ1FVRjFRaXhEUVVGRkxFZEJRVWtzUTBGRE4wSXNaVUZCWlN4RFFVRkZMRWRCUVVrc1EwRkRkRUlzUVVGNlEwd3NRVUV5UTBrc2IwTkJNME5uUXl4RFFWRnNReXhsUVVGbExFTkJiVU5pTEdsQ1FVRnBRaXhCUVVGRExFTkJRMmhDTEhWQ1FVRjFRaXhEUVVGRkxFZEJRVWtzUTBGRE4wSXNaVUZCWlN4RFFVRkZMRWRCUVVrc1EwRkRkRUlzUVVFNVEwd3NRVUZwUkVVc2IwTkJha1JyUXl4RFFXbEViRU1zWTBGQll5eEJRVUZETEVOQlEySXNUVUZCVFN4QlFVRkRMRU5CUVVNc1FVRkRUaXhIUVVGSExFTkJRVVVzUzBGQlRTeERRVVJpTEUxQlFVMHNRVUZCUXl4RFFVRkRMRUZCUlU0c1NVRkJTU3hEUVVGRkxFdEJRVTBzUTBGRlpDeHBRa0ZCYVVJc1EwRkJSU3huUTBGQmQwSXNRMEZCVFN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGRGJrVXNVMEZCVXl4RFFVRkZMR2REUVVGM1FpeERRVUZOTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVNMVJDeEJRWGhFU0N4QlFUQkVSU3h2UTBFeFJHdERMRU5CTUVSc1F5eGxRVUZsTEVGQlFVTXNRMEZEWkN4cFFrRkJhVUlzUTBGQlJTeG5RMEZCZDBJc1EwRkJUU3hSUVVGUkxFTkJRVU1zVFVGQlRTeERRVU5vUlN4VFFVRlRMRU5CUVVVc1owTkJRWGRDTEVOQlFVMHNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkRla1FzUVVGSFNDeHJRa0ZCYTBJc1EwRkJiRUlzZFVOQlFXdENMRU5CUTJoQ0xFRkJRVUVzUlVGQlJTeERRVUZGTEVGQlFVRXNSMEZCUnl4RFFVRkZMRUZCUVVFc1NVRkJTU3hEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVOQlF6TkNMRUZCUVVFc1IwRkJSeXhEUVVGSExFOUJRVThzUTBGQlJTeERRVUZITEVWQlIzQkNMRlZCUVZVc1EwRkJWaXgxUTBGQlZTeERRVU5TTEVGQlFVRXNSVUZCUlN4RFFVRkZMRUZCUVVFc1IwRkJSeXhEUVVGRkxFRkJRVUVzU1VGQlNTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUXpOQ0xFRkJRVUVzUjBGQlJ5eERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRVZCUjI1Q0xHdENRVUZyUWl4RFFVRnNRaXhyUTBGQmEwSXNRMEZEYUVJc1FVRkJRU3hKUVVGSkxFTkJRVWNzVDBGQlR5eERRVUZGTEVOQlFVVXNRMEZEYkVJc1FVRkJRU3hGUVVGRkxFTkJRVWNzVDBGQlR5eERRVUZGTEVOQlFVVXNSVUZIYkVJc1ZVRkJWU3hEUVVGV0xHdERRVUZWTEVOQlExSXNRVUZCUVN4SlFVRkpMRU5CUVVjc1QwRkJUeXhEUVVGRkxFTkJRVVVzUTBGRGJFSXNRVUZCUVN4RlFVRkZMRU5CUVVjc1QwRkJUeXhEUVVGRkxFTkJRVVVzUlVGSGJFSXNhMEpCUVd0Q0xFTkJRV3hDTEdkRFFVRnJRaXhEUVVOb1FpeEJRVUZCTEVsQlFVa3NRMEZCUnl4cFFrRkJhVUlzUTBGQlJTeFpRVUZOTEVOQlEyaERMRUZCUVVFc1JVRkJSU3hEUVVGSExHbENRVUZwUWl4RFFVRkZMR05CUVUwc1JVRkhhRU1zVlVGQlZTeERRVUZXTEdkRFFVRlZMRU5CUTFJc1FVRkJRU3hKUVVGSkxFTkJRVWNzVTBGQlV5eERRVUZGTEZsQlFVMHNRMEZEZUVJc1FVRkJRU3hGUVVGRkxFTkJRVWNzVTBGQlV5eERRVUZGTEdOQlFVMGlMQW9KSW01aGJXVnpJam9nVzEwS2ZRPT0gKi8nKTs7IiwibW9kdWxlLmV4cG9ydHMgPSAnMS4yLjEwJztcclxuIiwiLyohXG4gKiBCb3dzZXIgLSBhIGJyb3dzZXIgZGV0ZWN0b3JcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm93c2VyXG4gKiBNSVQgTGljZW5zZSB8IChjKSBEdXN0aW4gRGlheiAyMDE1XG4gKi9cblxuIWZ1bmN0aW9uIChyb290LCBuYW1lLCBkZWZpbml0aW9uKSB7XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKG5hbWUsIGRlZmluaXRpb24pXG4gIGVsc2Ugcm9vdFtuYW1lXSA9IGRlZmluaXRpb24oKVxufSh0aGlzLCAnYm93c2VyJywgZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICAqIFNlZSB1c2VyYWdlbnRzLmpzIGZvciBleGFtcGxlcyBvZiBuYXZpZ2F0b3IudXNlckFnZW50XG4gICAgKi9cblxuICB2YXIgdCA9IHRydWVcblxuICBmdW5jdGlvbiBkZXRlY3QodWEpIHtcblxuICAgIGZ1bmN0aW9uIGdldEZpcnN0TWF0Y2gocmVnZXgpIHtcbiAgICAgIHZhciBtYXRjaCA9IHVhLm1hdGNoKHJlZ2V4KTtcbiAgICAgIHJldHVybiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaFsxXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2Vjb25kTWF0Y2gocmVnZXgpIHtcbiAgICAgIHZhciBtYXRjaCA9IHVhLm1hdGNoKHJlZ2V4KTtcbiAgICAgIHJldHVybiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaFsyXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgdmFyIGlvc2RldmljZSA9IGdldEZpcnN0TWF0Y2goLyhpcG9kfGlwaG9uZXxpcGFkKS9pKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIGxpa2VBbmRyb2lkID0gL2xpa2UgYW5kcm9pZC9pLnRlc3QodWEpXG4gICAgICAsIGFuZHJvaWQgPSAhbGlrZUFuZHJvaWQgJiYgL2FuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBuZXh1c01vYmlsZSA9IC9uZXh1c1xccypbMC02XVxccyovaS50ZXN0KHVhKVxuICAgICAgLCBuZXh1c1RhYmxldCA9ICFuZXh1c01vYmlsZSAmJiAvbmV4dXNcXHMqWzAtOV0rL2kudGVzdCh1YSlcbiAgICAgICwgY2hyb21lb3MgPSAvQ3JPUy8udGVzdCh1YSlcbiAgICAgICwgc2lsayA9IC9zaWxrL2kudGVzdCh1YSlcbiAgICAgICwgc2FpbGZpc2ggPSAvc2FpbGZpc2gvaS50ZXN0KHVhKVxuICAgICAgLCB0aXplbiA9IC90aXplbi9pLnRlc3QodWEpXG4gICAgICAsIHdlYm9zID0gLyh3ZWJ8aHB3KShvfDApcy9pLnRlc3QodWEpXG4gICAgICAsIHdpbmRvd3NwaG9uZSA9IC93aW5kb3dzIHBob25lL2kudGVzdCh1YSlcbiAgICAgICwgc2Ftc3VuZ0Jyb3dzZXIgPSAvU2Ftc3VuZ0Jyb3dzZXIvaS50ZXN0KHVhKVxuICAgICAgLCB3aW5kb3dzID0gIXdpbmRvd3NwaG9uZSAmJiAvd2luZG93cy9pLnRlc3QodWEpXG4gICAgICAsIG1hYyA9ICFpb3NkZXZpY2UgJiYgIXNpbGsgJiYgL21hY2ludG9zaC9pLnRlc3QodWEpXG4gICAgICAsIGxpbnV4ID0gIWFuZHJvaWQgJiYgIXNhaWxmaXNoICYmICF0aXplbiAmJiAhd2Vib3MgJiYgL2xpbnV4L2kudGVzdCh1YSlcbiAgICAgICwgZWRnZVZlcnNpb24gPSBnZXRTZWNvbmRNYXRjaCgvZWRnKFtlYV18aW9zKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgICwgdmVyc2lvbklkZW50aWZpZXIgPSBnZXRGaXJzdE1hdGNoKC92ZXJzaW9uXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB0YWJsZXQgPSAvdGFibGV0L2kudGVzdCh1YSkgJiYgIS90YWJsZXQgcGMvaS50ZXN0KHVhKVxuICAgICAgLCBtb2JpbGUgPSAhdGFibGV0ICYmIC9bXi1dbW9iaS9pLnRlc3QodWEpXG4gICAgICAsIHhib3ggPSAveGJveC9pLnRlc3QodWEpXG4gICAgICAsIHJlc3VsdFxuXG4gICAgaWYgKC9vcGVyYS9pLnRlc3QodWEpKSB7XG4gICAgICAvLyAgYW4gb2xkIE9wZXJhXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSdcbiAgICAgICwgb3BlcmE6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86b3BlcmF8b3ByfG9waW9zKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoL29wclxcL3xvcGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICAvLyBhIG5ldyBPcGVyYVxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEnXG4gICAgICAgICwgb3BlcmE6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpvcHJ8b3Bpb3MpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9TYW1zdW5nQnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYW1zdW5nIEludGVybmV0IGZvciBBbmRyb2lkJ1xuICAgICAgICAsIHNhbXN1bmdCcm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86U2Ftc3VuZ0Jyb3dzZXIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9XaGFsZS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdOQVZFUiBXaGFsZSBicm93c2VyJ1xuICAgICAgICAsIHdoYWxlOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86d2hhbGUpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL01aQnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNWiBCcm93c2VyJ1xuICAgICAgICAsIG16YnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Ok1aQnJvd3NlcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY29hc3QvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEgQ29hc3QnXG4gICAgICAgICwgY29hc3Q6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpjb2FzdClbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZvY3VzL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZvY3VzJ1xuICAgICAgICAsIGZvY3VzOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Zm9jdXMpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3lhYnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdZYW5kZXggQnJvd3NlcidcbiAgICAgICwgeWFuZGV4YnJvd3NlcjogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzp5YWJyb3dzZXIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC91Y2Jyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgIG5hbWU6ICdVQyBCcm93c2VyJ1xuICAgICAgICAsIHVjYnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnVjYnJvd3NlcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXhpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTWF4dGhvbidcbiAgICAgICAgLCBtYXh0aG9uOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86bXhpb3MpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2VwaXBoYW55L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0VwaXBoYW55J1xuICAgICAgICAsIGVwaXBoYW55OiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZXBpcGhhbnkpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3B1ZmZpbi9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdQdWZmaW4nXG4gICAgICAgICwgcHVmZmluOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86cHVmZmluKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zbGVpcG5pci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTbGVpcG5pcidcbiAgICAgICAgLCBzbGVpcG5pcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnNsZWlwbmlyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9rLW1lbGVvbi9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdLLU1lbGVvbidcbiAgICAgICAgLCBrTWVsZW9uOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ay1tZWxlb24pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAod2luZG93c3Bob25lKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXaW5kb3dzIFBob25lJ1xuICAgICAgLCBvc25hbWU6ICdXaW5kb3dzIFBob25lJ1xuICAgICAgLCB3aW5kb3dzcGhvbmU6IHRcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlVmVyc2lvbikge1xuICAgICAgICByZXN1bHQubXNlZGdlID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0Lm1zaWUgPSB0XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvaWVtb2JpbGVcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9tc2llfHRyaWRlbnQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnSW50ZXJuZXQgRXhwbG9yZXInXG4gICAgICAsIG1zaWU6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86bXNpZSB8cnY6KShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNocm9tZW9zKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIG9zbmFtZTogJ0Nocm9tZSBPUydcbiAgICAgICwgY2hyb21lb3M6IHRcbiAgICAgICwgY2hyb21lQm9vazogdFxuICAgICAgLCBjaHJvbWU6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21lfGNyaW9zfGNybW8pXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoL2VkZyhbZWFdfGlvcykvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTWljcm9zb2Z0IEVkZ2UnXG4gICAgICAsIG1zZWRnZTogdFxuICAgICAgLCB2ZXJzaW9uOiBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvdml2YWxkaS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdWaXZhbGRpJ1xuICAgICAgICAsIHZpdmFsZGk6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC92aXZhbGRpXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzYWlsZmlzaCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2FpbGZpc2gnXG4gICAgICAsIG9zbmFtZTogJ1NhaWxmaXNoIE9TJ1xuICAgICAgLCBzYWlsZmlzaDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zYWlsZmlzaFxccz9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2VhbW9ua2V5XFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NlYU1vbmtleSdcbiAgICAgICwgc2VhbW9ua2V5OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NlYW1vbmtleVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZpcmVmb3h8aWNld2Vhc2VsfGZ4aW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZpcmVmb3gnXG4gICAgICAsIGZpcmVmb3g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZmlyZWZveHxpY2V3ZWFzZWx8Znhpb3MpWyBcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgICAgaWYgKC9cXCgobW9iaWxlfHRhYmxldCk7W15cXCldKnJ2OltcXGRcXC5dK1xcKS9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5maXJlZm94b3MgPSB0XG4gICAgICAgIHJlc3VsdC5vc25hbWUgPSAnRmlyZWZveCBPUydcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2lsaykge1xuICAgICAgcmVzdWx0ID0gIHtcbiAgICAgICAgbmFtZTogJ0FtYXpvbiBTaWxrJ1xuICAgICAgLCBzaWxrOiB0XG4gICAgICAsIHZlcnNpb24gOiBnZXRGaXJzdE1hdGNoKC9zaWxrXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvcGhhbnRvbS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdQaGFudG9tSlMnXG4gICAgICAsIHBoYW50b206IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvcGhhbnRvbWpzXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2xpbWVyanMvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2xpbWVySlMnXG4gICAgICAgICwgc2xpbWVyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2xpbWVyanNcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9ibGFja2JlcnJ5fFxcYmJiXFxkKy9pLnRlc3QodWEpIHx8IC9yaW1cXHN0YWJsZXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQmxhY2tCZXJyeSdcbiAgICAgICwgb3NuYW1lOiAnQmxhY2tCZXJyeSBPUydcbiAgICAgICwgYmxhY2tiZXJyeTogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC9ibGFja2JlcnJ5W1xcZF0rXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh3ZWJvcykge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2ViT1MnXG4gICAgICAsIG9zbmFtZTogJ1dlYk9TJ1xuICAgICAgLCB3ZWJvczogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC93KD86ZWIpP29zYnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH07XG4gICAgICAvdG91Y2hwYWRcXC8vaS50ZXN0KHVhKSAmJiAocmVzdWx0LnRvdWNocGFkID0gdClcbiAgICB9XG4gICAgZWxzZSBpZiAoL2JhZGEvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQmFkYSdcbiAgICAgICwgb3NuYW1lOiAnQmFkYSdcbiAgICAgICwgYmFkYTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9kb2xmaW5cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aXplbikge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnVGl6ZW4nXG4gICAgICAsIG9zbmFtZTogJ1RpemVuJ1xuICAgICAgLCB0aXplbjogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp0aXplblxccz8pP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICgvcXVwemlsbGEvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUXVwWmlsbGEnXG4gICAgICAgICwgcXVwemlsbGE6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpxdXB6aWxsYSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY2hyb21pdW0vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21pdW0nXG4gICAgICAgICwgY2hyb21pdW06IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWl1bSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY2hyb21lfGNyaW9zfGNybW8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21lJ1xuICAgICAgICAsIGNocm9tZTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9tZXxjcmlvc3xjcm1vKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQW5kcm9pZCdcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2FmYXJpfGFwcGxld2Via2l0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhZmFyaSdcbiAgICAgICwgc2FmYXJpOiB0XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZSA6IGlvc2RldmljZSA9PSAnaXBob25lJyA/ICdpUGhvbmUnIDogaW9zZGV2aWNlID09ICdpcGFkJyA/ICdpUGFkJyA6ICdpUG9kJ1xuICAgICAgfVxuICAgICAgLy8gV1RGOiB2ZXJzaW9uIGlzIG5vdCBwYXJ0IG9mIHVzZXIgYWdlbnQgaW4gd2ViIGFwcHNcbiAgICAgIGlmICh2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYoL2dvb2dsZWJvdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdHb29nbGVib3QnXG4gICAgICAsIGdvb2dsZWJvdDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9nb29nbGVib3RcXC8oXFxkKyhcXC5cXGQrKSkvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6IGdldEZpcnN0TWF0Y2goL14oLiopXFwvKC4qKSAvKSxcbiAgICAgICAgdmVyc2lvbjogZ2V0U2Vjb25kTWF0Y2goL14oLiopXFwvKC4qKSAvKVxuICAgICB9O1xuICAgfVxuXG4gICAgLy8gc2V0IHdlYmtpdCBvciBnZWNrbyBmbGFnIGZvciBicm93c2VycyBiYXNlZCBvbiB0aGVzZSBlbmdpbmVzXG4gICAgaWYgKCFyZXN1bHQubXNlZGdlICYmIC8oYXBwbGUpP3dlYmtpdC9pLnRlc3QodWEpKSB7XG4gICAgICBpZiAoLyhhcHBsZSk/d2Via2l0XFwvNTM3XFwuMzYvaS50ZXN0KHVhKSkge1xuICAgICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiQmxpbmtcIlxuICAgICAgICByZXN1bHQuYmxpbmsgPSB0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiV2Via2l0XCJcbiAgICAgICAgcmVzdWx0LndlYmtpdCA9IHRcbiAgICAgIH1cbiAgICAgIGlmICghcmVzdWx0LnZlcnNpb24gJiYgdmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXJlc3VsdC5vcGVyYSAmJiAvZ2Vja29cXC8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIkdlY2tvXCJcbiAgICAgIHJlc3VsdC5nZWNrbyA9IHRcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gcmVzdWx0LnZlcnNpb24gfHwgZ2V0Rmlyc3RNYXRjaCgvZ2Vja29cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgfVxuXG4gICAgLy8gc2V0IE9TIGZsYWdzIGZvciBwbGF0Zm9ybXMgdGhhdCBoYXZlIG11bHRpcGxlIGJyb3dzZXJzXG4gICAgaWYgKCFyZXN1bHQud2luZG93c3Bob25lICYmIChhbmRyb2lkIHx8IHJlc3VsdC5zaWxrKSkge1xuICAgICAgcmVzdWx0LmFuZHJvaWQgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ0FuZHJvaWQnXG4gICAgfSBlbHNlIGlmICghcmVzdWx0LndpbmRvd3NwaG9uZSAmJiBpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdFtpb3NkZXZpY2VdID0gdFxuICAgICAgcmVzdWx0LmlvcyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnaU9TJ1xuICAgIH0gZWxzZSBpZiAobWFjKSB7XG4gICAgICByZXN1bHQubWFjID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdtYWNPUydcbiAgICB9IGVsc2UgaWYgKHhib3gpIHtcbiAgICAgIHJlc3VsdC54Ym94ID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdYYm94J1xuICAgIH0gZWxzZSBpZiAod2luZG93cykge1xuICAgICAgcmVzdWx0LndpbmRvd3MgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ1dpbmRvd3MnXG4gICAgfSBlbHNlIGlmIChsaW51eCkge1xuICAgICAgcmVzdWx0LmxpbnV4ID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdMaW51eCdcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXaW5kb3dzVmVyc2lvbiAocykge1xuICAgICAgc3dpdGNoIChzKSB7XG4gICAgICAgIGNhc2UgJ05UJzogcmV0dXJuICdOVCdcbiAgICAgICAgY2FzZSAnWFAnOiByZXR1cm4gJ1hQJ1xuICAgICAgICBjYXNlICdOVCA1LjAnOiByZXR1cm4gJzIwMDAnXG4gICAgICAgIGNhc2UgJ05UIDUuMSc6IHJldHVybiAnWFAnXG4gICAgICAgIGNhc2UgJ05UIDUuMic6IHJldHVybiAnMjAwMydcbiAgICAgICAgY2FzZSAnTlQgNi4wJzogcmV0dXJuICdWaXN0YSdcbiAgICAgICAgY2FzZSAnTlQgNi4xJzogcmV0dXJuICc3J1xuICAgICAgICBjYXNlICdOVCA2LjInOiByZXR1cm4gJzgnXG4gICAgICAgIGNhc2UgJ05UIDYuMyc6IHJldHVybiAnOC4xJ1xuICAgICAgICBjYXNlICdOVCAxMC4wJzogcmV0dXJuICcxMCdcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9TIHZlcnNpb24gZXh0cmFjdGlvblxuICAgIHZhciBvc1ZlcnNpb24gPSAnJztcbiAgICBpZiAocmVzdWx0LndpbmRvd3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldFdpbmRvd3NWZXJzaW9uKGdldEZpcnN0TWF0Y2goL1dpbmRvd3MgKChOVHxYUCkoIFxcZFxcZD8uXFxkKT8pL2kpKVxuICAgIH0gZWxzZSBpZiAocmVzdWx0LndpbmRvd3NwaG9uZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvd2luZG93cyBwaG9uZSAoPzpvcyk/XFxzPyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQubWFjKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9NYWMgT1MgWCAoXFxkKyhbX1xcLlxcc11cXGQrKSopL2kpO1xuICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL1tfXFxzXS9nLCAnLicpO1xuICAgIH0gZWxzZSBpZiAoaW9zZGV2aWNlKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9vcyAoXFxkKyhbX1xcc11cXGQrKSopIGxpa2UgbWFjIG9zIHgvaSk7XG4gICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb24ucmVwbGFjZSgvW19cXHNdL2csICcuJyk7XG4gICAgfSBlbHNlIGlmIChhbmRyb2lkKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9hbmRyb2lkWyBcXC8tXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQud2Vib3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goLyg/OndlYnxocHcpb3NcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJsYWNrYmVycnkpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3JpbVxcc3RhYmxldFxcc29zXFxzKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5iYWRhKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9iYWRhXFwvKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC50aXplbikge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvdGl6ZW5bXFwvXFxzXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfVxuICAgIGlmIChvc1ZlcnNpb24pIHtcbiAgICAgIHJlc3VsdC5vc3ZlcnNpb24gPSBvc1ZlcnNpb247XG4gICAgfVxuXG4gICAgLy8gZGV2aWNlIHR5cGUgZXh0cmFjdGlvblxuICAgIHZhciBvc01ham9yVmVyc2lvbiA9ICFyZXN1bHQud2luZG93cyAmJiBvc1ZlcnNpb24uc3BsaXQoJy4nKVswXTtcbiAgICBpZiAoXG4gICAgICAgICB0YWJsZXRcbiAgICAgIHx8IG5leHVzVGFibGV0XG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwYWQnXG4gICAgICB8fCAoYW5kcm9pZCAmJiAob3NNYWpvclZlcnNpb24gPT0gMyB8fCAob3NNYWpvclZlcnNpb24gPj0gNCAmJiAhbW9iaWxlKSkpXG4gICAgICB8fCByZXN1bHQuc2lsa1xuICAgICkge1xuICAgICAgcmVzdWx0LnRhYmxldCA9IHRcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgbW9iaWxlXG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwaG9uZSdcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBvZCdcbiAgICAgIHx8IGFuZHJvaWRcbiAgICAgIHx8IG5leHVzTW9iaWxlXG4gICAgICB8fCByZXN1bHQuYmxhY2tiZXJyeVxuICAgICAgfHwgcmVzdWx0LndlYm9zXG4gICAgICB8fCByZXN1bHQuYmFkYVxuICAgICkge1xuICAgICAgcmVzdWx0Lm1vYmlsZSA9IHRcbiAgICB9XG5cbiAgICAvLyBHcmFkZWQgQnJvd3NlciBTdXBwb3J0XG4gICAgLy8gaHR0cDovL2RldmVsb3Blci55YWhvby5jb20veXVpL2FydGljbGVzL2dic1xuICAgIGlmIChyZXN1bHQubXNlZGdlIHx8XG4gICAgICAgIChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC55YW5kZXhicm93c2VyICYmIHJlc3VsdC52ZXJzaW9uID49IDE1KSB8fFxuXHRcdCAgICAocmVzdWx0LnZpdmFsZGkgJiYgcmVzdWx0LnZlcnNpb24gPj0gMS4wKSB8fFxuICAgICAgICAocmVzdWx0LmNocm9tZSAmJiByZXN1bHQudmVyc2lvbiA+PSAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYW1zdW5nQnJvd3NlciAmJiByZXN1bHQudmVyc2lvbiA+PSA0KSB8fFxuICAgICAgICAocmVzdWx0LndoYWxlICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICcxLjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQubXpicm93c2VyICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICc2LjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQuZm9jdXMgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzEuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uID49IDIwLjApIHx8XG4gICAgICAgIChyZXN1bHQuc2FmYXJpICYmIHJlc3VsdC52ZXJzaW9uID49IDYpIHx8XG4gICAgICAgIChyZXN1bHQub3BlcmEgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0LmJsYWNrYmVycnkgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTAuMSlcbiAgICAgICAgfHwgKHJlc3VsdC5jaHJvbWl1bSAmJiByZXN1bHQudmVyc2lvbiA+PSAyMClcbiAgICAgICAgKSB7XG4gICAgICByZXN1bHQuYSA9IHQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA8IDEwKSB8fFxuICAgICAgICAocmVzdWx0LmNocm9tZSAmJiByZXN1bHQudmVyc2lvbiA8IDIwKSB8fFxuICAgICAgICAocmVzdWx0LmZpcmVmb3ggJiYgcmVzdWx0LnZlcnNpb24gPCAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA8IDYpIHx8XG4gICAgICAgIChyZXN1bHQub3BlcmEgJiYgcmVzdWx0LnZlcnNpb24gPCAxMC4wKSB8fFxuICAgICAgICAocmVzdWx0LmlvcyAmJiByZXN1bHQub3N2ZXJzaW9uICYmIHJlc3VsdC5vc3ZlcnNpb24uc3BsaXQoXCIuXCIpWzBdIDwgNilcbiAgICAgICAgfHwgKHJlc3VsdC5jaHJvbWl1bSAmJiByZXN1bHQudmVyc2lvbiA8IDIwKVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5jID0gdFxuICAgIH0gZWxzZSByZXN1bHQueCA9IHRcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHZhciBib3dzZXIgPSBkZXRlY3QodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnIDogJycpXG5cbiAgYm93c2VyLnRlc3QgPSBmdW5jdGlvbiAoYnJvd3Nlckxpc3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJyb3dzZXJMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYnJvd3Nlckl0ZW0gPSBicm93c2VyTGlzdFtpXTtcbiAgICAgIGlmICh0eXBlb2YgYnJvd3Nlckl0ZW09PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJJdGVtIGluIGJvd3Nlcikge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdmVyc2lvbiBwcmVjaXNpb25zIGNvdW50XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgZ2V0VmVyc2lvblByZWNpc2lvbihcIjEuMTAuM1wiKSAvLyAzXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdmVyc2lvblxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb24pIHtcbiAgICByZXR1cm4gdmVyc2lvbi5zcGxpdChcIi5cIikubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEFycmF5OjptYXAgcG9seWZpbGxcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXl9IGFyclxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBmdW5jdGlvbiBtYXAoYXJyLCBpdGVyYXRvcikge1xuICAgIHZhciByZXN1bHQgPSBbXSwgaTtcbiAgICBpZiAoQXJyYXkucHJvdG90eXBlLm1hcCkge1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnIsIGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2goaXRlcmF0b3IoYXJyW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGJyb3dzZXIgdmVyc2lvbiB3ZWlnaHRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS44LjIuMS45MCddKSAgICAvLyAxXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4wMTAuMi4xJywgJzEuMDkuMi4xLjkwJ10pOyAgLy8gMVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjEwLjIuMSddKTsgICAgIC8vIDBcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS4wODAwLjInXSk7ICAgICAvLyAtMVxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheTxTdHJpbmc+fSB2ZXJzaW9ucyB2ZXJzaW9ucyB0byBjb21wYXJlXG4gICAqIEByZXR1cm4ge051bWJlcn0gY29tcGFyaXNvbiByZXN1bHRcbiAgICovXG4gIGZ1bmN0aW9uIGNvbXBhcmVWZXJzaW9ucyh2ZXJzaW9ucykge1xuICAgIC8vIDEpIGdldCBjb21tb24gcHJlY2lzaW9uIGZvciBib3RoIHZlcnNpb25zLCBmb3IgZXhhbXBsZSBmb3IgXCIxMC4wXCIgYW5kIFwiOVwiIGl0IHNob3VsZCBiZSAyXG4gICAgdmFyIHByZWNpc2lvbiA9IE1hdGgubWF4KGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbnNbMF0pLCBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb25zWzFdKSk7XG4gICAgdmFyIGNodW5rcyA9IG1hcCh2ZXJzaW9ucywgZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgIHZhciBkZWx0YSA9IHByZWNpc2lvbiAtIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbik7XG5cbiAgICAgIC8vIDIpIFwiOVwiIC0+IFwiOS4wXCIgKGZvciBwcmVjaXNpb24gPSAyKVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24gKyBuZXcgQXJyYXkoZGVsdGEgKyAxKS5qb2luKFwiLjBcIik7XG5cbiAgICAgIC8vIDMpIFwiOS4wXCIgLT4gW1wiMDAwMDAwMDAwXCJcIiwgXCIwMDAwMDAwMDlcIl1cbiAgICAgIHJldHVybiBtYXAodmVyc2lvbi5zcGxpdChcIi5cIiksIGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KDIwIC0gY2h1bmsubGVuZ3RoKS5qb2luKFwiMFwiKSArIGNodW5rO1xuICAgICAgfSkucmV2ZXJzZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gaXRlcmF0ZSBpbiByZXZlcnNlIG9yZGVyIGJ5IHJldmVyc2VkIGNodW5rcyBhcnJheVxuICAgIHdoaWxlICgtLXByZWNpc2lvbiA+PSAwKSB7XG4gICAgICAvLyA0KSBjb21wYXJlOiBcIjAwMDAwMDAwOVwiID4gXCIwMDAwMDAwMTBcIiA9IGZhbHNlIChidXQgXCI5XCIgPiBcIjEwXCIgPSB0cnVlKVxuICAgICAgaWYgKGNodW5rc1swXVtwcmVjaXNpb25dID4gY2h1bmtzWzFdW3ByZWNpc2lvbl0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHVua3NbMF1bcHJlY2lzaW9uXSA9PT0gY2h1bmtzWzFdW3ByZWNpc2lvbl0pIHtcbiAgICAgICAgaWYgKHByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgICAgIC8vIGFsbCB2ZXJzaW9uIGNodW5rcyBhcmUgc2FtZVxuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBicm93c2VyIGlzIHVuc3VwcG9ydGVkXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgYm93c2VyLmlzVW5zdXBwb3J0ZWRCcm93c2VyKHtcbiAgICogICAgIG1zaWU6IFwiMTBcIixcbiAgICogICAgIGZpcmVmb3g6IFwiMjNcIixcbiAgICogICAgIGNocm9tZTogXCIyOVwiLFxuICAgKiAgICAgc2FmYXJpOiBcIjUuMVwiLFxuICAgKiAgICAgb3BlcmE6IFwiMTZcIixcbiAgICogICAgIHBoYW50b206IFwiNTM0XCJcbiAgICogICB9KTtcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgbWluVmVyc2lvbnMgbWFwIG9mIG1pbmltYWwgdmVyc2lvbiB0byBicm93c2VyXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IFtzdHJpY3RNb2RlID0gZmFsc2VdIGZsYWcgdG8gcmV0dXJuIGZhbHNlIGlmIGJyb3dzZXIgd2Fzbid0IGZvdW5kIGluIG1hcFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBbdWFdIHVzZXIgYWdlbnQgc3RyaW5nXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc1Vuc3VwcG9ydGVkQnJvd3NlcihtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpIHtcbiAgICB2YXIgX2Jvd3NlciA9IGJvd3NlcjtcblxuICAgIC8vIG1ha2Ugc3RyaWN0TW9kZSBwYXJhbSBvcHRpb25hbCB3aXRoIHVhIHBhcmFtIHVzYWdlXG4gICAgaWYgKHR5cGVvZiBzdHJpY3RNb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgdWEgPSBzdHJpY3RNb2RlO1xuICAgICAgc3RyaWN0TW9kZSA9IHZvaWQoMCk7XG4gICAgfVxuXG4gICAgaWYgKHN0cmljdE1vZGUgPT09IHZvaWQoMCkpIHtcbiAgICAgIHN0cmljdE1vZGUgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHVhKSB7XG4gICAgICBfYm93c2VyID0gZGV0ZWN0KHVhKTtcbiAgICB9XG5cbiAgICB2YXIgdmVyc2lvbiA9IFwiXCIgKyBfYm93c2VyLnZlcnNpb247XG4gICAgZm9yICh2YXIgYnJvd3NlciBpbiBtaW5WZXJzaW9ucykge1xuICAgICAgaWYgKG1pblZlcnNpb25zLmhhc093blByb3BlcnR5KGJyb3dzZXIpKSB7XG4gICAgICAgIGlmIChfYm93c2VyW2Jyb3dzZXJdKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBtaW5WZXJzaW9uc1ticm93c2VyXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnJvd3NlciB2ZXJzaW9uIGluIHRoZSBtaW5WZXJzaW9uIG1hcCBzaG91bGQgYmUgYSBzdHJpbmc6ICcgKyBicm93c2VyICsgJzogJyArIFN0cmluZyhtaW5WZXJzaW9ucykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGJyb3dzZXIgdmVyc2lvbiBhbmQgbWluIHN1cHBvcnRlZCB2ZXJzaW9uLlxuICAgICAgICAgIHJldHVybiBjb21wYXJlVmVyc2lvbnMoW3ZlcnNpb24sIG1pblZlcnNpb25zW2Jyb3dzZXJdXSkgPCAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmljdE1vZGU7IC8vIG5vdCBmb3VuZFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGJyb3dzZXIgaXMgc3VwcG9ydGVkXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gbWluVmVyc2lvbnMgbWFwIG9mIG1pbmltYWwgdmVyc2lvbiB0byBicm93c2VyXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IFtzdHJpY3RNb2RlID0gZmFsc2VdIGZsYWcgdG8gcmV0dXJuIGZhbHNlIGlmIGJyb3dzZXIgd2Fzbid0IGZvdW5kIGluIG1hcFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBbdWFdIHVzZXIgYWdlbnQgc3RyaW5nXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBjaGVjayhtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpIHtcbiAgICByZXR1cm4gIWlzVW5zdXBwb3J0ZWRCcm93c2VyKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSk7XG4gIH1cblxuICBib3dzZXIuaXNVbnN1cHBvcnRlZEJyb3dzZXIgPSBpc1Vuc3VwcG9ydGVkQnJvd3NlcjtcbiAgYm93c2VyLmNvbXBhcmVWZXJzaW9ucyA9IGNvbXBhcmVWZXJzaW9ucztcbiAgYm93c2VyLmNoZWNrID0gY2hlY2s7XG5cbiAgLypcbiAgICogU2V0IG91ciBkZXRlY3QgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3Qgc28gd2UgY2FuXG4gICAqIHJldXNlIGl0IHRvIHRlc3Qgb3RoZXIgdXNlciBhZ2VudHMuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGltcGxlbWVudCBmdXR1cmUgdGVzdHMuXG4gICAqL1xuICBib3dzZXIuX2RldGVjdCA9IGRldGVjdDtcblxuICAvKlxuICAgKiBTZXQgb3VyIGRldGVjdCBwdWJsaWMgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3RcbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gaW1wbGVtZW50IGJvd3NlciBpbiBzZXJ2ZXIgc2lkZVxuICAgKi9cbiAgYm93c2VyLmRldGVjdCA9IGRldGVjdDtcbiAgcmV0dXJuIGJvd3NlclxufSk7XG4iLCJ2YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXHJcbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcCcpO1xyXG52YXIgcG9seWZpbGxzID0gcmVxdWlyZSgnLi9wb2x5ZmlsbHMnKTtcclxuXHJcbnBvbHlmaWxscy5hcHBseVBvbHlmaWxscygpO1xyXG5cclxudmFyIGluc3RhbmNlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdldEluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oSGVscGVycy56aXBPYmplY3QoWydpbml0JywgJ29wZW4nLCAnY2xvc2UnLCAnb24nLCAnb2ZmJywgJ3NlbmRNZXNzYWdlJywgJ29uTWVzc2FnZSddLm1hcChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xyXG4gICAgICAgIHZhciBhcHAgPSBnZXRJbnN0YW5jZSgpO1xyXG4gICAgICAgIHJldHVybiBbbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXBwW21ldGhvZE5hbWVdLmFwcGx5KGFwcCwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XTtcclxuICAgIH0pKSwge1xyXG4gICAgICAgIGV2ZW50VHlwZXM6IEFwcC5ldmVudFR5cGVzLFxyXG4gICAgfSk7XHJcbn0pKCk7XHJcbiJdfQ==
