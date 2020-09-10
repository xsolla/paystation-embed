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
        STATUS_DONE: 'status-done'
    };

    var DEFAULT_CONFIG = {
        access_token: null,
        access_data: null,
        sandbox: false,
        lightbox: {},
        childWindow: {},
        host: 'secure.xsolla.com'
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

    App.prototype.triggerEvent = function () {
        [].forEach.call(arguments, (function (eventName) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, false);
            document.dispatchEvent(event);
        }).bind(this));
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

        this.postMessage = null;
        if ((new Device).isMobile()) {
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
                childWindow.off('close', handleClose);
            });
            childWindow.on('status', handleStatus);
            childWindow.open(url, this.config.childWindow);
        } else {
            var lightBox = new LightBox;
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
                lightBox.off('close', handleClose);
            });
            lightBox.on('status', handleStatus);
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

        this.eventObject.on(event, handler, options);
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
    function LightBox() {
        require('./styles/lightbox.scss');
        this.eventObject = Helpers.addEventObject(this, wrapEventInNamespace);
        this.options = DEFAULT_OPTIONS;
        this.message = null;
    }

    var CLASS_PREFIX = 'xpaystation-widget-lightbox';
    var DEFAULT_OPTIONS = {
        width: null,
        height: '100%',
        zIndex: 1000,
        overlayOpacity: '.6',
        overlayBackground: '#000000',
        contentBackground: '#ffffff',
        contentMargin: '10px',
        closeByKeyboard: true,
        closeByClick: true,
        modal: false,
        spinner: 'xsolla',
        spinnerColor: null,
        spinnerUrl: null,
        spinnerRotationPeriod: 0
    };

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

            if (global.window.innerWidth > outerWidth(bodyElement)) {
                var bodyPad = parseInt((getComputedStyle(bodyElement)['paddingRight'] || 0), 10);
                bodyElement.style.overflow = 'hidden;';
                bodyElement.style.paddingRight = withDefaultPXUnit(bodyPad + this.measureScrollbar());
            }
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
module.exports = '1.2.1';

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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJib3dlcl9jb21wb25lbnRzL2Jvd3Nlci9zcmMvYm93c2VyLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckVBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTs7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzLCBjdXN0b21Eb2N1bWVudCkge1xuICB2YXIgZG9jID0gY3VzdG9tRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG4gIGlmIChkb2MuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHZhciBzaGVldCA9IGRvYy5jcmVhdGVTdHlsZVNoZWV0KClcbiAgICBzaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIHJldHVybiBzaGVldC5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgc3R5bGUgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIH1cblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuYnlVcmwgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCh1cmwpLm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHJldHVybiBsaW5rO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdjc3NpZnknKTsiLCJ2YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xyXG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcclxudmFyIExpZ2h0Qm94ID0gcmVxdWlyZSgnLi9saWdodGJveCcpO1xyXG52YXIgQ2hpbGRXaW5kb3cgPSByZXF1aXJlKCcuL2NoaWxkd2luZG93Jyk7XHJcbnZhciBEZXZpY2UgPSByZXF1aXJlKCcuL2RldmljZScpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIEFwcCgpIHtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfQ09ORklHKTtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzKTtcclxuICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgQXBwLmV2ZW50VHlwZXMgPSB7XHJcbiAgICAgICAgSU5JVDogJ2luaXQnLFxyXG4gICAgICAgIE9QRU46ICdvcGVuJyxcclxuICAgICAgICBPUEVOX1dJTkRPVzogJ29wZW4td2luZG93JyxcclxuICAgICAgICBPUEVOX0xJR0hUQk9YOiAnb3Blbi1saWdodGJveCcsXHJcbiAgICAgICAgTE9BRDogJ2xvYWQnLFxyXG4gICAgICAgIENMT1NFOiAnY2xvc2UnLFxyXG4gICAgICAgIENMT1NFX1dJTkRPVzogJ2Nsb3NlLXdpbmRvdycsXHJcbiAgICAgICAgQ0xPU0VfTElHSFRCT1g6ICdjbG9zZS1saWdodGJveCcsXHJcbiAgICAgICAgU1RBVFVTOiAnc3RhdHVzJyxcclxuICAgICAgICBTVEFUVVNfSU5WT0lDRTogJ3N0YXR1cy1pbnZvaWNlJyxcclxuICAgICAgICBTVEFUVVNfREVMSVZFUklORzogJ3N0YXR1cy1kZWxpdmVyaW5nJyxcclxuICAgICAgICBTVEFUVVNfVFJPVUJMRUQ6ICdzdGF0dXMtdHJvdWJsZWQnLFxyXG4gICAgICAgIFNUQVRVU19ET05FOiAnc3RhdHVzLWRvbmUnXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBERUZBVUxUX0NPTkZJRyA9IHtcclxuICAgICAgICBhY2Nlc3NfdG9rZW46IG51bGwsXHJcbiAgICAgICAgYWNjZXNzX2RhdGE6IG51bGwsXHJcbiAgICAgICAgc2FuZGJveDogZmFsc2UsXHJcbiAgICAgICAgbGlnaHRib3g6IHt9LFxyXG4gICAgICAgIGNoaWxkV2luZG93OiB7fSxcclxuICAgICAgICBob3N0OiAnc2VjdXJlLnhzb2xsYS5jb20nXHJcbiAgICB9O1xyXG4gICAgdmFyIFNBTkRCT1hfUEFZU1RBVElPTl9VUkwgPSAnaHR0cHM6Ly9zYW5kYm94LXNlY3VyZS54c29sbGEuY29tL3BheXN0YXRpb24yLz8nO1xyXG4gICAgdmFyIEVWRU5UX05BTUVTUEFDRSA9ICcueHBheXN0YXRpb24td2lkZ2V0JztcclxuICAgIHZhciBBVFRSX1BSRUZJWCA9ICdkYXRhLXhwYXlzdGF0aW9uLXdpZGdldC1vcGVuJztcclxuXHJcbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5jb25maWcgPSB7fTtcclxuICAgIEFwcC5wcm90b3R5cGUuaXNJbml0aWF0ZWQgPSBmYWxzZTtcclxuICAgIEFwcC5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMpO1xyXG5cclxuICAgIEFwcC5wcm90b3R5cGUuZ2V0UGF5bWVudFVybCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcucGF5bWVudF91cmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBheW1lbnRfdXJsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcXVlcnkgPSB7fTtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcuYWNjZXNzX3Rva2VuKSB7XHJcbiAgICAgICAgICAgIHF1ZXJ5LmFjY2Vzc190b2tlbiA9IHRoaXMuY29uZmlnLmFjY2Vzc190b2tlbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBxdWVyeS5hY2Nlc3NfZGF0YSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybFdpdGhvdXRRdWVyeVBhcmFtcyA9IHRoaXMuY29uZmlnLnNhbmRib3ggP1xyXG4gICAgICAgICAgICBTQU5EQk9YX1BBWVNUQVRJT05fVVJMIDpcclxuICAgICAgICAgICAgJ2h0dHBzOi8vJyArIHRoaXMuY29uZmlnLmhvc3QgKyAnL3BheXN0YXRpb24yLz8nO1xyXG4gICAgICAgIHJldHVybiB1cmxXaXRob3V0UXVlcnlQYXJhbXMgKyBIZWxwZXJzLnBhcmFtKHF1ZXJ5KTtcclxuICAgIH07XHJcblxyXG4gICAgQXBwLnByb3RvdHlwZS5jaGVja0NvbmZpZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc190b2tlbikgJiYgSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKSAmJiBIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcucGF5bWVudF91cmwpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignTm8gYWNjZXNzIHRva2VuIG9yIGFjY2VzcyBkYXRhIG9yIHBheW1lbnQgVVJMIGdpdmVuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIUhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5hY2Nlc3NfZGF0YSkgJiYgdHlwZW9mIHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0ludmFsaWQgYWNjZXNzIGRhdGEgZm9ybWF0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmhvc3QpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW52YWxpZCBob3N0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBBcHAucHJvdG90eXBlLmNoZWNrQXBwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzSW5pdGlhdGVkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdJbml0aWFsaXplIHdpZGdldCBiZWZvcmUgb3BlbmluZycpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQXBwLnByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKG1lc3NhZ2UpO1xyXG4gICAgfTtcclxuXHJcbiAgICBBcHAucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgICAgICAgICBldmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemUgd2lkZ2V0IHdpdGggb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxpemUob3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcclxuICAgICAgICAgICAgdmFyIGNsaWNrRXZlbnROYW1lID0gJ2NsaWNrJyArIEVWRU5UX05BTUVTUEFDRTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVDbGlja0V2ZW50ID0gKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1snICsgQVRUUl9QUkVGSVggKyAnXScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZUV2ZW50LnRhcmdldCA9PT0gdGFyZ2V0RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Blbi5jYWxsKHRoaXMsIHRhcmdldEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgICAgICAgICBjbGlja0V2ZW50LmluaXRFdmVudChjbGlja0V2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcclxuICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XHJcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudE5hbWUsIGhhbmRsZUNsaWNrRXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5JTklUKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVhZHkoaW5pdGlhbGl6ZS5iaW5kKHRoaXMsIG9wdGlvbnMpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gcGF5bWVudCBpbnRlcmZhY2UgKFBheVN0YXRpb24pXHJcbiAgICAgKi9cclxuICAgIEFwcC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNoZWNrQ29uZmlnKCk7XHJcbiAgICAgICAgdGhpcy5jaGVja0FwcCgpO1xyXG5cclxuICAgICAgICB2YXIgdHJpZ2dlclNwbGl0U3RhdHVzID0gKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoKChkYXRhIHx8IHt9KS5wYXltZW50SW5mbyB8fCB7fSkuc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdpbnZvaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfSU5WT0lDRSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxpdmVyaW5nJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfREVMSVZFUklORywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd0cm91YmxlZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX1RST1VCTEVELCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvbmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19ET05FLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmdldFBheW1lbnRVcmwoKTtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVN0YXR1cyhldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdHVzRGF0YSA9IGV2ZW50LmRldGFpbDtcclxuICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTLCBzdGF0dXNEYXRhKTtcclxuICAgICAgICAgICAgdHJpZ2dlclNwbGl0U3RhdHVzKHN0YXR1c0RhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKChuZXcgRGV2aWNlKS5pc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdpbmRvdyA9IG5ldyBDaGlsZFdpbmRvdztcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ29wZW4nLCBmdW5jdGlvbiBoYW5kbGVPcGVuKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5wb3N0TWVzc2FnZSA9IGNoaWxkV2luZG93LmdldFBvc3RNZXNzYWdlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOKTtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU5fV0lORE9XKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZignb3BlbicsIGhhbmRsZU9wZW4pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuTE9BRCk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdjbG9zZScsIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0UpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0VfV0lORE9XKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcclxuICAgICAgICAgICAgY2hpbGRXaW5kb3cub3Blbih1cmwsIHRoaXMuY29uZmlnLmNoaWxkV2luZG93KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgbGlnaHRCb3ggPSBuZXcgTGlnaHRCb3g7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdvcGVuJywgZnVuY3Rpb24gaGFuZGxlT3BlbigpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQucG9zdE1lc3NhZ2UgPSBsaWdodEJveC5nZXRQb3N0TWVzc2FnZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTik7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOX0xJR0hUQk9YKTtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignb3BlbicsIGhhbmRsZU9wZW4pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbGlnaHRCb3gub24oJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuTE9BRCk7XHJcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdjbG9zZScsIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0UpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0VfTElHSFRCT1gpO1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKCdjbG9zZScsIGhhbmRsZUNsb3NlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xyXG4gICAgICAgICAgICBsaWdodEJveC5vcGVuRnJhbWUodXJsLCB0aGlzLmNvbmZpZy5saWdodGJveCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBvbmUgb3IgbW9yZSBldmVudHMgdG8gdGhlIHdpZGdldFxyXG4gICAgICogQHBhcmFtIGV2ZW50IE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlcyAoaW5pdCwgb3BlbiwgbG9hZCwgY2xvc2UsIHN0YXR1cywgc3RhdHVzLWludm9pY2UsIHN0YXR1cy1kZWxpdmVyaW5nLCBzdGF0dXMtdHJvdWJsZWQsIHN0YXR1cy1kb25lKVxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgQSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZFxyXG4gICAgICovXHJcbiAgICBBcHAucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhbiBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAcGFyYW0gZXZlbnQgT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzXHJcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBBIGhhbmRsZXIgZnVuY3Rpb24gcHJldmlvdXNseSBhdHRhY2hlZCBmb3IgdGhlIGV2ZW50KHMpXHJcbiAgICAgKi9cclxuICAgIEFwcC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbmQgYSBtZXNzYWdlIGRpcmVjdGx5IHRvIFBheVN0YXRpb25cclxuICAgICAqIEBwYXJhbSBjb21tYW5kXHJcbiAgICAgKiBAcGFyYW0gZGF0YVxyXG4gICAgICovXHJcbiAgICBBcHAucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKGNvbW1hbmQsIGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5wb3N0TWVzc2FnZSkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlLnNlbmQuYXBwbHkodGhpcy5wb3N0TWVzc2FnZSwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gZm9yIG1lc3NhZ2UgZXZlbnQgZnJvbSBQYXlTdGF0aW9uXHJcbiAgICAgKiBAcGFyYW0gY29tbWFuZFxyXG4gICAgICogQHBhcmFtIGhhbmRsZXJcclxuICAgICAqL1xyXG4gICAgQXBwLnByb3RvdHlwZS5vbk1lc3NhZ2UgPSBmdW5jdGlvbiAoY29tbWFuZCwgaGFuZGxlcikge1xyXG4gICAgICAgIGlmICh0aGlzLnBvc3RNZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uub24uYXBwbHkodGhpcy5wb3N0TWVzc2FnZSwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBBcHA7XHJcbn0pKCk7XHJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJyk7XHJcbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XHJcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENoaWxkV2luZG93KCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xyXG4gICAgICAgIHJldHVybiBDaGlsZFdpbmRvdy5fTkFNRVNQQUNFICsgJ18nICsgZXZlbnROYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmV2ZW50T2JqZWN0ID0gbnVsbDtcclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jaGlsZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudCwgZGF0YSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdyAmJiAhdGhpcy5jaGlsZFdpbmRvdy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHZhciBhZGRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhhdC5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5jbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuY2hpbGRXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNoaWxkV2luZG93LmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhhdC5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3Jvc3Mtd2luZG93IGNvbW11bmljYXRpb25cclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKHRoYXQuY2hpbGRXaW5kb3cpO1xyXG4gICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub24oJ2RpbWVuc2lvbnMgd2lkZ2V0LWRldGVjdGlvbicsIGZ1bmN0aW9uIGhhbmRsZVdpZGdldERldGVjdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCdsb2FkJyk7XHJcbiAgICAgICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub2ZmKCdkaW1lbnNpb25zIHdpZGdldC1kZXRlY3Rpb24nLCBoYW5kbGVXaWRnZXREZXRlY3Rpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCd3aWRnZXQtZGV0ZWN0aW9uJywgZnVuY3Rpb24gaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBjaGlsZFdpbmRvd09wdGlvbnM6IG9wdGlvbnN9KTtcclxuICAgICAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vZmYoJ3dpZGdldC1kZXRlY3Rpb24nLCBoYW5kbGVXaWRnZXREZXRlY3Rpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdzdGF0dXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCdzdGF0dXMnLCBldmVudC5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhhdC5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vZmYoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQub2ZmKCdjbG9zZScsIGhhbmRsZUNsb3NlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICBjYXNlICdfc2VsZic6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdztcclxuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnX3BhcmVudCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ19ibGFuayc6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5vcGVuKHVybCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjaGVja1dpbmRvdyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcclxuICAgIH07XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZ2V0UG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcclxuICAgIH07XHJcblxyXG4gICAgQ2hpbGRXaW5kb3cuX05BTUVTUEFDRSA9ICdDSElMRF9XSU5ET1cnO1xyXG5cclxuICAgIHJldHVybiBDaGlsZFdpbmRvdztcclxufSkoKTtcclxuIiwidmFyIGJvd3NlciA9IHJlcXVpcmUoJ2Jvd3NlcicpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGV2aWNlKCkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTW9iaWxlIGRldmljZXNcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBEZXZpY2UucHJvdG90eXBlLmlzTW9iaWxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIGJvd3Nlci5tb2JpbGUgfHwgYm93c2VyLnRhYmxldDtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIERldmljZTtcclxufSkoKTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuICAgIHRoaXMubmFtZSA9IFwiWHNvbGxhUGF5U3RhdGlvbldpZGdldEV4Y2VwdGlvblwiO1xyXG4gICAgdGhpcy50b1N0cmluZyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICc6ICcgKyB0aGlzLm1lc3NhZ2U7XHJcbiAgICB9KS5iaW5kKHRoaXMpO1xyXG59O1xyXG4iLCJmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XHJcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuaXEobGlzdCkge1xyXG4gIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4LCBpLCBhKSB7XHJcbiAgICByZXR1cm4gYS5pbmRleE9mKHgpID09IGlcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gemlwT2JqZWN0KHByb3BzLCB2YWx1ZXMpIHtcclxuICB2YXIgaW5kZXggPSAtMSxcclxuICAgICAgbGVuZ3RoID0gcHJvcHMgPyBwcm9wcy5sZW5ndGggOiAwLFxyXG4gICAgICByZXN1bHQgPSB7fTtcclxuXHJcbiAgaWYgKGxlbmd0aCAmJiAhdmFsdWVzICYmICFBcnJheS5pc0FycmF5KHByb3BzWzBdKSkge1xyXG4gICAgdmFsdWVzID0gW107XHJcbiAgfVxyXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xyXG4gICAgaWYgKHZhbHVlcykge1xyXG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlc1tpbmRleF07XHJcbiAgICB9IGVsc2UgaWYgKGtleSkge1xyXG4gICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyYW0oYSkge1xyXG4gIHZhciBzID0gW107XHJcblxyXG4gIHZhciBhZGQgPSBmdW5jdGlvbiAoaywgdikge1xyXG4gICAgICB2ID0gdHlwZW9mIHYgPT09ICdmdW5jdGlvbicgPyB2KCkgOiB2O1xyXG4gICAgICB2ID0gdiA9PT0gbnVsbCA/ICcnIDogdiA9PT0gdW5kZWZpbmVkID8gJycgOiB2O1xyXG4gICAgICBzW3MubGVuZ3RoXSA9IGVuY29kZVVSSUNvbXBvbmVudChrKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2KTtcclxuICB9O1xyXG5cclxuICB2YXIgYnVpbGRQYXJhbXMgPSBmdW5jdGlvbiAocHJlZml4LCBvYmopIHtcclxuICAgICAgdmFyIGksIGxlbiwga2V5O1xyXG5cclxuICAgICAgaWYgKHByZWZpeCkge1xyXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhcclxuICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArICdbJyArICh0eXBlb2Ygb2JqW2ldID09PSAnb2JqZWN0JyAmJiBvYmpbaV0gPyBpIDogJycpICsgJ10nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgb2JqW2ldXHJcbiAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChTdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcclxuICAgICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgYnVpbGRQYXJhbXMocHJlZml4ICsgJ1snICsga2V5ICsgJ10nLCBvYmpba2V5XSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhZGQocHJlZml4LCBvYmopO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgYWRkKG9ialtpXS5uYW1lLCBvYmpbaV0udmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgYnVpbGRQYXJhbXMoa2V5LCBvYmpba2V5XSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIGJ1aWxkUGFyYW1zKCcnLCBhKS5qb2luKCcmJyk7XHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gb25jZShmKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICBmKGFyZ3VtZW50cyk7XHJcbiAgICAgIGYgPSBmdW5jdGlvbigpIHt9O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRXZlbnRPYmplY3QoY29udGV4dCwgd3JhcEV2ZW50SW5OYW1lc3BhY2UpIHtcclxuICAgIHZhciBkdW1teVdyYXBwZXIgPSBmdW5jdGlvbihldmVudCkgeyByZXR1cm4gZXZlbnQgfTtcclxuICAgIHZhciB3cmFwRXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlIHx8IGR1bW15V3JhcHBlcjtcclxuICAgIHZhciBldmVudHNMaXN0ID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gaXNTdHJpbmdDb250YWluZWRTcGFjZShzdHIpIHtcclxuICAgICAgcmV0dXJuIC8gLy50ZXN0KHN0cilcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0cmlnZ2VyOiAoZnVuY3Rpb24oZXZlbnROYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudEluTmFtZXNwYWNlLCB7ZGV0YWlsOiBkYXRhfSk7IC8vIE5vdCB3b3JraW5nIGluIElFXHJcbiAgICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgICAgICAgICAgICBldmVudC5pbml0Q3VzdG9tRXZlbnQoZXZlbnRJbk5hbWVzcGFjZSwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgfSkuYmluZChjb250ZXh0KSxcclxuICAgICAgb246IChmdW5jdGlvbihldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRFdmVudChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgdmFyIGV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudEluTmFtZXNwYWNlLCBoYW5kbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgZXZlbnRzTGlzdC5wdXNoKHtuYW1lOiBldmVudEluTmFtZXNwYWNlLCBoYW5kbGU6IGhhbmRsZSwgb3B0aW9uczogb3B0aW9ucyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKGV2ZW50TmFtZSkpIHtcclxuICAgICAgICAgIHZhciBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnNlZEV2ZW50TmFtZSkge1xyXG4gICAgICAgICAgICBhZGRFdmVudChwYXJzZWRFdmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucylcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGFkZEV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9KS5iaW5kKGNvbnRleHQpLFxyXG5cclxuICAgICAgb2ZmOiAoZnVuY3Rpb24oZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBvZmZBbGxFdmVudHMgPSAhZXZlbnROYW1lICYmICFoYW5kbGUgJiYgIW9wdGlvbnM7XHJcblxyXG4gICAgICAgIGlmIChvZmZBbGxFdmVudHMpIHtcclxuICAgICAgICAgIGV2ZW50c0xpc3QuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50Lm5hbWUsIGV2ZW50LmhhbmRsZSwgZXZlbnQub3B0aW9ucyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XHJcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICBldmVudHNMaXN0ID0gZXZlbnRzTGlzdC5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50Lm5hbWUgIT09IGV2ZW50SW5OYW1lc3BhY2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKGV2ZW50TmFtZSkpIHtcclxuICAgICAgICAgIHZhciBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnNlZEV2ZW50TmFtZSkge1xyXG4gICAgICAgICAgICByZW1vdmVFdmVudChwYXJzZWRFdmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucylcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlbW92ZUV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9KS5iaW5kKGNvbnRleHQpXHJcbiAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgYWRkRXZlbnRPYmplY3Q6IGFkZEV2ZW50T2JqZWN0LFxyXG4gIGlzRW1wdHk6IGlzRW1wdHksXHJcbiAgdW5pcTogdW5pcSxcclxuICB6aXBPYmplY3Q6IHppcE9iamVjdCxcclxuICBwYXJhbTogcGFyYW0sXHJcbiAgb25jZTogb25jZSxcclxufVxyXG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpO1xyXG52YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xyXG52YXIgUG9zdE1lc3NhZ2UgPSByZXF1aXJlKCcuL3Bvc3RtZXNzYWdlJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMaWdodEJveCgpIHtcclxuICAgICAgICByZXF1aXJlKCcuL3N0eWxlcy9saWdodGJveC5zY3NzJyk7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcywgd3JhcEV2ZW50SW5OYW1lc3BhY2UpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IERFRkFVTFRfT1BUSU9OUztcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBDTEFTU19QUkVGSVggPSAneHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94JztcclxuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgICAgICAgd2lkdGg6IG51bGwsXHJcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgekluZGV4OiAxMDAwLFxyXG4gICAgICAgIG92ZXJsYXlPcGFjaXR5OiAnLjYnLFxyXG4gICAgICAgIG92ZXJsYXlCYWNrZ3JvdW5kOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgY29udGVudEJhY2tncm91bmQ6ICcjZmZmZmZmJyxcclxuICAgICAgICBjb250ZW50TWFyZ2luOiAnMTBweCcsXHJcbiAgICAgICAgY2xvc2VCeUtleWJvYXJkOiB0cnVlLFxyXG4gICAgICAgIGNsb3NlQnlDbGljazogdHJ1ZSxcclxuICAgICAgICBtb2RhbDogZmFsc2UsXHJcbiAgICAgICAgc3Bpbm5lcjogJ3hzb2xsYScsXHJcbiAgICAgICAgc3Bpbm5lckNvbG9yOiBudWxsLFxyXG4gICAgICAgIHNwaW5uZXJVcmw6IG51bGwsXHJcbiAgICAgICAgc3Bpbm5lclJvdGF0aW9uUGVyaW9kOiAwXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBTUElOTkVSUyA9IHtcclxuICAgICAgICB4c29sbGE6IHJlcXVpcmUoJy4vc3Bpbm5lcnMveHNvbGxhLnN2ZycpLFxyXG4gICAgICAgIHJvdW5kOiByZXF1aXJlKCcuL3NwaW5uZXJzL3JvdW5kLnN2ZycpLFxyXG4gICAgICAgIG5vbmU6ICcgJ1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgTUlOX1BTX0RJTUVOU0lPTlMgPSB7XHJcbiAgICAgICAgaGVpZ2h0OiA1MDAsXHJcbiAgICAgICAgd2lkdGg6IDYwMFxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgaGFuZGxlS2V5dXBFdmVudE5hbWUgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZSgna2V5dXAnKTtcclxuICAgIHZhciBoYW5kbGVSZXNpemVFdmVudE5hbWUgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZSgncmVzaXplJyk7XHJcblxyXG4gICAgdmFyIGhhbmRsZUdsb2JhbEtleXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcbiAgICAgICAgdmFyIGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcclxuICAgICAgICBjbGlja0V2ZW50LmluaXRFdmVudChoYW5kbGVLZXl1cEV2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYW5kbGVTcGVjaWZpY0tleXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQuc291cmNlRXZlbnQud2hpY2ggPT0gMjcpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYW5kbGVHbG9iYWxSZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcmVzaXplRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcclxuICAgICAgICByZXNpemVFdmVudC5pbml0RXZlbnQoaGFuZGxlUmVzaXplRXZlbnROYW1lLCBmYWxzZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlc2l6ZUV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpIHtcclxuICAgICAgICByZXR1cm4gTGlnaHRCb3guX05BTUVTUEFDRSArICdfJyArIGV2ZW50TmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0LnRyaWdnZXIuYXBwbHkodGhpcy5ldmVudE9iamVjdCwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcblxyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm1lYXN1cmVTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7IC8vIHRoeCB3YWxzaDogaHR0cHM6Ly9kYXZpZHdhbHNoLm5hbWUvZGV0ZWN0LXNjcm9sbGJhci13aWR0aFxyXG4gICAgICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHNjcm9sbERpdi5jbGFzc0xpc3QuYWRkKFwic2Nyb2xsYmFyLW1lYXN1cmVcIik7XHJcbiAgICAgICAgc2Nyb2xsRGl2LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXHJcbiAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgXCJ0b3A6IC05OTk5cHhcIiArXHJcbiAgICAgICAgICAgIFwid2lkdGg6IDUwcHhcIiArXHJcbiAgICAgICAgICAgIFwiaGVpZ2h0OiA1MHB4XCIgK1xyXG4gICAgICAgICAgICBcIm92ZXJmbG93OiBzY3JvbGxcIlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Nyb2xsRGl2KTtcclxuXHJcbiAgICAgICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNjcm9sbGJhcldpZHRoO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKiogUHVibGljIE1lbWJlcnMgKiovXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUub3BlbkZyYW1lID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgdmFyIEhhbmRsZUJvdW5kU3BlY2lmaWNLZXl1cCA9IGhhbmRsZVNwZWNpZmljS2V5dXAuYmluZCh0aGlzKTtcclxuICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgICAgICB2YXIgc3Bpbm5lciA9IG9wdGlvbnMuc3Bpbm5lciA9PT0gJ2N1c3RvbScgJiYgISFvcHRpb25zLnNwaW5uZXJVcmwgP1xyXG4gICAgICAgICAgICAnPGltZyBjbGFzcz1cInNwaW5uZXItY3VzdG9tXCIgc3JjPVwiJyArIGVuY29kZVVSSShvcHRpb25zLnNwaW5uZXJVcmwpICsgJ1wiIC8+JyA6IFNQSU5ORVJTW29wdGlvbnMuc3Bpbm5lcl0gfHwgT2JqZWN0LnZhbHVlcyhTUElOTkVSUylbMF07XHJcblxyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xyXG4gICAgICAgICAgICB2YXIgaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBob3N0LmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeDtcclxuXHJcbiAgICAgICAgICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIG92ZXJsYXkuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1vdmVybGF5JztcclxuXHJcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50JyArICcgJyArIHNldHRpbmdzLnByZWZpeCArICctY29udGVudF9faGlkZGVuJztcclxuXHJcbiAgICAgICAgICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcclxuICAgICAgICAgICAgaWZyYW1lLmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctY29udGVudC1pZnJhbWUnO1xyXG4gICAgICAgICAgICBpZnJhbWUuc3JjID0gc2V0dGluZ3MudXJsO1xyXG4gICAgICAgICAgICBpZnJhbWUuZnJhbWVCb3JkZXIgPSAnMCc7XHJcbiAgICAgICAgICAgIGlmcmFtZS5hbGxvd0Z1bGxzY3JlZW4gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgc3Bpbm5lci5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLXNwaW5uZXInO1xyXG4gICAgICAgICAgICBzcGlubmVyLmlubmVySFRNTCA9IHNldHRpbmdzLnNwaW5uZXI7XHJcblxyXG4gICAgICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcblxyXG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xyXG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKHNwaW5uZXIpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhvc3Q7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGJvZHlFbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgdmFyIGxpZ2h0Qm94RWxlbWVudCA9IHRlbXBsYXRlKHtcclxuICAgICAgICAgICAgcHJlZml4OiBDTEFTU19QUkVGSVgsXHJcbiAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICBzcGlubmVyOiBzcGlubmVyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLW92ZXJsYXknKTtcclxuICAgICAgICB2YXIgbGlnaHRCb3hDb250ZW50RWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctY29udGVudCcpO1xyXG4gICAgICAgIHZhciBsaWdodEJveElmcmFtZUVsZW1lbnQgPSBsaWdodEJveENvbnRlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1jb250ZW50LWlmcmFtZScpO1xyXG4gICAgICAgIHZhciBsaWdodEJveFNwaW5uZXJFbGVtZW50ID0gbGlnaHRCb3hFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1zcGlubmVyJyk7XHJcblxyXG4gICAgICAgIHZhciBwc0RpbWVuc2lvbnMgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiB3aXRoRGVmYXVsdFBYVW5pdChNSU5fUFNfRElNRU5TSU9OUy53aWR0aCksXHJcbiAgICAgICAgICAgIGhlaWdodDogd2l0aERlZmF1bHRQWFVuaXQoTUlOX1BTX0RJTUVOU0lPTlMuaGVpZ2h0KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHdpdGhEZWZhdWx0UFhVbml0KHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBpc1N0cmluZ1dpdGhvdXRVbml0ID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBTdHJpbmcocGFyc2VGbG9hdCh2YWx1ZSkpLmxlbmd0aCA9PT0gdmFsdWUubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoaXNTdHJpbmdXaXRob3V0VW5pdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlICsgJ3B4JyA6IHZhbHVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaWdodEJveEVsZW1lbnQuc3R5bGUuekluZGV4ID0gb3B0aW9ucy56SW5kZXg7XHJcblxyXG4gICAgICAgIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IG9wdGlvbnMub3ZlcmxheU9wYWNpdHk7XHJcbiAgICAgICAgbGlnaHRCb3hPdmVybGF5RWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLm92ZXJsYXlCYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMuY29udGVudEJhY2tncm91bmQ7XHJcbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5tYXJnaW4gPSB3aXRoRGVmYXVsdFBYVW5pdChvcHRpb25zLmNvbnRlbnRNYXJnaW4pO1xyXG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSBvcHRpb25zLndpZHRoID8gd2l0aERlZmF1bHRQWFVuaXQob3B0aW9ucy53aWR0aCkgOiAnYXV0byc7XHJcbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCA/IHdpdGhEZWZhdWx0UFhVbml0KG9wdGlvbnMuaGVpZ2h0KSA6ICdhdXRvJztcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc3Bpbm5lckNvbG9yKSB7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQucXVlcnlTZWxlY3RvcigncGF0aCcpLnN0eWxlLmZpbGwgPSBvcHRpb25zLnNwaW5uZXJDb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLnNwaW5uZXIgPT09ICdjdXN0b20nKSB7XHJcbiAgICAgICAgICAgIHZhciBzcGlubmVyQ3VzdG9tID0gbGlnaHRCb3hTcGlubmVyRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3Bpbm5lci1jdXN0b20nKTtcclxuICAgICAgICAgICAgc3Bpbm5lckN1c3RvbS5zdHlsZVsnLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb24nXSA9IG9wdGlvbnMuc3Bpbm5lclJvdGF0aW9uUGVyaW9kICsgJ3M7JztcclxuICAgICAgICAgICAgc3Bpbm5lckN1c3RvbS5zdHlsZVsnYW5pbWF0aW9uLWR1cmF0aW9uJ10gPSBvcHRpb25zLnNwaW5uZXJSb3RhdGlvblBlcmlvZCArICdzOyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5jbG9zZUJ5Q2xpY2spIHtcclxuICAgICAgICAgICAgbGlnaHRCb3hPdmVybGF5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcclxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBib2R5RWxlbWVudC5hcHBlbmRDaGlsZChsaWdodEJveEVsZW1lbnQpO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5jbG9zZUJ5S2V5Ym9hcmQpIHtcclxuXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoaGFuZGxlS2V5dXBFdmVudE5hbWUsIEhhbmRsZUJvdW5kU3BlY2lmaWNLZXl1cCk7XHJcblxyXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGhhbmRsZUdsb2JhbEtleXVwLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc2hvd0NvbnRlbnQgPSBIZWxwZXJzLm9uY2UoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaGlkZVNwaW5uZXIob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19QUkVGSVggKyAnLWNvbnRlbnRfX2hpZGRlbicpO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnbG9hZCcpO1xyXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB2YXIgbGlnaHRCb3hSZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IG9wdGlvbnMud2lkdGggPyBvcHRpb25zLndpZHRoIDogcHNEaW1lbnNpb25zLndpZHRoO1xyXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyBvcHRpb25zLmhlaWdodCA6IHBzRGltZW5zaW9ucy5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcclxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcclxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnOHB4JztcclxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS53aWR0aCA9IHdpdGhEZWZhdWx0UFhVbml0KHdpZHRoKTtcclxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSB3aXRoRGVmYXVsdFBYVW5pdChoZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lcldpZHRoID0gbGlnaHRCb3hFbGVtZW50LmNsaWVudFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gbGlnaHRCb3hFbGVtZW50LmNsaWVudEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb250ZW50V2lkdGggPSBvdXRlcldpZHRoKGxpZ2h0Qm94Q29udGVudEVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgY29udGVudEhlaWdodCA9IG91dGVySGVpZ2h0KGxpZ2h0Qm94Q29udGVudEVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGhvck1hcmdpbiA9IGNvbnRlbnRXaWR0aCAtIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQub2Zmc2V0V2lkdGgsXHJcbiAgICAgICAgICAgICAgICB2ZXJ0TWFyZ2luID0gY29udGVudEhlaWdodCAtIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgdmFyIGhvckRpZmYgPSBjb250YWluZXJXaWR0aCAtIGNvbnRlbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgIHZlcnREaWZmID0gY29udGFpbmVySGVpZ2h0IC0gY29udGVudEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIGlmIChob3JEaWZmIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS53aWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gaG9yTWFyZ2luICsgJ3B4JztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubGVmdCA9IE1hdGgucm91bmQoaG9yRGlmZiAvIDIpICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHZlcnREaWZmIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSB2ZXJ0TWFyZ2luICsgJ3B4JztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUudG9wID0gTWF0aC5yb3VuZCh2ZXJ0RGlmZiAvIDIpICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplID0gSGVscGVycy5vbmNlKGxpZ2h0Qm94UmVzaXplLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3V0ZXJXaWR0aChlbCkge1xyXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XHJcblxyXG4gICAgICAgICAgICB3aWR0aCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0KSArIHBhcnNlSW50KHN0eWxlLm1hcmdpblJpZ2h0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3V0ZXJIZWlnaHQoZWwpIHtcclxuICAgICAgICAgICAgdmFyIGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcclxuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XHJcblxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYm9keVN0eWxlcztcclxuICAgICAgICB2YXIgaGlkZVNjcm9sbGJhciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGJvZHlTdHlsZXMgPSBIZWxwZXJzLnppcE9iamVjdChbJ292ZXJmbG93JywgJ3BhZGRpbmdSaWdodCddLm1hcChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2tleSwgZ2V0Q29tcHV0ZWRTdHlsZShib2R5RWxlbWVudClba2V5XV07XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChnbG9iYWwud2luZG93LmlubmVyV2lkdGggPiBvdXRlcldpZHRoKGJvZHlFbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJvZHlQYWQgPSBwYXJzZUludCgoZ2V0Q29tcHV0ZWRTdHlsZShib2R5RWxlbWVudClbJ3BhZGRpbmdSaWdodCddIHx8IDApLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW47JztcclxuICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IHdpdGhEZWZhdWx0UFhVbml0KGJvZHlQYWQgKyB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB2YXIgcmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhib2R5U3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlW2tleV0gPSBib2R5U3R5bGVzW2tleV07XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHNob3dTcGlubmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBoaWRlU3Bpbm5lciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2FkVGltZXI7XHJcbiAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gIShvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSA/IChvcHRpb25zLnJlc2l6ZVRpbWVvdXQgfHwgMzAwMDApIDogMTAwMDsgLy8gMzAwMDAgaWYgcHNEaW1lbnNpb25zIHdpbGwgbm90IGFycml2ZSBhbmQgY3VzdG9tIHRpbWVvdXQgaXMgbm90IHByb3ZpZGVkXHJcbiAgICAgICAgICAgIGxvYWRUaW1lciA9IGdsb2JhbC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93Q29udGVudCgpO1xyXG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcclxuICAgICAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBpZnJhbWVXaW5kb3cgPSBsaWdodEJveElmcmFtZUVsZW1lbnQuY29udGVudFdpbmRvdyB8fCBsaWdodEJveElmcmFtZUVsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vIENyb3NzLXdpbmRvdyBjb21tdW5pY2F0aW9uXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKGlmcmFtZVdpbmRvdyk7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zJywgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICBzaG93Q29udGVudCgpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zJywgKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBldmVudC5kZXRhaWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5kaW1lbnNpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHNEaW1lbnNpb25zID0gSGVscGVycy56aXBPYmplY3QoWyd3aWR0aCcsICdoZWlnaHQnXS5tYXAoZnVuY3Rpb24gKGRpbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2RpbSwgTWF0aC5tYXgoTUlOX1BTX0RJTUVOU0lPTlNbZGltXSB8fCAwLCBkYXRhLmRpbWVuc2lvbnNbZGltXSB8fCAwKSArICdweCddO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCd3aWRnZXQtZGV0ZWN0aW9uJywgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBsaWdodEJveE9wdGlvbnM6IG9wdGlvbnN9KTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3dpZGdldC1jbG9zZScsIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xyXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignc3RhdHVzJywgKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZXZlbnQuZGV0YWlsKTtcclxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgLy8gUmVzaXplXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoaGFuZGxlUmVzaXplRXZlbnROYW1lLCBsaWdodEJveFJlc2l6ZSk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZUdsb2JhbFJlc2l6ZSk7XHJcblxyXG4gICAgICAgIC8vIENsZWFuIHVwIGFmdGVyIGNsb3NlXHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZigpO1xyXG4gICAgICAgICAgICBib2R5RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGhhbmRsZUtleXVwRXZlbnROYW1lLCBIYW5kbGVCb3VuZFNwZWNpZmljS2V5dXApXHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGFuZGxlR2xvYmFsS2V5dXApO1xyXG5cclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZUdsb2JhbFJlc2l6ZSlcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSwgbGlnaHRCb3hSZXNpemUpO1xyXG4gICAgICAgICAgICBsaWdodEJveEVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsaWdodEJveEVsZW1lbnQpO1xyXG4gICAgICAgICAgICByZXNldFNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB0aGF0Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNob3dTcGlubmVyKCk7XHJcbiAgICAgICAgaGlkZVNjcm9sbGJhcigpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5jbG9zZUZyYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm1vZGFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24uYXBwbHkodGhpcy5ldmVudE9iamVjdCwgYXJndW1lbnRzKTtcclxuICAgIH07XHJcblxyXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZi5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBMaWdodEJveC5wcm90b3R5cGUuZ2V0UG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcclxuICAgIH07XHJcblxyXG4gICAgTGlnaHRCb3guX05BTUVTUEFDRSA9ICcueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94JztcclxuXHJcbiAgICByZXR1cm4gTGlnaHRCb3g7XHJcbn0pKCk7XHJcbiIsImZ1bmN0aW9uIG9iamVjdEFzc2lnbigpIHtcclxuICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduIFBvbHlmaWxsXHJcbiAgT2JqZWN0LmFzc2lnbnx8T2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdCxcImFzc2lnblwiLHtlbnVtZXJhYmxlOiExLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTpmdW5jdGlvbihlLHIpe1widXNlIHN0cmljdFwiO2lmKG51bGw9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdFwiKTtmb3IodmFyIHQ9T2JqZWN0KGUpLG49MTtuPGFyZ3VtZW50cy5sZW5ndGg7bisrKXt2YXIgbz1hcmd1bWVudHNbbl07aWYobnVsbCE9bylmb3IodmFyIGE9T2JqZWN0LmtleXMoT2JqZWN0KG8pKSxjPTAsYj1hLmxlbmd0aDtjPGI7YysrKXt2YXIgaT1hW2NdLGw9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLGkpO3ZvaWQgMCE9PWwmJmwuZW51bWVyYWJsZSYmKHRbaV09b1tpXSl9fXJldHVybiB0fX0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcnJheUZvckVhY2goKSB7XHJcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2h8fChBcnJheS5wcm90b3R5cGUuZm9yRWFjaD1mdW5jdGlvbihyLG8pe3ZhciB0LG47aWYobnVsbD09dGhpcyl0aHJvdyBuZXcgVHlwZUVycm9yKFwiIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZFwiKTt2YXIgZT1PYmplY3QodGhpcyksaT1lLmxlbmd0aD4+PjA7aWYoXCJmdW5jdGlvblwiIT10eXBlb2Ygcil0aHJvdyBuZXcgVHlwZUVycm9yKHIrXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7Zm9yKGFyZ3VtZW50cy5sZW5ndGg+MSYmKHQ9byksbj0wO248aTspe3ZhciBmO24gaW4gZSYmKGY9ZVtuXSxyLmNhbGwodCxmLG4sZSkpLG4rK319KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlQb2x5ZmlsbHMoKSB7XHJcbiAgb2JqZWN0QXNzaWduKCk7XHJcbiAgYXJyYXlGb3JFYWNoKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGFwcGx5UG9seWZpbGxzOiBhcHBseVBvbHlmaWxsc1xyXG59XHJcbiIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpIHtcclxuICAgICAgICByZXR1cm4gUG9zdE1lc3NhZ2UuX05BTUVTUEFDRSArICdfJyArIGV2ZW50TmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBQb3N0TWVzc2FnZSh3aW5kb3cpIHtcclxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzLCB3cmFwRXZlbnRJbk5hbWVzcGFjZSk7XHJcbiAgICAgICAgdGhpcy5saW5rZWRXaW5kb3cgPSB3aW5kb3c7XHJcblxyXG4gICAgICAgIGdsb2JhbC53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiBnbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5saW5rZWRXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB7fTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudC5kYXRhID09PSAnc3RyaW5nJyAmJiBnbG9iYWwuSlNPTiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBnbG9iYWwuSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyKG1lc3NhZ2UuY29tbWFuZCwgbWVzc2FnZS5kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXHJcbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBudWxsO1xyXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLmxpbmtlZFdpbmRvdyA9IG51bGw7XHJcblxyXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xyXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihjb21tYW5kLCBkYXRhLCB0YXJnZXRPcmlnaW4pIHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXRPcmlnaW4gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0YXJnZXRPcmlnaW4gPSAnKic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMubGlua2VkV2luZG93IHx8IHRoaXMubGlua2VkV2luZG93LnBvc3RNZXNzYWdlID09PSB1bmRlZmluZWQgfHwgZ2xvYmFsLndpbmRvdy5KU09OID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5saW5rZWRXaW5kb3cucG9zdE1lc3NhZ2UoZ2xvYmFsLkpTT04uc3RyaW5naWZ5KHtkYXRhOiBkYXRhLCBjb21tYW5kOiBjb21tYW5kfSksIHRhcmdldE9yaWdpbik7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlLCBvcHRpb25zKTtcclxuICAgIH07XHJcblxyXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG5cclxuICAgIFBvc3RNZXNzYWdlLl9OQU1FU1BBQ0UgPSAnUE9TVF9NRVNTQUdFJztcclxuXHJcblxyXG4gICAgcmV0dXJuIFBvc3RNZXNzYWdlO1xyXG59KSgpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyB3aWR0aD1cXFwiNDdweFxcXCIgaGVpZ2h0PVxcXCI0N3B4XFxcIiBjbGFzcz1cXFwic3Bpbm5lci1yb3VuZFxcXCI+PHBhdGggZD1cXFwiTTQuNzg1MjcyOCwxMC40MjEwODc1IEMyLjk0MTExNjY0LDEzLjA1NTIxOTcgMS42Mzc3NzEwOSwxNi4wOTQ2MTA2IDEuMDM3NTM5NTYsMTkuMzc2ODU1NiBMNS4xNjYzODk3MSwxOS4zNzY4NTU2IEM1LjY0Mjk2MTUsMTcuMTg3NTU0IDYuNTAxMjUyNDMsMTUuMTM5MTY0IDcuNjY3Njg4OTksMTMuMzA1MzA1IEw1Ljk1NTcyNDI4LDExLjU5MjI3MDUgTDQuNzg1MjcyOCwxMC40MjEwODc1IEw0Ljc4NTI3MjgsMTAuNDIxMDg3NSBaIE0xMC40NjkzMDQ4LDQuNzQ1NjU2MTUgQzEzLjEyNzQ4NzMsMi44OTA4MDYxIDE2LjE5NjU5NzYsMS41ODY3NDY0OCAxOS41MTAwMTYxLDEgTDE5LjUxMDAxNjEsNC45OTUyMzkzNCBDMTcuMjcxMDkyMyw1LjQ4Nzk3NzgyIDE1LjE4MDMxOTMsNi4zODA4NTI5IDEzLjMxNjY5MDcsNy41OTQ4MjE1MyBMMTEuNjMzNzMzOSw1LjkxMDgxMjkzIEwxMC40NjkzMDQ4LDQuNzQ1NjU2MTUgTDEwLjQ2OTMwNDgsNC43NDU2NTYxNSBaIE00Mi4yNDI2MzA5LDM2LjUzODgzODYgQzQ0LjExMTI3ODIsMzMuODU3NTAxNiA0NS40MjA2NDYxLDMwLjc1ODE1MDQgNDYsMjcuNDExNzI2OSBMNDEuOTQ0MTIxMSwyNy40MTE3MjY5IEM0MS40NTI3OTQ1LDI5LjY2MTg5MjYgNDAuNTU4MzY5MiwzMS43NjI5MTEgMzkuMzQwNDQxMiwzMy42MzQ5MzU2IEw0MS4wMzMyMzQ3LDM1LjMyODc4NjkgTDQyLjI0MjUzMDYsMzYuNTM4ODM4NiBMNDIuMjQyNjMwOSwzNi41Mzg4Mzg2IFogTTM2LjU3MDc0NDEsNDIuMjI2NDIyNyBDMzMuOTE2Nzc3Myw0NC4wODY3OTY3IDMwLjg1MDk3OTMsNDUuMzk3Mjg0MiAyNy41Mzk4NjkzLDQ1Ljk5MTE2MTYgTDI3LjUzOTg2OTMsNDEuNzk2MDU0OSBDMjkuNzM3NjQwMiw0MS4zMjAyOTAxIDMxLjc5MzY4NDEsNDAuNDU5MzUzNiAzMy42MzM2MjQ2LDM5LjI4NzU2OCBMMzUuMzU1NDI1OCw0MS4wMTA0NDUzIEwzNi41NzA3NDQxLDQyLjIyNjUyMzEgTDM2LjU3MDc0NDEsNDIuMjI2NDIyNyBaIE00LjcxMTc5OTY1LDM2LjQ3MzE1MzUgQzIuODY3NDQyNzQsMzMuODA2OTgyMyAxLjU3NDYzNjM3LDMwLjczMDkzMjIgMSwyNy40MTE4MjczIEw1LjE2ODg5OTA0LDI3LjQxMTgyNzMgQzUuNjQ4MjgxMjgsMjkuNjA3MzU1OSA2LjUxMTU5MDg3LDMxLjY2MTA2OSA3LjY4NDY1MjA1LDMzLjQ5ODQ0MzIgTDUuOTU1NzI0MjgsMzUuMjI4NDUxNSBMNC43MTE3OTk2NSwzNi40NzMxNTM1IEw0LjcxMTc5OTY1LDM2LjQ3MzE1MzUgWiBNMTAuMzY0MDEzMyw0Mi4xODA0MjMgQzEzLjA0NjI4NTQsNDQuMDc0NTQzNSAxNi4xNTI3MzQ1LDQ1LjQwNTUyIDE5LjUxMDExNjUsNDYgTDE5LjUxMDExNjUsNDEuNzgyMTk0NyBDMTcuMjgxNzMxOSw0MS4yOTE2NjU4IDE1LjIwMDA5MjgsNDAuNDA0ODE2OSAxMy4zNDMwODg5LDM5LjE5OTU4NjIgTDExLjYzMzczMzksNDAuOTEwMDA5NCBMMTAuMzY0MDEzMyw0Mi4xODA1MjM1IEwxMC4zNjQwMTMzLDQyLjE4MDQyMyBaIE00Mi4xNjg4NTY3LDEwLjM1NTcwMzggQzQ0LjAzNzMwMzEsMTMuMDA0ODAwOCA0NS4zNTc0MTEsMTYuMDY3NDkyOSA0NS45NjI2NjEyLDE5LjM3Njg1NTYgTDQxLjk0NjkzMTYsMTkuMzc2ODU1NiBDNDEuNDU4NTE1OCwxNy4xMzI4MTY0IDQwLjU2OTIwOTUsMTUuMDM2OTIwMiAzOS4zNTgwMDY1LDEzLjE2ODQxMDkgTDQxLjAzMzUzNTgsMTEuNDkxODM0NiBMNDIuMTY4OTU3LDEwLjM1NTcwMzggTDQyLjE2ODg1NjcsMTAuMzU1NzAzOCBaIE0zNi40NjUxNTE2LDQuNjk5OTU3ODIgQzMzLjgzNTU3NTQsMi44Nzg2NTMzNiAzMC44MDcxMTYyLDEuNTk0ODgxNzkgMjcuNTQwMDcwMSwxLjAwODgzODM2IEwyNy41NDAwNzAxLDQuOTgxMTc4MzEgQzI5Ljc0ODQ4MDUsNS40NTkxNTI3MiAzMS44MTM3NTg3LDYuMzI2MDE0OSAzMy42NjA0MjQyLDcuNTA2NDM3OTQgTDM1LjM1NTUyNjIsNS44MTAyNzY2IEwzNi40NjUxNTE2LDQuNjk5OTU3ODIgTDM2LjQ2NTE1MTYsNC42OTk5NTc4MiBaXFxcIiBmaWxsPVxcXCIjQ0NDQ0NDXFxcIj48L3BhdGg+PC9zdmc+XCI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyBjbGFzcz1cXFwic3Bpbm5lci14c29sbGFcXFwiIHdpZHRoPVxcXCI1NlxcXCIgaGVpZ2h0PVxcXCI1NVxcXCI+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLXhcXFwiIGQ9XFxcIk0yMS4wMyA1LjA0MmwtMi4xMTItMi4xNTYtMy42NTcgMy42OTUtMy42NTctMy42OTUtMi4xMTIgMi4xNTYgMy42NTkgMy42NzMtMy42NTkgMy42OTYgMi4xMTIgMi4xNTcgMy42NTctMy42OTcgMy42NTcgMy42OTcgMi4xMTItMi4xNTctMy42NDgtMy42OTYgMy42NDgtMy42NzN6XFxcIiBmaWxsPVxcXCIjRjI1NDJEXFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLXNcXFwiIGQ9XFxcIk00MS4yMzIgNi44OTZsMi45NDEtMi45NzQtMi4xMzQtMi4xMzItMi45MiAyLjk3My0uMDA1LS4wMDgtMi4xMzQgMi4xMzUuMDA1LjAwOC0uMDA1LjAwNSAzLjc5MiAzLjgyLTIuOTE1IDIuOTQ3IDIuMTEyIDIuMTU2IDUuMDYtNS4xMTEtMy43OTgtMy44MTYuMDAxLS4wMDF6XFxcIiBmaWxsPVxcXCIjRkNDQTIwXFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLW9cXFwiIGQ9XFxcIk00OC4wNjYgMjkuMTU5Yy0xLjUzNiAwLTIuNzYxIDEuMjYzLTIuNzYxIDIuNzkgMCAxLjUyNCAxLjIyNiAyLjc2NSAyLjc2MSAyLjc2NSAxLjUwOSAwIDIuNzM2LTEuMjQyIDIuNzM2LTIuNzY1IDAtMS41MjYtMS4yMjctMi43OS0yLjczNi0yLjc5bTAgOC41OTNjLTMuMTc5IDAtNS43NzEtMi41OTQtNS43NzEtNS44MDQgMC0zLjIxMyAyLjU5Mi01LjgwOCA1Ljc3MS01LjgwOCAzLjE1NSAwIDUuNzQ1IDIuNTk0IDUuNzQ1IDUuODA4IDAgMy4yMS0yLjU4OSA1LjgwNC01Ljc0NSA1LjgwNFxcXCIgZmlsbD1cXFwiIzhDM0VBNFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1sXFxcIiBkPVxcXCJNMjQuMzg5IDQyLjMyM2gyLjk5djEwLjQzN2gtMi45OXYtMTAuNDM3em00LjMzNCAwaDIuOTg5djEwLjQzN2gtMi45ODl2LTEwLjQzN3pcXFwiIGZpbGw9XFxcIiNCNURDMjBcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtYVxcXCIgZD1cXFwiTTcuNzk2IDMxLjg5OGwxLjQwNCAyLjQ1N2gtMi44MzVsMS40MzEtMi40NTdoLS4wMDF6bS0uMDAxLTUuNzU3bC02LjM2MyAxMS4xMDJoMTIuNzAzbC02LjM0MS0xMS4xMDJ6XFxcIiBmaWxsPVxcXCIjNjZDQ0RBXFxcIj48L3BhdGg+PC9zdmc+XCI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3Nhc3NpZnknKSgnLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveHtwb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7Ym90dG9tOjA7cmlnaHQ6MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlOy13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW4gMC4xNXM7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW4gMC4xNXN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1vdmVybGF5e3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowO3otaW5kZXg6MX0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWNvbnRlbnR7cG9zaXRpb246cmVsYXRpdmU7dG9wOjA7bGVmdDowO3otaW5kZXg6M30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWNvbnRlbnRfX2hpZGRlbnt2aXNpYmlsaXR5OmhpZGRlbjt6LWluZGV4Oi0xfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudC1pZnJhbWV7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50fS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lcntwb3NpdGlvbjphYnNvbHV0ZTt0b3A6NTAlO2xlZnQ6NTAlO2Rpc3BsYXk6bm9uZTt6LWluZGV4OjI7cG9pbnRlci1ldmVudHM6bm9uZX0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhe3dpZHRoOjU2cHg7aGVpZ2h0OjU1cHg7bWFyZ2luLXRvcDotMjhweDttYXJnaW4tbGVmdDotMjZweH0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS14LC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXMsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtbywueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1sLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWF7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5IDFzIGluZmluaXRlIGVhc2UtaW4tb3V0Oy13ZWJraXQtYW5pbWF0aW9uLWZpbGwtbW9kZTpib3RoO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXkgMXMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7YW5pbWF0aW9uLWZpbGwtbW9kZTpib3RofS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXh7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6MHM7YW5pbWF0aW9uLWRlbGF5OjBzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXN7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjJzO2FuaW1hdGlvbi1kZWxheTouMnN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtb3std2Via2l0LWFuaW1hdGlvbi1kZWxheTouNHM7YW5pbWF0aW9uLWRlbGF5Oi40c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1sey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi42czthbmltYXRpb24tZGVsYXk6LjZzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWF7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjhzO2FuaW1hdGlvbi1kZWxheTouOHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXJvdW5ke21hcmdpbi10b3A6LTIzcHg7bWFyZ2luLWxlZnQ6LTIzcHg7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gM3MgaW5maW5pdGUgbGluZWFyO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXJ9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLWN1c3RvbXstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiBpbmZpbml0ZSBsaW5lYXI7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIGluZmluaXRlIGxpbmVhcn1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5ezAlLDgwJSwxMDAle29wYWNpdHk6MH00MCV7b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheXswJSw4MCUsMTAwJXtvcGFjaXR5OjB9NDAle29wYWNpdHk6MX19QC13ZWJraXQta2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW57ZnJvbXtvcGFjaXR5OjB9dG97b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW57ZnJvbXtvcGFjaXR5OjB9dG97b3BhY2l0eToxfX1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW57ZnJvbXstd2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMGRlZyl9dG97LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW57ZnJvbXt0cmFuc2Zvcm06cm90YXRlKDBkZWcpfXRve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19ICAvKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV3b0pJblpsY25OcGIyNGlPaUF6TEFvSkltWnBiR1VpT2lBaWJHbG5hSFJpYjNndWMyTnpjeUlzQ2draWMyOTFjbU5sY3lJNklGc0tDUWtpYkdsbmFIUmliM2d1YzJOemN5SUtDVjBzQ2draWMyOTFjbU5sYzBOdmJuUmxiblFpT2lCYkNna0pJaVJzYVdkb2RHSnZlQzF3Y21WbWFYZzZJQ2Q0Y0dGNWMzUmhkR2x2YmkxM2FXUm5aWFF0YkdsbmFIUmliM2duTzF4eVhHNGtiR2xuYUhSaWIzZ3RZMnhoYzNNNklDY3VKeUFySUNSc2FXZG9kR0p2ZUMxd2NtVm1hWGc3WEhKY2JseHlYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzBnZTF4eVhHNGdJSEJ2YzJsMGFXOXVPaUJtYVhobFpEdGNjbHh1SUNCMGIzQTZJREE3WEhKY2JpQWdiR1ZtZERvZ01EdGNjbHh1SUNCaWIzUjBiMjA2SURBN1hISmNiaUFnY21sbmFIUTZJREE3WEhKY2JpQWdkMmxrZEdnNklERXdNQ1U3WEhKY2JpQWdhR1ZwWjJoME9pQXhNREFsTzF4eVhHNGdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVPaUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFdaaFpHVnBiaUF1TVRWek8xeHlYRzRnSUdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMW1ZV1JsYVc0Z0xqRTFjenRjY2x4dWZWeHlYRzVjY2x4dUkzc2tiR2xuYUhSaWIzZ3RZMnhoYzNOOUxXOTJaWEpzWVhrZ2UxeHlYRzRnSUhCdmMybDBhVzl1T2lCaFluTnZiSFYwWlR0Y2NseHVJQ0IwYjNBNk1EdGNjbHh1SUNCc1pXWjBPaUF3TzF4eVhHNGdJR0p2ZEhSdmJUb2dNRHRjY2x4dUlDQnlhV2RvZERvZ01EdGNjbHh1SUNCNkxXbHVaR1Y0T2lBeE8xeHlYRzU5WEhKY2JseHlYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzB0WTI5dWRHVnVkQ0I3WEhKY2JpQWdjRzl6YVhScGIyNDZJSEpsYkdGMGFYWmxPMXh5WEc0Z0lIUnZjRG9nTUR0Y2NseHVJQ0JzWldaME9pQXdPMXh5WEc0Z0lIb3RhVzVrWlhnNklETTdYSEpjYm4xY2NseHVYSEpjYmlON0pHeHBaMmgwWW05NExXTnNZWE56ZlMxamIyNTBaVzUwWDE5b2FXUmtaVzRnZTF4eVhHNGdJSFpwYzJsaWFXeHBkSGs2SUdocFpHUmxianRjY2x4dUlDQjZMV2x1WkdWNE9pQXRNVHRjY2x4dWZWeHlYRzVjY2x4dUkzc2tiR2xuYUhSaWIzZ3RZMnhoYzNOOUxXTnZiblJsYm5RdGFXWnlZVzFsSUh0Y2NseHVJQ0IzYVdSMGFEb2dNVEF3SlR0Y2NseHVJQ0JvWldsbmFIUTZJREV3TUNVN1hISmNiaUFnWW05eVpHVnlPaUF3TzF4eVhHNGdJR0poWTJ0bmNtOTFibVE2SUhSeVlXNXpjR0Z5Wlc1ME8xeHlYRzU5WEhKY2JseHlYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzB0YzNCcGJtNWxjaUI3WEhKY2JpQWdjRzl6YVhScGIyNDZJR0ZpYzI5c2RYUmxPMXh5WEc0Z0lIUnZjRG9nTlRBbE8xeHlYRzRnSUd4bFpuUTZJRFV3SlR0Y2NseHVJQ0JrYVhOd2JHRjVPaUJ1YjI1bE8xeHlYRzRnSUhvdGFXNWtaWGc2SURJN1hISmNiaUFnY0c5cGJuUmxjaTFsZG1WdWRITTZJRzV2Ym1VN1hISmNibHh5WEc0Z0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVNCN1hISmNiaUFnSUNCM2FXUjBhRG9nTlRad2VEdGNjbHh1SUNBZ0lHaGxhV2RvZERvZ05UVndlRHRjY2x4dUlDQWdJRzFoY21kcGJqb2dlMXh5WEc0Z0lDQWdJQ0IwYjNBNklDMHlPSEI0TzF4eVhHNGdJQ0FnSUNCc1pXWjBPaUF0TWpad2VEdGNjbHh1SUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRlQ3dnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMWE1zSUM1emNHbHVibVZ5TFhoemIyeHNZUzF2TENBdWMzQnBibTVsY2kxNGMyOXNiR0V0YkN3Z0xuTndhVzV1WlhJdGVITnZiR3hoTFdFZ2UxeHlYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFpYjNWdVkyVmtaV3hoZVNBeGN5QnBibVpwYm1sMFpTQmxZWE5sTFdsdUxXOTFkRHRjY2x4dUlDQWdJQ0FnTFhkbFltdHBkQzFoYm1sdFlYUnBiMjR0Wm1sc2JDMXRiMlJsT2lCaWIzUm9PMXh5WEc0Z0lDQWdJQ0JoYm1sdFlYUnBiMjQ2SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdFltOTFibU5sWkdWc1lYa2dNWE1nYVc1bWFXNXBkR1VnWldGelpTMXBiaTF2ZFhRN1hISmNiaUFnSUNBZ0lHRnVhVzFoZEdsdmJpMW1hV3hzTFcxdlpHVTZJR0p2ZEdnN1hISmNiaUFnSUNCOVhISmNibHh5WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExYZ2dlMXh5WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dNSE03WEhKY2JpQWdJQ0FnSUdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTUhNN1hISmNiaUFnSUNCOVhISmNibHh5WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExYTWdlMXh5WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMakp6TzF4eVhHNGdJQ0FnSUNCaGJtbHRZWFJwYjI0dFpHVnNZWGs2SUM0eWN6dGNjbHh1SUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRieUI3WEhKY2JpQWdJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF1TkhNN1hISmNiaUFnSUNBZ0lHRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqUnpPMXh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUM1emNHbHVibVZ5TFhoemIyeHNZUzFzSUh0Y2NseHVJQ0FnSUNBZ0xYZGxZbXRwZEMxaGJtbHRZWFJwYjI0dFpHVnNZWGs2SUM0MmN6dGNjbHh1SUNBZ0lDQWdZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVObk03WEhKY2JpQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0xuTndhVzV1WlhJdGVITnZiR3hoTFdFZ2UxeHlYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqaHpPMXh5WEc0Z0lDQWdJQ0JoYm1sdFlYUnBiMjR0WkdWc1lYazZJQzQ0Y3p0Y2NseHVJQ0FnSUgxY2NseHVJQ0I5WEhKY2JseHlYRzRnSUM1emNHbHVibVZ5TFhKdmRXNWtJSHRjY2x4dUlDQWdJRzFoY21kcGJqb2dlMXh5WEc0Z0lDQWdJQ0IwYjNBNklDMHlNM0I0TzF4eVhHNGdJQ0FnSUNCc1pXWjBPaUF0TWpOd2VEdGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dU9pQWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z00zTWdhVzVtYVc1cGRHVWdiR2x1WldGeU8xeHlYRzRnSUNBZ1lXNXBiV0YwYVc5dU9pQWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z00zTWdhVzVtYVc1cGRHVWdiR2x1WldGeU8xeHlYRzRnSUgxY2NseHVYSEpjYmlBZ0xuTndhVzV1WlhJdFkzVnpkRzl0SUh0Y2NseHVJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnYVc1bWFXNXBkR1VnYkdsdVpXRnlPMXh5WEc0Z0lDQWdZVzVwYldGMGFXOXVPaUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFhOd2FXNGdhVzVtYVc1cGRHVWdiR2x1WldGeU8xeHlYRzRnSUgxY2NseHVmVnh5WEc1Y2NseHVRQzEzWldKcmFYUXRhMlY1Wm5KaGJXVnpJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0WW05MWJtTmxaR1ZzWVhrZ2UxeHlYRzRnSURBbExDQTRNQ1VzSURFd01DVWdleUJ2Y0dGamFYUjVPaUF3T3lCOVhISmNiaUFnTkRBbElIc2diM0JoWTJsMGVUb2dNU0I5WEhKY2JuMWNjbHh1WEhKY2JrQnJaWGxtY21GdFpYTWdJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFpYjNWdVkyVmtaV3hoZVNCN1hISmNiaUFnTUNVc0lEZ3dKU3dnTVRBd0pTQjdJRzl3WVdOcGRIazZJREE3SUgxY2NseHVJQ0EwTUNVZ2V5QnZjR0ZqYVhSNU9pQXhPeUI5WEhKY2JuMWNjbHh1WEhKY2JrQXRkMlZpYTJsMExXdGxlV1p5WVcxbGN5QWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMV1poWkdWcGJpQjdYSEpjYmlBZ1puSnZiU0I3SUc5d1lXTnBkSGs2SURBN0lIMWNjbHh1SUNCMGJ5QjdJRzl3WVdOcGRIazZJREU3SUgxY2NseHVmVnh5WEc1Y2NseHVRR3RsZVdaeVlXMWxjeUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFdaaFpHVnBiaUI3WEhKY2JpQWdabkp2YlNCN0lHOXdZV05wZEhrNklEQTdJSDFjY2x4dUlDQjBieUI3SUc5d1lXTnBkSGs2SURFN0lIMWNjbHh1ZlZ4eVhHNWNjbHh1UUMxM1pXSnJhWFF0YTJWNVpuSmhiV1Z6SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdGMzQnBiaUI3WEhKY2JpQWdabkp2YlNCN0lDMTNaV0pyYVhRdGRISmhibk5tYjNKdE9pQnliM1JoZEdVb01HUmxaeWs3SUgxY2NseHVJQ0IwYnlCN0lDMTNaV0pyYVhRdGRISmhibk5tYjNKdE9pQnliM1JoZEdVb016WXdaR1ZuS1RzZ2ZWeHlYRzU5WEhKY2JseHlYRzVBYTJWNVpuSmhiV1Z6SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdGMzQnBiaUI3WEhKY2JpQWdabkp2YlNCN0lIUnlZVzV6Wm05eWJUb2djbTkwWVhSbEtEQmtaV2NwT3lCOVhISmNiaUFnZEc4Z2V5QjBjbUZ1YzJadmNtMDZJSEp2ZEdGMFpTZ3pOakJrWldjcE95QjlYSEpjYm4xY2NseHVJZ29KWFN3S0NTSnRZWEJ3YVc1bmN5STZJQ0pCUVVkQkxFRkJRVUVzTkVKQlFUUkNMRUZCUVRWQ0xFTkJRMFVzVVVGQlVTeERRVUZGTEV0QlFVMHNRMEZEYUVJc1IwRkJSeXhEUVVGRkxFTkJRVVVzUTBGRFVDeEpRVUZKTEVOQlFVVXNRMEZCUlN4RFFVTlNMRTFCUVUwc1EwRkJSU3hEUVVGRkxFTkJRMVlzUzBGQlN5eERRVUZGTEVOQlFVVXNRMEZEVkN4TFFVRkxMRU5CUVVVc1NVRkJTeXhEUVVOYUxFMUJRVTBzUTBGQlJTeEpRVUZMTEVOQlEySXNhVUpCUVdsQ0xFTkJRVVVzYTBOQlFUQkNMRU5CUVZFc1MwRkJTU3hEUVVONlJDeFRRVUZUTEVOQlFVVXNhME5CUVRCQ0xFTkJRVkVzUzBGQlNTeERRVU5zUkN4QlFVVkVMRUZCUVVFc2IwTkJRVzlETEVGQlFYQkRMRU5CUTBVc1VVRkJVU3hEUVVGRkxGRkJRVk1zUTBGRGJrSXNSMEZCUnl4RFFVRkRMRU5CUVVVc1EwRkRUaXhKUVVGSkxFTkJRVVVzUTBGQlJTeERRVU5TTEUxQlFVMHNRMEZCUlN4RFFVRkZMRU5CUTFZc1MwRkJTeXhEUVVGRkxFTkJRVVVzUTBGRFZDeFBRVUZQTEVOQlFVVXNRMEZCUlN4RFFVTmFMRUZCUlVRc1FVRkJRU3h2UTBGQmIwTXNRVUZCY0VNc1EwRkRSU3hSUVVGUkxFTkJRVVVzVVVGQlV5eERRVU51UWl4SFFVRkhMRU5CUVVVc1EwRkJSU3hEUVVOUUxFbEJRVWtzUTBGQlJTeERRVUZGTEVOQlExSXNUMEZCVHl4RFFVRkZMRU5CUVVVc1EwRkRXaXhCUVVWRUxFRkJRVUVzTkVOQlFUUkRMRUZCUVRWRExFTkJRMFVzVlVGQlZTeERRVUZGTEUxQlFVOHNRMEZEYmtJc1QwRkJUeXhEUVVGRkxFVkJRVWNzUTBGRFlpeEJRVVZFTEVGQlFVRXNNa05CUVRKRExFRkJRVE5ETEVOQlEwVXNTMEZCU3l4RFFVRkZMRWxCUVVzc1EwRkRXaXhOUVVGTkxFTkJRVVVzU1VGQlN5eERRVU5pTEUxQlFVMHNRMEZCUlN4RFFVRkZMRU5CUTFZc1ZVRkJWU3hEUVVGRkxGZEJRVmtzUTBGRGVrSXNRVUZGUkN4QlFVRkJMRzlEUVVGdlF5eEJRVUZ3UXl4RFFVTkZMRkZCUVZFc1EwRkJSU3hSUVVGVExFTkJRMjVDTEVkQlFVY3NRMEZCUlN4SFFVRkpMRU5CUTFRc1NVRkJTU3hEUVVGRkxFZEJRVWtzUTBGRFZpeFBRVUZQTEVOQlFVVXNTVUZCU3l4RFFVTmtMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRMWdzWTBGQll5eERRVUZGTEVsQlFVc3NRMEYzUkhSQ0xFRkJPVVJFTEVGQlVVVXNiME5CVW10RExFTkJVV3hETEdWQlFXVXNRVUZCUXl4RFFVTmtMRXRCUVVzc1EwRkJSU3hKUVVGTExFTkJRMW9zVFVGQlRTeERRVUZGTEVsQlFVc3NRMEZEWWl4TlFVRk5MRUZCUVVNc1EwRkJReXhCUVVOT0xFZEJRVWNzUTBGQlJTeExRVUZOTEVOQlJHSXNUVUZCVFN4QlFVRkRMRU5CUVVNc1FVRkZUaXhKUVVGSkxFTkJRVVVzUzBGQlRTeERRV3REWml4QlFTOURTQ3hCUVdkQ1NTeHZRMEZvUW1kRExFTkJVV3hETEdWQlFXVXNRMEZSWWl4cFFrRkJhVUlzUTBGb1FuSkNMRUZCWjBKMVFpeHZRMEZvUW1Fc1EwRlJiRU1zWlVGQlpTeERRVkZOTEdsQ1FVRnBRaXhEUVdoQ2VFTXNRVUZuUWpCRExHOURRV2hDVGl4RFFWRnNReXhsUVVGbExFTkJVWGxDTEdsQ1FVRnBRaXhEUVdoQ00wUXNRVUZuUWpaRUxHOURRV2hDZWtJc1EwRlJiRU1zWlVGQlpTeERRVkUwUXl4cFFrRkJhVUlzUTBGb1FqbEZMRUZCWjBKblJpeHZRMEZvUWpWRExFTkJVV3hETEdWQlFXVXNRMEZSSzBRc2FVSkJRV2xDTEVGQlFVTXNRMEZETlVZc2FVSkJRV2xDTEVOQlFVVXNkVU5CUVN0Q0xFTkJRV0VzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUTNSR0xESkNRVUV5UWl4RFFVRkZMRWxCUVVzc1EwRkRiRU1zVTBGQlV5eERRVUZGTEhWRFFVRXJRaXhEUVVGaExFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVTTVSU3h0UWtGQmJVSXNRMEZCUlN4SlFVRkxMRU5CUXpOQ0xFRkJja0pNTEVGQmRVSkpMRzlEUVhaQ1owTXNRMEZSYkVNc1pVRkJaU3hEUVdWaUxHbENRVUZwUWl4QlFVRkRMRU5CUTJoQ0xIVkNRVUYxUWl4RFFVRkZMRVZCUVVjc1EwRkROVUlzWlVGQlpTeERRVUZGTEVWQlFVY3NRMEZEY2tJc1FVRXhRa3dzUVVFMFFra3NiME5CTlVKblF5eERRVkZzUXl4bFFVRmxMRU5CYjBKaUxHbENRVUZwUWl4QlFVRkRMRU5CUTJoQ0xIVkNRVUYxUWl4RFFVRkZMRWRCUVVrc1EwRkROMElzWlVGQlpTeERRVUZGTEVkQlFVa3NRMEZEZEVJc1FVRXZRa3dzUVVGcFEwa3NiME5CYWtOblF5eERRVkZzUXl4bFFVRmxMRU5CZVVKaUxHbENRVUZwUWl4QlFVRkRMRU5CUTJoQ0xIVkNRVUYxUWl4RFFVRkZMRWRCUVVrc1EwRkROMElzWlVGQlpTeERRVUZGTEVkQlFVa3NRMEZEZEVJc1FVRndRMHdzUVVGelEwa3NiME5CZEVOblF5eERRVkZzUXl4bFFVRmxMRU5CT0VKaUxHbENRVUZwUWl4QlFVRkRMRU5CUTJoQ0xIVkNRVUYxUWl4RFFVRkZMRWRCUVVrc1EwRkROMElzWlVGQlpTeERRVUZGTEVkQlFVa3NRMEZEZEVJc1FVRjZRMHdzUVVFeVEwa3NiME5CTTBOblF5eERRVkZzUXl4bFFVRmxMRU5CYlVOaUxHbENRVUZwUWl4QlFVRkRMRU5CUTJoQ0xIVkNRVUYxUWl4RFFVRkZMRWRCUVVrc1EwRkROMElzWlVGQlpTeERRVUZGTEVkQlFVa3NRMEZEZEVJc1FVRTVRMHdzUVVGcFJFVXNiME5CYWtSclF5eERRV2xFYkVNc1kwRkJZeXhCUVVGRExFTkJRMklzVFVGQlRTeEJRVUZETEVOQlFVTXNRVUZEVGl4SFFVRkhMRU5CUVVVc1MwRkJUU3hEUVVSaUxFMUJRVTBzUVVGQlF5eERRVUZETEVGQlJVNHNTVUZCU1N4RFFVRkZMRXRCUVUwc1EwRkZaQ3hwUWtGQmFVSXNRMEZCUlN4blEwRkJkMElzUTBGQlRTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkRia1VzVTBGQlV5eERRVUZGTEdkRFFVRjNRaXhEUVVGTkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVTTFSQ3hCUVhoRVNDeEJRVEJFUlN4dlEwRXhSR3RETEVOQk1FUnNReXhsUVVGbExFRkJRVU1zUTBGRFpDeHBRa0ZCYVVJc1EwRkJSU3huUTBGQmQwSXNRMEZCVFN4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVOb1JTeFRRVUZUTEVOQlFVVXNaME5CUVhkQ0xFTkJRVTBzVVVGQlVTeERRVUZETEUxQlFVMHNRMEZEZWtRc1FVRkhTQ3hyUWtGQmEwSXNRMEZCYkVJc2RVTkJRV3RDTEVOQlEyaENMRUZCUVVFc1JVRkJSU3hEUVVGRkxFRkJRVUVzUjBGQlJ5eERRVUZGTEVGQlFVRXNTVUZCU1N4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRek5DTEVGQlFVRXNSMEZCUnl4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGSExFVkJSM0JDTEZWQlFWVXNRMEZCVml4MVEwRkJWU3hEUVVOU0xFRkJRVUVzUlVGQlJTeERRVUZGTEVGQlFVRXNSMEZCUnl4RFFVRkZMRUZCUVVFc1NVRkJTU3hEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVOQlF6TkNMRUZCUVVFc1IwRkJSeXhEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVWQlIyNUNMR3RDUVVGclFpeERRVUZzUWl4clEwRkJhMElzUTBGRGFFSXNRVUZCUVN4SlFVRkpMRU5CUVVjc1QwRkJUeXhEUVVGRkxFTkJRVVVzUTBGRGJFSXNRVUZCUVN4RlFVRkZMRU5CUVVjc1QwRkJUeXhEUVVGRkxFTkJRVVVzUlVGSGJFSXNWVUZCVlN4RFFVRldMR3REUVVGVkxFTkJRMUlzUVVGQlFTeEpRVUZKTEVOQlFVY3NUMEZCVHl4RFFVRkZMRU5CUVVVc1EwRkRiRUlzUVVGQlFTeEZRVUZGTEVOQlFVY3NUMEZCVHl4RFFVRkZMRU5CUVVVc1JVRkhiRUlzYTBKQlFXdENMRU5CUVd4Q0xHZERRVUZyUWl4RFFVTm9RaXhCUVVGQkxFbEJRVWtzUTBGQlJ5eHBRa0ZCYVVJc1EwRkJSU3haUVVGTkxFTkJRMmhETEVGQlFVRXNSVUZCUlN4RFFVRkhMR2xDUVVGcFFpeERRVUZGTEdOQlFVMHNSVUZIYUVNc1ZVRkJWU3hEUVVGV0xHZERRVUZWTEVOQlExSXNRVUZCUVN4SlFVRkpMRU5CUVVjc1UwRkJVeXhEUVVGRkxGbEJRVTBzUTBGRGVFSXNRVUZCUVN4RlFVRkZMRU5CUVVjc1UwRkJVeXhEUVVGRkxHTkJRVTBpTEFvSkltNWhiV1Z6SWpvZ1cxMEtmUT09ICovJyk7OyIsIm1vZHVsZS5leHBvcnRzID0gJzEuMi4xJztcclxuIiwiLyohXG4gKiBCb3dzZXIgLSBhIGJyb3dzZXIgZGV0ZWN0b3JcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm93c2VyXG4gKiBNSVQgTGljZW5zZSB8IChjKSBEdXN0aW4gRGlheiAyMDE1XG4gKi9cblxuIWZ1bmN0aW9uIChyb290LCBuYW1lLCBkZWZpbml0aW9uKSB7XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKG5hbWUsIGRlZmluaXRpb24pXG4gIGVsc2Ugcm9vdFtuYW1lXSA9IGRlZmluaXRpb24oKVxufSh0aGlzLCAnYm93c2VyJywgZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICAqIFNlZSB1c2VyYWdlbnRzLmpzIGZvciBleGFtcGxlcyBvZiBuYXZpZ2F0b3IudXNlckFnZW50XG4gICAgKi9cblxuICB2YXIgdCA9IHRydWVcblxuICBmdW5jdGlvbiBkZXRlY3QodWEpIHtcblxuICAgIGZ1bmN0aW9uIGdldEZpcnN0TWF0Y2gocmVnZXgpIHtcbiAgICAgIHZhciBtYXRjaCA9IHVhLm1hdGNoKHJlZ2V4KTtcbiAgICAgIHJldHVybiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaFsxXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2Vjb25kTWF0Y2gocmVnZXgpIHtcbiAgICAgIHZhciBtYXRjaCA9IHVhLm1hdGNoKHJlZ2V4KTtcbiAgICAgIHJldHVybiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaFsyXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgdmFyIGlvc2RldmljZSA9IGdldEZpcnN0TWF0Y2goLyhpcG9kfGlwaG9uZXxpcGFkKS9pKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIGxpa2VBbmRyb2lkID0gL2xpa2UgYW5kcm9pZC9pLnRlc3QodWEpXG4gICAgICAsIGFuZHJvaWQgPSAhbGlrZUFuZHJvaWQgJiYgL2FuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBuZXh1c01vYmlsZSA9IC9uZXh1c1xccypbMC02XVxccyovaS50ZXN0KHVhKVxuICAgICAgLCBuZXh1c1RhYmxldCA9ICFuZXh1c01vYmlsZSAmJiAvbmV4dXNcXHMqWzAtOV0rL2kudGVzdCh1YSlcbiAgICAgICwgY2hyb21lb3MgPSAvQ3JPUy8udGVzdCh1YSlcbiAgICAgICwgc2lsayA9IC9zaWxrL2kudGVzdCh1YSlcbiAgICAgICwgc2FpbGZpc2ggPSAvc2FpbGZpc2gvaS50ZXN0KHVhKVxuICAgICAgLCB0aXplbiA9IC90aXplbi9pLnRlc3QodWEpXG4gICAgICAsIHdlYm9zID0gLyh3ZWJ8aHB3KShvfDApcy9pLnRlc3QodWEpXG4gICAgICAsIHdpbmRvd3NwaG9uZSA9IC93aW5kb3dzIHBob25lL2kudGVzdCh1YSlcbiAgICAgICwgc2Ftc3VuZ0Jyb3dzZXIgPSAvU2Ftc3VuZ0Jyb3dzZXIvaS50ZXN0KHVhKVxuICAgICAgLCB3aW5kb3dzID0gIXdpbmRvd3NwaG9uZSAmJiAvd2luZG93cy9pLnRlc3QodWEpXG4gICAgICAsIG1hYyA9ICFpb3NkZXZpY2UgJiYgIXNpbGsgJiYgL21hY2ludG9zaC9pLnRlc3QodWEpXG4gICAgICAsIGxpbnV4ID0gIWFuZHJvaWQgJiYgIXNhaWxmaXNoICYmICF0aXplbiAmJiAhd2Vib3MgJiYgL2xpbnV4L2kudGVzdCh1YSlcbiAgICAgICwgZWRnZVZlcnNpb24gPSBnZXRTZWNvbmRNYXRjaCgvZWRnKFtlYV18aW9zKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgICwgdmVyc2lvbklkZW50aWZpZXIgPSBnZXRGaXJzdE1hdGNoKC92ZXJzaW9uXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB0YWJsZXQgPSAvdGFibGV0L2kudGVzdCh1YSkgJiYgIS90YWJsZXQgcGMvaS50ZXN0KHVhKVxuICAgICAgLCBtb2JpbGUgPSAhdGFibGV0ICYmIC9bXi1dbW9iaS9pLnRlc3QodWEpXG4gICAgICAsIHhib3ggPSAveGJveC9pLnRlc3QodWEpXG4gICAgICAsIHJlc3VsdFxuXG4gICAgaWYgKC9vcGVyYS9pLnRlc3QodWEpKSB7XG4gICAgICAvLyAgYW4gb2xkIE9wZXJhXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSdcbiAgICAgICwgb3BlcmE6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86b3BlcmF8b3ByfG9waW9zKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoL29wclxcL3xvcGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICAvLyBhIG5ldyBPcGVyYVxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEnXG4gICAgICAgICwgb3BlcmE6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpvcHJ8b3Bpb3MpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9TYW1zdW5nQnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYW1zdW5nIEludGVybmV0IGZvciBBbmRyb2lkJ1xuICAgICAgICAsIHNhbXN1bmdCcm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86U2Ftc3VuZ0Jyb3dzZXIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9XaGFsZS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdOQVZFUiBXaGFsZSBicm93c2VyJ1xuICAgICAgICAsIHdoYWxlOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86d2hhbGUpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL01aQnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNWiBCcm93c2VyJ1xuICAgICAgICAsIG16YnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Ok1aQnJvd3NlcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY29hc3QvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEgQ29hc3QnXG4gICAgICAgICwgY29hc3Q6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpjb2FzdClbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZvY3VzL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZvY3VzJ1xuICAgICAgICAsIGZvY3VzOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Zm9jdXMpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3lhYnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdZYW5kZXggQnJvd3NlcidcbiAgICAgICwgeWFuZGV4YnJvd3NlcjogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzp5YWJyb3dzZXIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC91Y2Jyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgIG5hbWU6ICdVQyBCcm93c2VyJ1xuICAgICAgICAsIHVjYnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnVjYnJvd3NlcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXhpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTWF4dGhvbidcbiAgICAgICAgLCBtYXh0aG9uOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86bXhpb3MpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2VwaXBoYW55L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0VwaXBoYW55J1xuICAgICAgICAsIGVwaXBoYW55OiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZXBpcGhhbnkpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3B1ZmZpbi9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdQdWZmaW4nXG4gICAgICAgICwgcHVmZmluOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86cHVmZmluKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zbGVpcG5pci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTbGVpcG5pcidcbiAgICAgICAgLCBzbGVpcG5pcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnNsZWlwbmlyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9rLW1lbGVvbi9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdLLU1lbGVvbidcbiAgICAgICAgLCBrTWVsZW9uOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ay1tZWxlb24pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAod2luZG93c3Bob25lKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXaW5kb3dzIFBob25lJ1xuICAgICAgLCBvc25hbWU6ICdXaW5kb3dzIFBob25lJ1xuICAgICAgLCB3aW5kb3dzcGhvbmU6IHRcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlVmVyc2lvbikge1xuICAgICAgICByZXN1bHQubXNlZGdlID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0Lm1zaWUgPSB0XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvaWVtb2JpbGVcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9tc2llfHRyaWRlbnQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnSW50ZXJuZXQgRXhwbG9yZXInXG4gICAgICAsIG1zaWU6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86bXNpZSB8cnY6KShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNocm9tZW9zKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIG9zbmFtZTogJ0Nocm9tZSBPUydcbiAgICAgICwgY2hyb21lb3M6IHRcbiAgICAgICwgY2hyb21lQm9vazogdFxuICAgICAgLCBjaHJvbWU6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21lfGNyaW9zfGNybW8pXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoL2VkZyhbZWFdfGlvcykvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTWljcm9zb2Z0IEVkZ2UnXG4gICAgICAsIG1zZWRnZTogdFxuICAgICAgLCB2ZXJzaW9uOiBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvdml2YWxkaS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdWaXZhbGRpJ1xuICAgICAgICAsIHZpdmFsZGk6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC92aXZhbGRpXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzYWlsZmlzaCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2FpbGZpc2gnXG4gICAgICAsIG9zbmFtZTogJ1NhaWxmaXNoIE9TJ1xuICAgICAgLCBzYWlsZmlzaDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zYWlsZmlzaFxccz9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2VhbW9ua2V5XFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NlYU1vbmtleSdcbiAgICAgICwgc2VhbW9ua2V5OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NlYW1vbmtleVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZpcmVmb3h8aWNld2Vhc2VsfGZ4aW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZpcmVmb3gnXG4gICAgICAsIGZpcmVmb3g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZmlyZWZveHxpY2V3ZWFzZWx8Znhpb3MpWyBcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgICAgaWYgKC9cXCgobW9iaWxlfHRhYmxldCk7W15cXCldKnJ2OltcXGRcXC5dK1xcKS9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5maXJlZm94b3MgPSB0XG4gICAgICAgIHJlc3VsdC5vc25hbWUgPSAnRmlyZWZveCBPUydcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2lsaykge1xuICAgICAgcmVzdWx0ID0gIHtcbiAgICAgICAgbmFtZTogJ0FtYXpvbiBTaWxrJ1xuICAgICAgLCBzaWxrOiB0XG4gICAgICAsIHZlcnNpb24gOiBnZXRGaXJzdE1hdGNoKC9zaWxrXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvcGhhbnRvbS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdQaGFudG9tSlMnXG4gICAgICAsIHBoYW50b206IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvcGhhbnRvbWpzXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2xpbWVyanMvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2xpbWVySlMnXG4gICAgICAgICwgc2xpbWVyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2xpbWVyanNcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9ibGFja2JlcnJ5fFxcYmJiXFxkKy9pLnRlc3QodWEpIHx8IC9yaW1cXHN0YWJsZXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQmxhY2tCZXJyeSdcbiAgICAgICwgb3NuYW1lOiAnQmxhY2tCZXJyeSBPUydcbiAgICAgICwgYmxhY2tiZXJyeTogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC9ibGFja2JlcnJ5W1xcZF0rXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh3ZWJvcykge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2ViT1MnXG4gICAgICAsIG9zbmFtZTogJ1dlYk9TJ1xuICAgICAgLCB3ZWJvczogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC93KD86ZWIpP29zYnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH07XG4gICAgICAvdG91Y2hwYWRcXC8vaS50ZXN0KHVhKSAmJiAocmVzdWx0LnRvdWNocGFkID0gdClcbiAgICB9XG4gICAgZWxzZSBpZiAoL2JhZGEvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQmFkYSdcbiAgICAgICwgb3NuYW1lOiAnQmFkYSdcbiAgICAgICwgYmFkYTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9kb2xmaW5cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aXplbikge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnVGl6ZW4nXG4gICAgICAsIG9zbmFtZTogJ1RpemVuJ1xuICAgICAgLCB0aXplbjogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp0aXplblxccz8pP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICgvcXVwemlsbGEvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUXVwWmlsbGEnXG4gICAgICAgICwgcXVwemlsbGE6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpxdXB6aWxsYSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY2hyb21pdW0vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21pdW0nXG4gICAgICAgICwgY2hyb21pdW06IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWl1bSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY2hyb21lfGNyaW9zfGNybW8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21lJ1xuICAgICAgICAsIGNocm9tZTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9tZXxjcmlvc3xjcm1vKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQW5kcm9pZCdcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2FmYXJpfGFwcGxld2Via2l0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhZmFyaSdcbiAgICAgICwgc2FmYXJpOiB0XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZSA6IGlvc2RldmljZSA9PSAnaXBob25lJyA/ICdpUGhvbmUnIDogaW9zZGV2aWNlID09ICdpcGFkJyA/ICdpUGFkJyA6ICdpUG9kJ1xuICAgICAgfVxuICAgICAgLy8gV1RGOiB2ZXJzaW9uIGlzIG5vdCBwYXJ0IG9mIHVzZXIgYWdlbnQgaW4gd2ViIGFwcHNcbiAgICAgIGlmICh2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYoL2dvb2dsZWJvdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdHb29nbGVib3QnXG4gICAgICAsIGdvb2dsZWJvdDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9nb29nbGVib3RcXC8oXFxkKyhcXC5cXGQrKSkvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6IGdldEZpcnN0TWF0Y2goL14oLiopXFwvKC4qKSAvKSxcbiAgICAgICAgdmVyc2lvbjogZ2V0U2Vjb25kTWF0Y2goL14oLiopXFwvKC4qKSAvKVxuICAgICB9O1xuICAgfVxuXG4gICAgLy8gc2V0IHdlYmtpdCBvciBnZWNrbyBmbGFnIGZvciBicm93c2VycyBiYXNlZCBvbiB0aGVzZSBlbmdpbmVzXG4gICAgaWYgKCFyZXN1bHQubXNlZGdlICYmIC8oYXBwbGUpP3dlYmtpdC9pLnRlc3QodWEpKSB7XG4gICAgICBpZiAoLyhhcHBsZSk/d2Via2l0XFwvNTM3XFwuMzYvaS50ZXN0KHVhKSkge1xuICAgICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiQmxpbmtcIlxuICAgICAgICByZXN1bHQuYmxpbmsgPSB0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiV2Via2l0XCJcbiAgICAgICAgcmVzdWx0LndlYmtpdCA9IHRcbiAgICAgIH1cbiAgICAgIGlmICghcmVzdWx0LnZlcnNpb24gJiYgdmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXJlc3VsdC5vcGVyYSAmJiAvZ2Vja29cXC8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIkdlY2tvXCJcbiAgICAgIHJlc3VsdC5nZWNrbyA9IHRcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gcmVzdWx0LnZlcnNpb24gfHwgZ2V0Rmlyc3RNYXRjaCgvZ2Vja29cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgfVxuXG4gICAgLy8gc2V0IE9TIGZsYWdzIGZvciBwbGF0Zm9ybXMgdGhhdCBoYXZlIG11bHRpcGxlIGJyb3dzZXJzXG4gICAgaWYgKCFyZXN1bHQud2luZG93c3Bob25lICYmIChhbmRyb2lkIHx8IHJlc3VsdC5zaWxrKSkge1xuICAgICAgcmVzdWx0LmFuZHJvaWQgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ0FuZHJvaWQnXG4gICAgfSBlbHNlIGlmICghcmVzdWx0LndpbmRvd3NwaG9uZSAmJiBpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdFtpb3NkZXZpY2VdID0gdFxuICAgICAgcmVzdWx0LmlvcyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnaU9TJ1xuICAgIH0gZWxzZSBpZiAobWFjKSB7XG4gICAgICByZXN1bHQubWFjID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdtYWNPUydcbiAgICB9IGVsc2UgaWYgKHhib3gpIHtcbiAgICAgIHJlc3VsdC54Ym94ID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdYYm94J1xuICAgIH0gZWxzZSBpZiAod2luZG93cykge1xuICAgICAgcmVzdWx0LndpbmRvd3MgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ1dpbmRvd3MnXG4gICAgfSBlbHNlIGlmIChsaW51eCkge1xuICAgICAgcmVzdWx0LmxpbnV4ID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdMaW51eCdcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXaW5kb3dzVmVyc2lvbiAocykge1xuICAgICAgc3dpdGNoIChzKSB7XG4gICAgICAgIGNhc2UgJ05UJzogcmV0dXJuICdOVCdcbiAgICAgICAgY2FzZSAnWFAnOiByZXR1cm4gJ1hQJ1xuICAgICAgICBjYXNlICdOVCA1LjAnOiByZXR1cm4gJzIwMDAnXG4gICAgICAgIGNhc2UgJ05UIDUuMSc6IHJldHVybiAnWFAnXG4gICAgICAgIGNhc2UgJ05UIDUuMic6IHJldHVybiAnMjAwMydcbiAgICAgICAgY2FzZSAnTlQgNi4wJzogcmV0dXJuICdWaXN0YSdcbiAgICAgICAgY2FzZSAnTlQgNi4xJzogcmV0dXJuICc3J1xuICAgICAgICBjYXNlICdOVCA2LjInOiByZXR1cm4gJzgnXG4gICAgICAgIGNhc2UgJ05UIDYuMyc6IHJldHVybiAnOC4xJ1xuICAgICAgICBjYXNlICdOVCAxMC4wJzogcmV0dXJuICcxMCdcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9TIHZlcnNpb24gZXh0cmFjdGlvblxuICAgIHZhciBvc1ZlcnNpb24gPSAnJztcbiAgICBpZiAocmVzdWx0LndpbmRvd3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldFdpbmRvd3NWZXJzaW9uKGdldEZpcnN0TWF0Y2goL1dpbmRvd3MgKChOVHxYUCkoIFxcZFxcZD8uXFxkKT8pL2kpKVxuICAgIH0gZWxzZSBpZiAocmVzdWx0LndpbmRvd3NwaG9uZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvd2luZG93cyBwaG9uZSAoPzpvcyk/XFxzPyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQubWFjKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9NYWMgT1MgWCAoXFxkKyhbX1xcLlxcc11cXGQrKSopL2kpO1xuICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL1tfXFxzXS9nLCAnLicpO1xuICAgIH0gZWxzZSBpZiAoaW9zZGV2aWNlKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9vcyAoXFxkKyhbX1xcc11cXGQrKSopIGxpa2UgbWFjIG9zIHgvaSk7XG4gICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb24ucmVwbGFjZSgvW19cXHNdL2csICcuJyk7XG4gICAgfSBlbHNlIGlmIChhbmRyb2lkKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9hbmRyb2lkWyBcXC8tXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQud2Vib3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goLyg/OndlYnxocHcpb3NcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJsYWNrYmVycnkpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3JpbVxcc3RhYmxldFxcc29zXFxzKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5iYWRhKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9iYWRhXFwvKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC50aXplbikge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvdGl6ZW5bXFwvXFxzXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfVxuICAgIGlmIChvc1ZlcnNpb24pIHtcbiAgICAgIHJlc3VsdC5vc3ZlcnNpb24gPSBvc1ZlcnNpb247XG4gICAgfVxuXG4gICAgLy8gZGV2aWNlIHR5cGUgZXh0cmFjdGlvblxuICAgIHZhciBvc01ham9yVmVyc2lvbiA9ICFyZXN1bHQud2luZG93cyAmJiBvc1ZlcnNpb24uc3BsaXQoJy4nKVswXTtcbiAgICBpZiAoXG4gICAgICAgICB0YWJsZXRcbiAgICAgIHx8IG5leHVzVGFibGV0XG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwYWQnXG4gICAgICB8fCAoYW5kcm9pZCAmJiAob3NNYWpvclZlcnNpb24gPT0gMyB8fCAob3NNYWpvclZlcnNpb24gPj0gNCAmJiAhbW9iaWxlKSkpXG4gICAgICB8fCByZXN1bHQuc2lsa1xuICAgICkge1xuICAgICAgcmVzdWx0LnRhYmxldCA9IHRcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgbW9iaWxlXG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwaG9uZSdcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBvZCdcbiAgICAgIHx8IGFuZHJvaWRcbiAgICAgIHx8IG5leHVzTW9iaWxlXG4gICAgICB8fCByZXN1bHQuYmxhY2tiZXJyeVxuICAgICAgfHwgcmVzdWx0LndlYm9zXG4gICAgICB8fCByZXN1bHQuYmFkYVxuICAgICkge1xuICAgICAgcmVzdWx0Lm1vYmlsZSA9IHRcbiAgICB9XG5cbiAgICAvLyBHcmFkZWQgQnJvd3NlciBTdXBwb3J0XG4gICAgLy8gaHR0cDovL2RldmVsb3Blci55YWhvby5jb20veXVpL2FydGljbGVzL2dic1xuICAgIGlmIChyZXN1bHQubXNlZGdlIHx8XG4gICAgICAgIChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC55YW5kZXhicm93c2VyICYmIHJlc3VsdC52ZXJzaW9uID49IDE1KSB8fFxuXHRcdCAgICAocmVzdWx0LnZpdmFsZGkgJiYgcmVzdWx0LnZlcnNpb24gPj0gMS4wKSB8fFxuICAgICAgICAocmVzdWx0LmNocm9tZSAmJiByZXN1bHQudmVyc2lvbiA+PSAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYW1zdW5nQnJvd3NlciAmJiByZXN1bHQudmVyc2lvbiA+PSA0KSB8fFxuICAgICAgICAocmVzdWx0LndoYWxlICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICcxLjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQubXpicm93c2VyICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICc2LjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQuZm9jdXMgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzEuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uID49IDIwLjApIHx8XG4gICAgICAgIChyZXN1bHQuc2FmYXJpICYmIHJlc3VsdC52ZXJzaW9uID49IDYpIHx8XG4gICAgICAgIChyZXN1bHQub3BlcmEgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0LmJsYWNrYmVycnkgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTAuMSlcbiAgICAgICAgfHwgKHJlc3VsdC5jaHJvbWl1bSAmJiByZXN1bHQudmVyc2lvbiA+PSAyMClcbiAgICAgICAgKSB7XG4gICAgICByZXN1bHQuYSA9IHQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA8IDEwKSB8fFxuICAgICAgICAocmVzdWx0LmNocm9tZSAmJiByZXN1bHQudmVyc2lvbiA8IDIwKSB8fFxuICAgICAgICAocmVzdWx0LmZpcmVmb3ggJiYgcmVzdWx0LnZlcnNpb24gPCAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA8IDYpIHx8XG4gICAgICAgIChyZXN1bHQub3BlcmEgJiYgcmVzdWx0LnZlcnNpb24gPCAxMC4wKSB8fFxuICAgICAgICAocmVzdWx0LmlvcyAmJiByZXN1bHQub3N2ZXJzaW9uICYmIHJlc3VsdC5vc3ZlcnNpb24uc3BsaXQoXCIuXCIpWzBdIDwgNilcbiAgICAgICAgfHwgKHJlc3VsdC5jaHJvbWl1bSAmJiByZXN1bHQudmVyc2lvbiA8IDIwKVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5jID0gdFxuICAgIH0gZWxzZSByZXN1bHQueCA9IHRcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHZhciBib3dzZXIgPSBkZXRlY3QodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnIDogJycpXG5cbiAgYm93c2VyLnRlc3QgPSBmdW5jdGlvbiAoYnJvd3Nlckxpc3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJyb3dzZXJMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYnJvd3Nlckl0ZW0gPSBicm93c2VyTGlzdFtpXTtcbiAgICAgIGlmICh0eXBlb2YgYnJvd3Nlckl0ZW09PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJJdGVtIGluIGJvd3Nlcikge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdmVyc2lvbiBwcmVjaXNpb25zIGNvdW50XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgZ2V0VmVyc2lvblByZWNpc2lvbihcIjEuMTAuM1wiKSAvLyAzXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdmVyc2lvblxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb24pIHtcbiAgICByZXR1cm4gdmVyc2lvbi5zcGxpdChcIi5cIikubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEFycmF5OjptYXAgcG9seWZpbGxcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXl9IGFyclxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBmdW5jdGlvbiBtYXAoYXJyLCBpdGVyYXRvcikge1xuICAgIHZhciByZXN1bHQgPSBbXSwgaTtcbiAgICBpZiAoQXJyYXkucHJvdG90eXBlLm1hcCkge1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnIsIGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2goaXRlcmF0b3IoYXJyW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGJyb3dzZXIgdmVyc2lvbiB3ZWlnaHRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS44LjIuMS45MCddKSAgICAvLyAxXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4wMTAuMi4xJywgJzEuMDkuMi4xLjkwJ10pOyAgLy8gMVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjEwLjIuMSddKTsgICAgIC8vIDBcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS4wODAwLjInXSk7ICAgICAvLyAtMVxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheTxTdHJpbmc+fSB2ZXJzaW9ucyB2ZXJzaW9ucyB0byBjb21wYXJlXG4gICAqIEByZXR1cm4ge051bWJlcn0gY29tcGFyaXNvbiByZXN1bHRcbiAgICovXG4gIGZ1bmN0aW9uIGNvbXBhcmVWZXJzaW9ucyh2ZXJzaW9ucykge1xuICAgIC8vIDEpIGdldCBjb21tb24gcHJlY2lzaW9uIGZvciBib3RoIHZlcnNpb25zLCBmb3IgZXhhbXBsZSBmb3IgXCIxMC4wXCIgYW5kIFwiOVwiIGl0IHNob3VsZCBiZSAyXG4gICAgdmFyIHByZWNpc2lvbiA9IE1hdGgubWF4KGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbnNbMF0pLCBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb25zWzFdKSk7XG4gICAgdmFyIGNodW5rcyA9IG1hcCh2ZXJzaW9ucywgZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgIHZhciBkZWx0YSA9IHByZWNpc2lvbiAtIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbik7XG5cbiAgICAgIC8vIDIpIFwiOVwiIC0+IFwiOS4wXCIgKGZvciBwcmVjaXNpb24gPSAyKVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24gKyBuZXcgQXJyYXkoZGVsdGEgKyAxKS5qb2luKFwiLjBcIik7XG5cbiAgICAgIC8vIDMpIFwiOS4wXCIgLT4gW1wiMDAwMDAwMDAwXCJcIiwgXCIwMDAwMDAwMDlcIl1cbiAgICAgIHJldHVybiBtYXAodmVyc2lvbi5zcGxpdChcIi5cIiksIGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KDIwIC0gY2h1bmsubGVuZ3RoKS5qb2luKFwiMFwiKSArIGNodW5rO1xuICAgICAgfSkucmV2ZXJzZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gaXRlcmF0ZSBpbiByZXZlcnNlIG9yZGVyIGJ5IHJldmVyc2VkIGNodW5rcyBhcnJheVxuICAgIHdoaWxlICgtLXByZWNpc2lvbiA+PSAwKSB7XG4gICAgICAvLyA0KSBjb21wYXJlOiBcIjAwMDAwMDAwOVwiID4gXCIwMDAwMDAwMTBcIiA9IGZhbHNlIChidXQgXCI5XCIgPiBcIjEwXCIgPSB0cnVlKVxuICAgICAgaWYgKGNodW5rc1swXVtwcmVjaXNpb25dID4gY2h1bmtzWzFdW3ByZWNpc2lvbl0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHVua3NbMF1bcHJlY2lzaW9uXSA9PT0gY2h1bmtzWzFdW3ByZWNpc2lvbl0pIHtcbiAgICAgICAgaWYgKHByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgICAgIC8vIGFsbCB2ZXJzaW9uIGNodW5rcyBhcmUgc2FtZVxuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBicm93c2VyIGlzIHVuc3VwcG9ydGVkXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgYm93c2VyLmlzVW5zdXBwb3J0ZWRCcm93c2VyKHtcbiAgICogICAgIG1zaWU6IFwiMTBcIixcbiAgICogICAgIGZpcmVmb3g6IFwiMjNcIixcbiAgICogICAgIGNocm9tZTogXCIyOVwiLFxuICAgKiAgICAgc2FmYXJpOiBcIjUuMVwiLFxuICAgKiAgICAgb3BlcmE6IFwiMTZcIixcbiAgICogICAgIHBoYW50b206IFwiNTM0XCJcbiAgICogICB9KTtcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgbWluVmVyc2lvbnMgbWFwIG9mIG1pbmltYWwgdmVyc2lvbiB0byBicm93c2VyXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IFtzdHJpY3RNb2RlID0gZmFsc2VdIGZsYWcgdG8gcmV0dXJuIGZhbHNlIGlmIGJyb3dzZXIgd2Fzbid0IGZvdW5kIGluIG1hcFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBbdWFdIHVzZXIgYWdlbnQgc3RyaW5nXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc1Vuc3VwcG9ydGVkQnJvd3NlcihtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpIHtcbiAgICB2YXIgX2Jvd3NlciA9IGJvd3NlcjtcblxuICAgIC8vIG1ha2Ugc3RyaWN0TW9kZSBwYXJhbSBvcHRpb25hbCB3aXRoIHVhIHBhcmFtIHVzYWdlXG4gICAgaWYgKHR5cGVvZiBzdHJpY3RNb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgdWEgPSBzdHJpY3RNb2RlO1xuICAgICAgc3RyaWN0TW9kZSA9IHZvaWQoMCk7XG4gICAgfVxuXG4gICAgaWYgKHN0cmljdE1vZGUgPT09IHZvaWQoMCkpIHtcbiAgICAgIHN0cmljdE1vZGUgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHVhKSB7XG4gICAgICBfYm93c2VyID0gZGV0ZWN0KHVhKTtcbiAgICB9XG5cbiAgICB2YXIgdmVyc2lvbiA9IFwiXCIgKyBfYm93c2VyLnZlcnNpb247XG4gICAgZm9yICh2YXIgYnJvd3NlciBpbiBtaW5WZXJzaW9ucykge1xuICAgICAgaWYgKG1pblZlcnNpb25zLmhhc093blByb3BlcnR5KGJyb3dzZXIpKSB7XG4gICAgICAgIGlmIChfYm93c2VyW2Jyb3dzZXJdKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBtaW5WZXJzaW9uc1ticm93c2VyXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnJvd3NlciB2ZXJzaW9uIGluIHRoZSBtaW5WZXJzaW9uIG1hcCBzaG91bGQgYmUgYSBzdHJpbmc6ICcgKyBicm93c2VyICsgJzogJyArIFN0cmluZyhtaW5WZXJzaW9ucykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGJyb3dzZXIgdmVyc2lvbiBhbmQgbWluIHN1cHBvcnRlZCB2ZXJzaW9uLlxuICAgICAgICAgIHJldHVybiBjb21wYXJlVmVyc2lvbnMoW3ZlcnNpb24sIG1pblZlcnNpb25zW2Jyb3dzZXJdXSkgPCAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmljdE1vZGU7IC8vIG5vdCBmb3VuZFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGJyb3dzZXIgaXMgc3VwcG9ydGVkXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gbWluVmVyc2lvbnMgbWFwIG9mIG1pbmltYWwgdmVyc2lvbiB0byBicm93c2VyXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IFtzdHJpY3RNb2RlID0gZmFsc2VdIGZsYWcgdG8gcmV0dXJuIGZhbHNlIGlmIGJyb3dzZXIgd2Fzbid0IGZvdW5kIGluIG1hcFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBbdWFdIHVzZXIgYWdlbnQgc3RyaW5nXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBjaGVjayhtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpIHtcbiAgICByZXR1cm4gIWlzVW5zdXBwb3J0ZWRCcm93c2VyKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSk7XG4gIH1cblxuICBib3dzZXIuaXNVbnN1cHBvcnRlZEJyb3dzZXIgPSBpc1Vuc3VwcG9ydGVkQnJvd3NlcjtcbiAgYm93c2VyLmNvbXBhcmVWZXJzaW9ucyA9IGNvbXBhcmVWZXJzaW9ucztcbiAgYm93c2VyLmNoZWNrID0gY2hlY2s7XG5cbiAgLypcbiAgICogU2V0IG91ciBkZXRlY3QgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3Qgc28gd2UgY2FuXG4gICAqIHJldXNlIGl0IHRvIHRlc3Qgb3RoZXIgdXNlciBhZ2VudHMuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGltcGxlbWVudCBmdXR1cmUgdGVzdHMuXG4gICAqL1xuICBib3dzZXIuX2RldGVjdCA9IGRldGVjdDtcblxuICAvKlxuICAgKiBTZXQgb3VyIGRldGVjdCBwdWJsaWMgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3RcbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gaW1wbGVtZW50IGJvd3NlciBpbiBzZXJ2ZXIgc2lkZVxuICAgKi9cbiAgYm93c2VyLmRldGVjdCA9IGRldGVjdDtcbiAgcmV0dXJuIGJvd3NlclxufSk7XG4iLCJ2YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXHJcbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcCcpO1xyXG52YXIgcG9seWZpbGxzID0gcmVxdWlyZSgnLi9wb2x5ZmlsbHMnKTtcclxuXHJcbnBvbHlmaWxscy5hcHBseVBvbHlmaWxscygpO1xyXG5cclxudmFyIGluc3RhbmNlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdldEluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oSGVscGVycy56aXBPYmplY3QoWydpbml0JywgJ29wZW4nLCAnb24nLCAnb2ZmJywgJ3NlbmRNZXNzYWdlJywgJ29uTWVzc2FnZSddLm1hcChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xyXG4gICAgICAgIHZhciBhcHAgPSBnZXRJbnN0YW5jZSgpO1xyXG4gICAgICAgIHJldHVybiBbbWV0aG9kTmFtZSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXBwW21ldGhvZE5hbWVdLmFwcGx5KGFwcCwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XTtcclxuICAgIH0pKSwge1xyXG4gICAgICAgIGV2ZW50VHlwZXM6IEFwcC5ldmVudFR5cGVzLFxyXG4gICAgfSk7XHJcbn0pKCk7XHJcbiJdfQ==
