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
        if (document.readyState != 'loading'){
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
    var EVENT_NAMESPACE = '.xpaystation-widget';
    var ATTR_PREFIX = 'data-xpaystation-widget-open';

    /** Private Members **/
    App.prototype.config = {};
    App.prototype.isInitiated = false;
    App.prototype.eventObject = Helpers.addEventObject(this);

    App.prototype.getPaystationUrl = function () {
        var SANDBOX_PAYSTATION_URL = 'https://sandbox-secure.xsolla.com/paystation2/?';
        return this.config.sandbox ? SANDBOX_PAYSTATION_URL : 'https://' + this.config.host + '/paystation2/?';
    };

    App.prototype.checkConfig = function () {
        if (Helpers.isEmpty(this.config.access_token) && Helpers.isEmpty(this.config.access_data)) {
            this.throwError('No access token given');
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

    // function init(options) {
    //     this.isInitiated = true;
    //     this.config = Object.assign({}, DEFAULT_CONFIG, options);

    //     var bodyElement = global.document.body;
    //     var clickEventName = 'click' + EVENT_NAMESPACE;

    //     var handleClickEvent = (function(event) {
    //         var targetElement = document.querySelector('[' + ATTR_PREFIX + ']');
    //         if (event.sourceEvent.target === targetElement) {
    //             this.open.call(this, targetElement);
    //         }
    //     }).bind(this);

    //     bodyElement.removeEventListener(clickEventName, handleClickEvent);

    //     var clickEvent = document.createEvent('Event');
    //     clickEvent.initEvent(clickEventName, false, true);

    //     bodyElement.addEventListener('click', (function(event) {
    //         clickEvent.sourceEvent = event;
    //         bodyElement.dispatchEvent(clickEvent);
    //     }).bind(this), false);

    //     bodyElement.addEventListener(clickEventName, handleClickEvent);

    //     this.triggerEvent(App.eventTypes.INIT);
    // })

    // App.prototype.init = ready((function (options) {
    //     this.isInitiated = true;
    //     this.config = Object.assign({}, DEFAULT_CONFIG, options);

    //     var bodyElement = global.document.body;
    //     var clickEventName = 'click' + EVENT_NAMESPACE;

    //     var handleClickEvent = (function(event) {
    //         var targetElement = document.querySelector('[' + ATTR_PREFIX + ']');
    //         if (event.sourceEvent.target === targetElement) {
    //             this.open.call(this, targetElement);
    //         }
    //     }).bind(this);

    //     bodyElement.removeEventListener(clickEventName, handleClickEvent);

    //     var clickEvent = document.createEvent('Event');
    //     clickEvent.initEvent(clickEventName, false, true);

    //     bodyElement.addEventListener('click', (function(event) {
    //         clickEvent.sourceEvent = event;
    //         bodyElement.dispatchEvent(clickEvent);
    //     }).bind(this), false);

    //     bodyElement.addEventListener(clickEventName, handleClickEvent);

    //     this.triggerEvent(App.eventTypes.INIT);
    // }));

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
        // ready.call(this, initialize.call())
        console.log('this', this);
        debugger
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

        var query = {};
        if (this.config.access_token) {
            query.access_token = this.config.access_token;
        } else {
            query.access_data = JSON.stringify(this.config.access_data);
        }

        var url = this.getPaystationUrl() + Helpers.param(query);

        this.postMessage = null;
        if ((new Device).isMobile()) {
            var childWindow = new ChildWindow;
            childWindow.on('open', (function () {
                this.postMessage = childWindow.getPostMessage();
                this.triggerEvent(App.eventTypes.OPEN);
                this.triggerEvent(App.eventTypes.OPEN_WINDOW);
            }).bind(this));
            childWindow.on('load', (function () {
                this.triggerEvent(App.eventTypes.LOAD);
            }).bind(this));
            childWindow.on('close', (function () {
                this.triggerEvent(App.eventTypes.CLOSE);
                this.triggerEvent(App.eventTypes.CLOSE_WINDOW);
            }).bind(this));
            childWindow.on('status', (function (event, statusData) {
                this.triggerEvent(App.eventTypes.STATUS, statusData);
                triggerSplitStatus(statusData);
            }).bind(this));
            childWindow.open(url, this.config.childWindow);
        } else {
            var lightBox = new LightBox;
            lightBox.on('open', (function () {
                this.postMessage = lightBox.getPostMessage();
                this.triggerEvent(App.eventTypes.OPEN);
                this.triggerEvent(App.eventTypes.OPEN_LIGHTBOX);
            }).bind(this));
            lightBox.on('load', (function () {
                this.triggerEvent(App.eventTypes.LOAD);
            }).bind(this));
            lightBox.on('close', (function () {
                this.triggerEvent(App.eventTypes.CLOSE);
                this.triggerEvent(App.eventTypes.CLOSE_LIGHTBOX);
            }).bind(this));
            lightBox.on('status', (function (event, statusData) {
                this.triggerEvent(App.eventTypes.STATUS, statusData);
                triggerSplitStatus(statusData);
            }).bind(this));
            lightBox.openFrame(url, this.config.lightbox);
        }
    };

    /**
     * Attach an event handler function for one or more events to the widget
     * @param event One or more space-separated event types (init, open, load, close, status, status-invoice, status-delivering, status-troubled, status-done)
     * @param handler A function to execute when the event is triggered
     */
    App.prototype.on = function (event, handler) {
        if (typeof handler !== 'function') {
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
      f();
      f = function() {};
  }
}

function addEventObject(context, wrapEventInNamespace) {
    var dummyWrapper = function(event) { return event };
    var wrapEventInNamespace = wrapEventInNamespace || dummyWrapper;
    console.log('wrapEventInNamespace', wrapEventInNamespace('test'));
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
          var eventInNamespace = wrapEventInNamespace(eventName);
          document.addEventListener(eventInNamespace, handle, options);
      }).bind(context),
      off: (function(eventName, handle, options) {
          var eventInNamespace = wrapEventInNamespace(eventName);
          document.removeEventListener(eventInNamespace, handle, options);
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
    var EVENT_NAMESPACE = '.xpaystation-widget-lightbox';
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

    var handleKeyup = function(event) {
        if (event.which == 27) {
            this.closeFrame();
        }
    }

    function wrapEventInNamespace(eventName) {
        return eventName + '_' + EVENT_NAMESPACE;
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
            width: '0px',
            height: '0px'
        };

        lightBoxElement.style.zIndex = options.zIndex;

        lightBoxOverlayElement.style.opacity = options.overlayOpacity;
        lightBoxOverlayElement.style.backgroundColor = options.overlayBackground;

        lightBoxContentElement.style.backgroundColor = options.contentBackground;
        lightBoxContentElement.style.margin = options.contentMargin;

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

            bodyElement.addEventListener(handleKeyupEventName, handleKeyup);

            bodyElement.addEventListener('keyup', (function(event) {

                var clickEvent = document.createEvent('Event');
                clickEvent.initEvent(handleKeyupEventName, false, true);
                clickEvent.sourceEvent = event;

                bodyElement.dispatchEvent(clickEvent);
            }).bind(this), false);
        }

        var showContent = Helpers.once((function () {
            hideSpinner(options);
            lightBoxContentElement.classList.remove(CLASS_PREFIX + '-content__hidden')
            this.triggerEvent('load');
        }).bind(this));

        var lightBoxResize = function () {
            var width = options.width ? options.width : psDimensions.width;
            var height = options.height ? options.height : psDimensions.height;

            lightBoxContentElement.style.left = '0px';
            lightBoxContentElement.style.top = '0px';
            lightBoxContentElement.style.borderRadius = '8px';
            lightBoxContentElement.style.width = width;
            lightBoxContentElement.style.height = height;

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
                var bodyPad = parseInt((getComputedStyle(bodyElement)[paddingRight] || 0), 10);
                bodyElement.style.overflow = 'hidden;';
                bodyElement.style.paddingRight = bodyPad + this.measureScrollbar();
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
        lightBoxIframeElement.addEventListener('load', (function handleLoad(event) {
            var timeout = !options.width || !options.height ? 30000 : 1000; //30000 if psDimensions will not arrive
            loadTimer = global.setTimeout(function () {
                showContent();
            }, timeout);
            event.target.removeEventListener('load', handleLoad);
        }).bind(this));

        var iframeWindow = lightBoxIframeElement.contentWindow || lightBoxIframeElement;

        // Cross-window communication
        this.message = new PostMessage(iframeWindow);
        if (options.width && options.height) {
            this.message.on('dimensions', (function () {
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
        this.message.on('status', (function (event, data) {
            this.triggerEvent('status', data);
        }).bind(this));

        // Resize
        var handleResizeEventName = 'resize' + EVENT_NAMESPACE;

        var resizeEvent = document.createEvent('Event');
        resizeEvent.initEvent(handleResizeEventName, false, true);

        window.addEventListener(handleResizeEventName, lightBoxResize);

        window.addEventListener('resize', function(event) {
            resizeEvent.sourceEvent = event;
            bodyElement.dispatchEvent(resizeEvent);
        })

        // Clean up after close
        this.on('close', (function handleClose(event) {
            this.message.off();
            bodyElement.removeEventListener(handleKeyupEventName, handleKeyup)
            window.removeEventListener(handleResizeEventName, lightBoxResize);
            lightBoxElement.parentNode.removeChild(lightBoxElement);
            resetScrollbar();
            event.target.removeEventListener('close', handleClose)
        }).bind(this));

        if (options.width && options.height) {
            lightBoxResize();
        }
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

    LightBox._NAMESPACE = EVENT_NAMESPACE;

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
    function PostMessage(window) {
        this.eventObject = Helpers.addEventObject(this);
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
        document.addEventListener(event, handle, options);
    };

    PostMessage.prototype.off = function (event, handle, options) {
        document.removeEventListener(event, handle, options);
    };

    return PostMessage;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./helpers":7}],11:[function(require,module,exports){
module.exports = "<svg width=\"47px\" height=\"47px\" class=\"spinner-round\"><path d=\"M4.7852728,10.4210875 C2.94111664,13.0552197 1.63777109,16.0946106 1.03753956,19.3768556 L5.16638971,19.3768556 C5.6429615,17.187554 6.50125243,15.139164 7.66768899,13.305305 L5.95572428,11.5922705 L4.7852728,10.4210875 L4.7852728,10.4210875 Z M10.4693048,4.74565615 C13.1274873,2.8908061 16.1965976,1.58674648 19.5100161,1 L19.5100161,4.99523934 C17.2710923,5.48797782 15.1803193,6.3808529 13.3166907,7.59482153 L11.6337339,5.91081293 L10.4693048,4.74565615 L10.4693048,4.74565615 Z M42.2426309,36.5388386 C44.1112782,33.8575016 45.4206461,30.7581504 46,27.4117269 L41.9441211,27.4117269 C41.4527945,29.6618926 40.5583692,31.762911 39.3404412,33.6349356 L41.0332347,35.3287869 L42.2425306,36.5388386 L42.2426309,36.5388386 Z M36.5707441,42.2264227 C33.9167773,44.0867967 30.8509793,45.3972842 27.5398693,45.9911616 L27.5398693,41.7960549 C29.7376402,41.3202901 31.7936841,40.4593536 33.6336246,39.287568 L35.3554258,41.0104453 L36.5707441,42.2265231 L36.5707441,42.2264227 Z M4.71179965,36.4731535 C2.86744274,33.8069823 1.57463637,30.7309322 1,27.4118273 L5.16889904,27.4118273 C5.64828128,29.6073559 6.51159087,31.661069 7.68465205,33.4984432 L5.95572428,35.2284515 L4.71179965,36.4731535 L4.71179965,36.4731535 Z M10.3640133,42.180423 C13.0462854,44.0745435 16.1527345,45.40552 19.5101165,46 L19.5101165,41.7821947 C17.2817319,41.2916658 15.2000928,40.4048169 13.3430889,39.1995862 L11.6337339,40.9100094 L10.3640133,42.1805235 L10.3640133,42.180423 Z M42.1688567,10.3557038 C44.0373031,13.0048008 45.357411,16.0674929 45.9626612,19.3768556 L41.9469316,19.3768556 C41.4585158,17.1328164 40.5692095,15.0369202 39.3580065,13.1684109 L41.0335358,11.4918346 L42.168957,10.3557038 L42.1688567,10.3557038 Z M36.4651516,4.69995782 C33.8355754,2.87865336 30.8071162,1.59488179 27.5400701,1.00883836 L27.5400701,4.98117831 C29.7484805,5.45915272 31.8137587,6.3260149 33.6604242,7.50643794 L35.3555262,5.8102766 L36.4651516,4.69995782 L36.4651516,4.69995782 Z\" fill=\"#CCCCCC\"></path></svg>";

},{}],12:[function(require,module,exports){
module.exports = "<svg class=\"spinner-xsolla\" width=\"56\" height=\"55\"><path class=\"spinner-xsolla-x\" d=\"M21.03 5.042l-2.112-2.156-3.657 3.695-3.657-3.695-2.112 2.156 3.659 3.673-3.659 3.696 2.112 2.157 3.657-3.697 3.657 3.697 2.112-2.157-3.648-3.696 3.648-3.673z\" fill=\"#F2542D\"></path><path class=\"spinner-xsolla-s\" d=\"M41.232 6.896l2.941-2.974-2.134-2.132-2.92 2.973-.005-.008-2.134 2.135.005.008-.005.005 3.792 3.82-2.915 2.947 2.112 2.156 5.06-5.111-3.798-3.816.001-.001z\" fill=\"#FCCA20\"></path><path class=\"spinner-xsolla-o\" d=\"M48.066 29.159c-1.536 0-2.761 1.263-2.761 2.79 0 1.524 1.226 2.765 2.761 2.765 1.509 0 2.736-1.242 2.736-2.765 0-1.526-1.227-2.79-2.736-2.79m0 8.593c-3.179 0-5.771-2.594-5.771-5.804 0-3.213 2.592-5.808 5.771-5.808 3.155 0 5.745 2.594 5.745 5.808 0 3.21-2.589 5.804-5.745 5.804\" fill=\"#8C3EA4\"></path><path class=\"spinner-xsolla-l\" d=\"M24.389 42.323h2.99v10.437h-2.99v-10.437zm4.334 0h2.989v10.437h-2.989v-10.437z\" fill=\"#B5DC20\"></path><path class=\"spinner-xsolla-a\" d=\"M7.796 31.898l1.404 2.457h-2.835l1.431-2.457h-.001zm-.001-5.757l-6.363 11.102h12.703l-6.341-11.102z\" fill=\"#66CCDA\"></path></svg>";

},{}],13:[function(require,module,exports){
module.exports = require('sassify')('.xpaystation-widget-lightbox{position:fixed;top:0;left:0;bottom:0;right:0;width:100%;height:100%;-webkit-animation:xpaystation-widget-lightbox-fadein 0.15s;animation:xpaystation-widget-lightbox-fadein 0.15s}.xpaystation-widget-lightbox-overlay{position:absolute;top:0;left:0;bottom:0;right:0;z-index:1}.xpaystation-widget-lightbox-content{position:relative;top:0;left:0;z-index:3}.xpaystation-widget-lightbox-content__hidden{visibility:hidden;z-index:-1}.xpaystation-widget-lightbox-content-iframe{width:100%;height:100%;border:0;background:transparent}.xpaystation-widget-lightbox-spinner{position:absolute;top:50%;left:50%;display:none;z-index:2;pointer-events:none}.xpaystation-widget-lightbox-spinner .spinner-xsolla{width:56px;height:55px;margin-top:-28px;margin-left:-26px}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-x,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-s,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-o,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-l,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-a{-webkit-animation:xpaystation-widget-lightbox-bouncedelay 1s infinite ease-in-out;-webkit-animation-fill-mode:both;animation:xpaystation-widget-lightbox-bouncedelay 1s infinite ease-in-out;animation-fill-mode:both}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-x{-webkit-animation-delay:0s;animation-delay:0s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-s{-webkit-animation-delay:.2s;animation-delay:.2s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-o{-webkit-animation-delay:.4s;animation-delay:.4s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-l{-webkit-animation-delay:.6s;animation-delay:.6s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-a{-webkit-animation-delay:.8s;animation-delay:.8s}.xpaystation-widget-lightbox-spinner .spinner-round{margin-top:-23px;margin-left:-23px;-webkit-animation:xpaystation-widget-lightbox-spin 3s infinite linear;animation:xpaystation-widget-lightbox-spin 3s infinite linear}.xpaystation-widget-lightbox-spinner .spinner-custom{-webkit-animation:xpaystation-widget-lightbox-spin infinite linear;animation:xpaystation-widget-lightbox-spin infinite linear}@-webkit-keyframes xpaystation-widget-lightbox-bouncedelay{0%,80%,100%{opacity:0}40%{opacity:1}}@keyframes xpaystation-widget-lightbox-bouncedelay{0%,80%,100%{opacity:0}40%{opacity:1}}@-webkit-keyframes xpaystation-widget-lightbox-fadein{from{opacity:0}to{opacity:1}}@keyframes xpaystation-widget-lightbox-fadein{from{opacity:0}to{opacity:1}}@-webkit-keyframes xpaystation-widget-lightbox-spin{from{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes xpaystation-widget-lightbox-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}  /*# sourceMappingURL=data:application/json;base64,ewoJInZlcnNpb24iOiAzLAoJImZpbGUiOiAibGlnaHRib3guc2NzcyIsCgkic291cmNlcyI6IFsKCQkibGlnaHRib3guc2NzcyIKCV0sCgkic291cmNlc0NvbnRlbnQiOiBbCgkJIiRsaWdodGJveC1wcmVmaXg6ICd4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xuJGxpZ2h0Ym94LWNsYXNzOiAnLicgKyAkbGlnaHRib3gtcHJlZml4O1xuXG4jeyRsaWdodGJveC1jbGFzc30ge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgYm90dG9tOiAwO1xuICByaWdodDogMDtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgLXdlYmtpdC1hbmltYXRpb246ICN7JGxpZ2h0Ym94LXByZWZpeH0tZmFkZWluIC4xNXM7XG4gIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1mYWRlaW4gLjE1cztcbn1cblxuI3skbGlnaHRib3gtY2xhc3N9LW92ZXJsYXkge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDowO1xuICBsZWZ0OiAwO1xuICBib3R0b206IDA7XG4gIHJpZ2h0OiAwO1xuICB6LWluZGV4OiAxO1xufVxuXG4jeyRsaWdodGJveC1jbGFzc30tY29udGVudCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB6LWluZGV4OiAzO1xufVxuXG4jeyRsaWdodGJveC1jbGFzc30tY29udGVudF9faGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICB6LWluZGV4OiAtMTtcbn1cblxuI3skbGlnaHRib3gtY2xhc3N9LWNvbnRlbnQtaWZyYW1lIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgYm9yZGVyOiAwO1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbn1cblxuI3skbGlnaHRib3gtY2xhc3N9LXNwaW5uZXIge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogNTAlO1xuICBsZWZ0OiA1MCU7XG4gIGRpc3BsYXk6IG5vbmU7XG4gIHotaW5kZXg6IDI7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuXG4gIC5zcGlubmVyLXhzb2xsYSB7XG4gICAgd2lkdGg6IDU2cHg7XG4gICAgaGVpZ2h0OiA1NXB4O1xuICAgIG1hcmdpbjoge1xuICAgICAgdG9wOiAtMjhweDtcbiAgICAgIGxlZnQ6IC0yNnB4O1xuICAgIH1cblxuICAgIC5zcGlubmVyLXhzb2xsYS14LCAuc3Bpbm5lci14c29sbGEtcywgLnNwaW5uZXIteHNvbGxhLW8sIC5zcGlubmVyLXhzb2xsYS1sLCAuc3Bpbm5lci14c29sbGEtYSB7XG4gICAgICAtd2Via2l0LWFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcbiAgICAgIC13ZWJraXQtYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDtcbiAgICAgIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcbiAgICAgIGFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7XG4gICAgfVxuXG4gICAgLnNwaW5uZXIteHNvbGxhLXgge1xuICAgICAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcbiAgICB9XG5cbiAgICAuc3Bpbm5lci14c29sbGEtcyB7XG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjJzO1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuMnM7XG4gICAgfVxuXG4gICAgLnNwaW5uZXIteHNvbGxhLW8ge1xuICAgICAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC40cztcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLjRzO1xuICAgIH1cblxuICAgIC5zcGlubmVyLXhzb2xsYS1sIHtcbiAgICAgIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAuNnM7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC42cztcbiAgICB9XG5cbiAgICAuc3Bpbm5lci14c29sbGEtYSB7XG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjhzO1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuOHM7XG4gICAgfVxuICB9XG5cbiAgLnNwaW5uZXItcm91bmQge1xuICAgIG1hcmdpbjoge1xuICAgICAgdG9wOiAtMjNweDtcbiAgICAgIGxlZnQ6IC0yM3B4O1xuICAgIH1cbiAgICAtd2Via2l0LWFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1zcGluIDNzIGluZmluaXRlIGxpbmVhcjtcbiAgICBhbmltYXRpb246ICN7JGxpZ2h0Ym94LXByZWZpeH0tc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXI7XG4gIH1cblxuICAuc3Bpbm5lci1jdXN0b20ge1xuICAgIC13ZWJraXQtYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4gaW5maW5pdGUgbGluZWFyO1xuICAgIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1zcGluIGluZmluaXRlIGxpbmVhcjtcbiAgfVxufVxuXG5ALXdlYmtpdC1rZXlmcmFtZXMgI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSB7XG4gIDAlLCA4MCUsIDEwMCUgeyBvcGFjaXR5OiAwOyB9XG4gIDQwJSB7IG9wYWNpdHk6IDEgfVxufVxuXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tYm91bmNlZGVsYXkge1xuICAwJSwgODAlLCAxMDAlIHsgb3BhY2l0eTogMDsgfVxuICA0MCUgeyBvcGFjaXR5OiAxOyB9XG59XG5cbkAtd2Via2l0LWtleWZyYW1lcyAjeyRsaWdodGJveC1wcmVmaXh9LWZhZGVpbiB7XG4gIGZyb20geyBvcGFjaXR5OiAwOyB9XG4gIHRvIHsgb3BhY2l0eTogMTsgfVxufVxuXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tZmFkZWluIHtcbiAgZnJvbSB7IG9wYWNpdHk6IDA7IH1cbiAgdG8geyBvcGFjaXR5OiAxOyB9XG59XG5cbkAtd2Via2l0LWtleWZyYW1lcyAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4ge1xuICBmcm9tIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxuICB0byB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxufVxuXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tc3BpbiB7XG4gIGZyb20geyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxuICB0byB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbn1cbiIKCV0sCgkibWFwcGluZ3MiOiAiQUFHQSxBQUFBLDRCQUE0QixBQUE1QixDQUNFLFFBQVEsQ0FBRSxLQUFNLENBQ2hCLEdBQUcsQ0FBRSxDQUFFLENBQ1AsSUFBSSxDQUFFLENBQUUsQ0FDUixNQUFNLENBQUUsQ0FBRSxDQUNWLEtBQUssQ0FBRSxDQUFFLENBQ1QsS0FBSyxDQUFFLElBQUssQ0FDWixNQUFNLENBQUUsSUFBSyxDQUNiLGlCQUFpQixDQUFFLGtDQUEwQixDQUFRLEtBQUksQ0FDekQsU0FBUyxDQUFFLGtDQUEwQixDQUFRLEtBQUksQ0FDbEQsQUFFRCxBQUFBLG9DQUFvQyxBQUFwQyxDQUNFLFFBQVEsQ0FBRSxRQUFTLENBQ25CLEdBQUcsQ0FBQyxDQUFFLENBQ04sSUFBSSxDQUFFLENBQUUsQ0FDUixNQUFNLENBQUUsQ0FBRSxDQUNWLEtBQUssQ0FBRSxDQUFFLENBQ1QsT0FBTyxDQUFFLENBQUUsQ0FDWixBQUVELEFBQUEsb0NBQW9DLEFBQXBDLENBQ0UsUUFBUSxDQUFFLFFBQVMsQ0FDbkIsR0FBRyxDQUFFLENBQUUsQ0FDUCxJQUFJLENBQUUsQ0FBRSxDQUNSLE9BQU8sQ0FBRSxDQUFFLENBQ1osQUFFRCxBQUFBLDRDQUE0QyxBQUE1QyxDQUNFLFVBQVUsQ0FBRSxNQUFPLENBQ25CLE9BQU8sQ0FBRSxFQUFHLENBQ2IsQUFFRCxBQUFBLDJDQUEyQyxBQUEzQyxDQUNFLEtBQUssQ0FBRSxJQUFLLENBQ1osTUFBTSxDQUFFLElBQUssQ0FDYixNQUFNLENBQUUsQ0FBRSxDQUNWLFVBQVUsQ0FBRSxXQUFZLENBQ3pCLEFBRUQsQUFBQSxvQ0FBb0MsQUFBcEMsQ0FDRSxRQUFRLENBQUUsUUFBUyxDQUNuQixHQUFHLENBQUUsR0FBSSxDQUNULElBQUksQ0FBRSxHQUFJLENBQ1YsT0FBTyxDQUFFLElBQUssQ0FDZCxPQUFPLENBQUUsQ0FBRSxDQUNYLGNBQWMsQ0FBRSxJQUFLLENBd0R0QixBQTlERCxBQVFFLG9DQVJrQyxDQVFsQyxlQUFlLEFBQUMsQ0FDZCxLQUFLLENBQUUsSUFBSyxDQUNaLE1BQU0sQ0FBRSxJQUFLLENBQ2IsTUFBTSxBQUFDLENBQUMsQUFDTixHQUFHLENBQUUsS0FBTSxDQURiLE1BQU0sQUFBQyxDQUFDLEFBRU4sSUFBSSxDQUFFLEtBQU0sQ0FrQ2YsQUEvQ0gsQUFnQkksb0NBaEJnQyxDQVFsQyxlQUFlLENBUWIsaUJBQWlCLENBaEJyQixBQWdCdUIsb0NBaEJhLENBUWxDLGVBQWUsQ0FRTSxpQkFBaUIsQ0FoQnhDLEFBZ0IwQyxvQ0FoQk4sQ0FRbEMsZUFBZSxDQVF5QixpQkFBaUIsQ0FoQjNELEFBZ0I2RCxvQ0FoQnpCLENBUWxDLGVBQWUsQ0FRNEMsaUJBQWlCLENBaEI5RSxBQWdCZ0Ysb0NBaEI1QyxDQVFsQyxlQUFlLENBUStELGlCQUFpQixBQUFDLENBQzVGLGlCQUFpQixDQUFFLHVDQUErQixDQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUN0RiwyQkFBMkIsQ0FBRSxJQUFLLENBQ2xDLFNBQVMsQ0FBRSx1Q0FBK0IsQ0FBYSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FDOUUsbUJBQW1CLENBQUUsSUFBSyxDQUMzQixBQXJCTCxBQXVCSSxvQ0F2QmdDLENBUWxDLGVBQWUsQ0FlYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxFQUFHLENBQzVCLGVBQWUsQ0FBRSxFQUFHLENBQ3JCLEFBMUJMLEFBNEJJLG9DQTVCZ0MsQ0FRbEMsZUFBZSxDQW9CYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBL0JMLEFBaUNJLG9DQWpDZ0MsQ0FRbEMsZUFBZSxDQXlCYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBcENMLEFBc0NJLG9DQXRDZ0MsQ0FRbEMsZUFBZSxDQThCYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBekNMLEFBMkNJLG9DQTNDZ0MsQ0FRbEMsZUFBZSxDQW1DYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBOUNMLEFBaURFLG9DQWpEa0MsQ0FpRGxDLGNBQWMsQUFBQyxDQUNiLE1BQU0sQUFBQyxDQUFDLEFBQ04sR0FBRyxDQUFFLEtBQU0sQ0FEYixNQUFNLEFBQUMsQ0FBQyxBQUVOLElBQUksQ0FBRSxLQUFNLENBRWQsaUJBQWlCLENBQUUsZ0NBQXdCLENBQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQ25FLFNBQVMsQ0FBRSxnQ0FBd0IsQ0FBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDNUQsQUF4REgsQUEwREUsb0NBMURrQyxDQTBEbEMsZUFBZSxBQUFDLENBQ2QsaUJBQWlCLENBQUUsZ0NBQXdCLENBQU0sUUFBUSxDQUFDLE1BQU0sQ0FDaEUsU0FBUyxDQUFFLGdDQUF3QixDQUFNLFFBQVEsQ0FBQyxNQUFNLENBQ3pELEFBR0gsa0JBQWtCLENBQWxCLHVDQUFrQixDQUNoQixBQUFBLEVBQUUsQ0FBRSxBQUFBLEdBQUcsQ0FBRSxBQUFBLElBQUksQ0FBRyxPQUFPLENBQUUsQ0FBRSxDQUMzQixBQUFBLEdBQUcsQ0FBRyxPQUFPLENBQUUsQ0FBRyxFQUdwQixVQUFVLENBQVYsdUNBQVUsQ0FDUixBQUFBLEVBQUUsQ0FBRSxBQUFBLEdBQUcsQ0FBRSxBQUFBLElBQUksQ0FBRyxPQUFPLENBQUUsQ0FBRSxDQUMzQixBQUFBLEdBQUcsQ0FBRyxPQUFPLENBQUUsQ0FBRSxFQUduQixrQkFBa0IsQ0FBbEIsa0NBQWtCLENBQ2hCLEFBQUEsSUFBSSxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQ2xCLEFBQUEsRUFBRSxDQUFHLE9BQU8sQ0FBRSxDQUFFLEVBR2xCLFVBQVUsQ0FBVixrQ0FBVSxDQUNSLEFBQUEsSUFBSSxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQ2xCLEFBQUEsRUFBRSxDQUFHLE9BQU8sQ0FBRSxDQUFFLEVBR2xCLGtCQUFrQixDQUFsQixnQ0FBa0IsQ0FDaEIsQUFBQSxJQUFJLENBQUcsaUJBQWlCLENBQUUsWUFBTSxDQUNoQyxBQUFBLEVBQUUsQ0FBRyxpQkFBaUIsQ0FBRSxjQUFNLEVBR2hDLFVBQVUsQ0FBVixnQ0FBVSxDQUNSLEFBQUEsSUFBSSxDQUFHLFNBQVMsQ0FBRSxZQUFNLENBQ3hCLEFBQUEsRUFBRSxDQUFHLFNBQVMsQ0FBRSxjQUFNIiwKCSJuYW1lcyI6IFtdCn0= */');;
},{"sassify":2}],14:[function(require,module,exports){
module.exports = '1.0.6';

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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJib3dlcl9jb21wb25lbnRzL2Jvd3Nlci9zcmMvYm93c2VyLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDclRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5REE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBOztBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MsIGN1c3RvbURvY3VtZW50KSB7XG4gIHZhciBkb2MgPSBjdXN0b21Eb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgaWYgKGRvYy5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgdmFyIHNoZWV0ID0gZG9jLmNyZWF0ZVN0eWxlU2hlZXQoKVxuICAgIHNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgcmV0dXJuIHNoZWV0Lm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBzdHlsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgfVxuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ieVVybCA9IGZ1bmN0aW9uKHVybCkge1xuICBpZiAoZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KHVybCkub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblxuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9IHVybDtcblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgcmV0dXJuIGxpbms7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2Nzc2lmeScpOyIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcbnZhciBMaWdodEJveCA9IHJlcXVpcmUoJy4vbGlnaHRib3gnKTtcbnZhciBDaGlsZFdpbmRvdyA9IHJlcXVpcmUoJy4vY2hpbGR3aW5kb3cnKTtcbnZhciBEZXZpY2UgPSByZXF1aXJlKCcuL2RldmljZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gcmVhZHkoZm4pIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT0gJ2xvYWRpbmcnKXtcbiAgICAgICAgICBmbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBBcHAoKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9DT05GSUcpO1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc0luaXRpYXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gbnVsbDtcbiAgICB9XG5cbiAgICBBcHAuZXZlbnRUeXBlcyA9IHtcbiAgICAgICAgSU5JVDogJ2luaXQnLFxuICAgICAgICBPUEVOOiAnb3BlbicsXG4gICAgICAgIE9QRU5fV0lORE9XOiAnb3Blbi13aW5kb3cnLFxuICAgICAgICBPUEVOX0xJR0hUQk9YOiAnb3Blbi1saWdodGJveCcsXG4gICAgICAgIExPQUQ6ICdsb2FkJyxcbiAgICAgICAgQ0xPU0U6ICdjbG9zZScsXG4gICAgICAgIENMT1NFX1dJTkRPVzogJ2Nsb3NlLXdpbmRvdycsXG4gICAgICAgIENMT1NFX0xJR0hUQk9YOiAnY2xvc2UtbGlnaHRib3gnLFxuICAgICAgICBTVEFUVVM6ICdzdGF0dXMnLFxuICAgICAgICBTVEFUVVNfSU5WT0lDRTogJ3N0YXR1cy1pbnZvaWNlJyxcbiAgICAgICAgU1RBVFVTX0RFTElWRVJJTkc6ICdzdGF0dXMtZGVsaXZlcmluZycsXG4gICAgICAgIFNUQVRVU19UUk9VQkxFRDogJ3N0YXR1cy10cm91YmxlZCcsXG4gICAgICAgIFNUQVRVU19ET05FOiAnc3RhdHVzLWRvbmUnXG4gICAgfTtcblxuICAgIHZhciBERUZBVUxUX0NPTkZJRyA9IHtcbiAgICAgICAgYWNjZXNzX3Rva2VuOiBudWxsLFxuICAgICAgICBhY2Nlc3NfZGF0YTogbnVsbCxcbiAgICAgICAgc2FuZGJveDogZmFsc2UsXG4gICAgICAgIGxpZ2h0Ym94OiB7fSxcbiAgICAgICAgY2hpbGRXaW5kb3c6IHt9LFxuICAgICAgICBob3N0OiAnc2VjdXJlLnhzb2xsYS5jb20nXG4gICAgfTtcbiAgICB2YXIgRVZFTlRfTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQnO1xuICAgIHZhciBBVFRSX1BSRUZJWCA9ICdkYXRhLXhwYXlzdGF0aW9uLXdpZGdldC1vcGVuJztcblxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXG4gICAgQXBwLnByb3RvdHlwZS5jb25maWcgPSB7fTtcbiAgICBBcHAucHJvdG90eXBlLmlzSW5pdGlhdGVkID0gZmFsc2U7XG4gICAgQXBwLnByb3RvdHlwZS5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XG5cbiAgICBBcHAucHJvdG90eXBlLmdldFBheXN0YXRpb25VcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBTQU5EQk9YX1BBWVNUQVRJT05fVVJMID0gJ2h0dHBzOi8vc2FuZGJveC1zZWN1cmUueHNvbGxhLmNvbS9wYXlzdGF0aW9uMi8/JztcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnNhbmRib3ggPyBTQU5EQk9YX1BBWVNUQVRJT05fVVJMIDogJ2h0dHBzOi8vJyArIHRoaXMuY29uZmlnLmhvc3QgKyAnL3BheXN0YXRpb24yLz8nO1xuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLmNoZWNrQ29uZmlnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc190b2tlbikgJiYgSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKSkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdObyBhY2Nlc3MgdG9rZW4gZ2l2ZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKSAmJiB0eXBlb2YgdGhpcy5jb25maWcuYWNjZXNzX2RhdGEgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0ludmFsaWQgYWNjZXNzIGRhdGEgZm9ybWF0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmhvc3QpKSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0ludmFsaWQgaG9zdCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUuY2hlY2tBcHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzSW5pdGlhdGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW5pdGlhbGl6ZSB3aWRnZXQgYmVmb3JlIG9wZW5pbmcnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKG1lc3NhZ2UpO1xuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgW10uZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJyk7XG4gICAgICAgICAgICBldmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2lkZ2V0IHdpdGggb3B0aW9uc1xuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG5cbiAgICAvLyBmdW5jdGlvbiBpbml0KG9wdGlvbnMpIHtcbiAgICAvLyAgICAgdGhpcy5pc0luaXRpYXRlZCA9IHRydWU7XG4gICAgLy8gICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9DT05GSUcsIG9wdGlvbnMpO1xuXG4gICAgLy8gICAgIHZhciBib2R5RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xuICAgIC8vICAgICB2YXIgY2xpY2tFdmVudE5hbWUgPSAnY2xpY2snICsgRVZFTlRfTkFNRVNQQUNFO1xuXG4gICAgLy8gICAgIHZhciBoYW5kbGVDbGlja0V2ZW50ID0gKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1snICsgQVRUUl9QUkVGSVggKyAnXScpO1xuICAgIC8vICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZUV2ZW50LnRhcmdldCA9PT0gdGFyZ2V0RWxlbWVudCkge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMub3Blbi5jYWxsKHRoaXMsIHRhcmdldEVsZW1lbnQpO1xuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgLy8gICAgIGJvZHlFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudE5hbWUsIGhhbmRsZUNsaWNrRXZlbnQpO1xuXG4gICAgLy8gICAgIHZhciBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgLy8gICAgIGNsaWNrRXZlbnQuaW5pdEV2ZW50KGNsaWNrRXZlbnROYW1lLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAvLyAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyAgICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcbiAgICAvLyAgICAgICAgIGJvZHlFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG4gICAgLy8gICAgIH0pLmJpbmQodGhpcyksIGZhbHNlKTtcblxuICAgIC8vICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGNsaWNrRXZlbnROYW1lLCBoYW5kbGVDbGlja0V2ZW50KTtcblxuICAgIC8vICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5JTklUKTtcbiAgICAvLyB9KVxuXG4gICAgLy8gQXBwLnByb3RvdHlwZS5pbml0ID0gcmVhZHkoKGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgLy8gICAgIHRoaXMuaXNJbml0aWF0ZWQgPSB0cnVlO1xuICAgIC8vICAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfQ09ORklHLCBvcHRpb25zKTtcblxuICAgIC8vICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcbiAgICAvLyAgICAgdmFyIGNsaWNrRXZlbnROYW1lID0gJ2NsaWNrJyArIEVWRU5UX05BTUVTUEFDRTtcblxuICAgIC8vICAgICB2YXIgaGFuZGxlQ2xpY2tFdmVudCA9IChmdW5jdGlvbihldmVudCkge1xuICAgIC8vICAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbJyArIEFUVFJfUFJFRklYICsgJ10nKTtcbiAgICAvLyAgICAgICAgIGlmIChldmVudC5zb3VyY2VFdmVudC50YXJnZXQgPT09IHRhcmdldEVsZW1lbnQpIHtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLm9wZW4uY2FsbCh0aGlzLCB0YXJnZXRFbGVtZW50KTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgIC8vICAgICBib2R5RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGNsaWNrRXZlbnROYW1lLCBoYW5kbGVDbGlja0V2ZW50KTtcblxuICAgIC8vICAgICB2YXIgY2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIC8vICAgICBjbGlja0V2ZW50LmluaXRFdmVudChjbGlja0V2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xuXG4gICAgLy8gICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gICAgICAgICBjbGlja0V2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG4gICAgLy8gICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuICAgIC8vICAgICB9KS5iaW5kKHRoaXMpLCBmYWxzZSk7XG5cbiAgICAvLyAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XG5cbiAgICAvLyAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuSU5JVCk7XG4gICAgLy8gfSkpO1xuXG4gICAgQXBwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBmdW5jdGlvbiBpbml0aWFsaXplKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbml0aWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRywgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHZhciBib2R5RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xuICAgICAgICAgICAgdmFyIGNsaWNrRXZlbnROYW1lID0gJ2NsaWNrJyArIEVWRU5UX05BTUVTUEFDRTtcblxuICAgICAgICAgICAgdmFyIGhhbmRsZUNsaWNrRXZlbnQgPSAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1snICsgQVRUUl9QUkVGSVggKyAnXScpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2VFdmVudC50YXJnZXQgPT09IHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuLmNhbGwodGhpcywgdGFyZ2V0RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XG5cbiAgICAgICAgICAgIHZhciBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgICAgICBjbGlja0V2ZW50LmluaXRFdmVudChjbGlja0V2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpO1xuXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGNsaWNrRXZlbnROYW1lLCBoYW5kbGVDbGlja0V2ZW50KTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLklOSVQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5LmNhbGwodGhpcywgaW5pdGlhbGl6ZS5jYWxsKCkpXG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzJywgdGhpcyk7XG4gICAgICAgIGRlYnVnZ2VyXG4gICAgICAgIHJlYWR5KGluaXRpYWxpemUuYmluZCh0aGlzLCBvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3BlbiBwYXltZW50IGludGVyZmFjZSAoUGF5U3RhdGlvbilcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tDb25maWcoKTtcbiAgICAgICAgdGhpcy5jaGVja0FwcCgpO1xuXG4gICAgICAgIHZhciB0cmlnZ2VyU3BsaXRTdGF0dXMgPSAoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoKChkYXRhIHx8IHt9KS5wYXltZW50SW5mbyB8fCB7fSkuc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW52b2ljZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19JTlZPSUNFLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsaXZlcmluZyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19ERUxJVkVSSU5HLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndHJvdWJsZWQnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfVFJPVUJMRUQsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkb25lJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX0RPTkUsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgICAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgcXVlcnkuYWNjZXNzX3Rva2VuID0gdGhpcy5jb25maWcuYWNjZXNzX3Rva2VuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcXVlcnkuYWNjZXNzX2RhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmNvbmZpZy5hY2Nlc3NfZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXJsID0gdGhpcy5nZXRQYXlzdGF0aW9uVXJsKCkgKyBIZWxwZXJzLnBhcmFtKHF1ZXJ5KTtcblxuICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gbnVsbDtcbiAgICAgICAgaWYgKChuZXcgRGV2aWNlKS5pc01vYmlsZSgpKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRXaW5kb3cgPSBuZXcgQ2hpbGRXaW5kb3c7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignb3BlbicsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IGNoaWxkV2luZG93LmdldFBvc3RNZXNzYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTik7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTl9XSU5ET1cpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignbG9hZCcsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuTE9BRCk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdjbG9zZScsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0UpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkNMT1NFX1dJTkRPVyk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdzdGF0dXMnLCAoZnVuY3Rpb24gKGV2ZW50LCBzdGF0dXNEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTLCBzdGF0dXNEYXRhKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU3BsaXRTdGF0dXMoc3RhdHVzRGF0YSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9wZW4odXJsLCB0aGlzLmNvbmZpZy5jaGlsZFdpbmRvdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbGlnaHRCb3ggPSBuZXcgTGlnaHRCb3g7XG4gICAgICAgICAgICBsaWdodEJveC5vbignb3BlbicsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IGxpZ2h0Qm94LmdldFBvc3RNZXNzYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTik7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTl9MSUdIVEJPWCk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdsb2FkJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgbGlnaHRCb3gub24oJ2Nsb3NlJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0VfTElHSFRCT1gpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBsaWdodEJveC5vbignc3RhdHVzJywgKGZ1bmN0aW9uIChldmVudCwgc3RhdHVzRGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVUywgc3RhdHVzRGF0YSk7XG4gICAgICAgICAgICAgICAgdHJpZ2dlclNwbGl0U3RhdHVzKHN0YXR1c0RhdGEpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBsaWdodEJveC5vcGVuRnJhbWUodXJsLCB0aGlzLmNvbmZpZy5saWdodGJveCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gZm9yIG9uZSBvciBtb3JlIGV2ZW50cyB0byB0aGUgd2lkZ2V0XG4gICAgICogQHBhcmFtIGV2ZW50IE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlcyAoaW5pdCwgb3BlbiwgbG9hZCwgY2xvc2UsIHN0YXR1cywgc3RhdHVzLWludm9pY2UsIHN0YXR1cy1kZWxpdmVyaW5nLCBzdGF0dXMtdHJvdWJsZWQsIHN0YXR1cy1kb25lKVxuICAgICAqIEBwYXJhbSBoYW5kbGVyIEEgZnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWRcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlcik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbiBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIGV2ZW50IE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlc1xuICAgICAqIEBwYXJhbSBoYW5kbGVyIEEgaGFuZGxlciBmdW5jdGlvbiBwcmV2aW91c2x5IGF0dGFjaGVkIGZvciB0aGUgZXZlbnQocylcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlcikge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZihldmVudCwgaGFuZGxlcik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXNzYWdlIGRpcmVjdGx5IHRvIFBheVN0YXRpb25cbiAgICAgKiBAcGFyYW0gY29tbWFuZFxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uIChjb21tYW5kLCBkYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlLnNlbmQuYXBwbHkodGhpcy5wb3N0TWVzc2FnZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbiBmb3IgbWVzc2FnZSBldmVudCBmcm9tIFBheVN0YXRpb25cbiAgICAgKiBAcGFyYW0gY29tbWFuZFxuICAgICAqIEBwYXJhbSBoYW5kbGVyXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5vbk1lc3NhZ2UgPSBmdW5jdGlvbiAoY29tbWFuZCwgaGFuZGxlcikge1xuICAgICAgICBpZiAodGhpcy5wb3N0TWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZS5vbi5hcHBseSh0aGlzLnBvc3RNZXNzYWdlLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBBcHA7XG59KSgpO1xuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKTtcbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgUG9zdE1lc3NhZ2UgPSByZXF1aXJlKCcuL3Bvc3RtZXNzYWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDaGlsZFdpbmRvdygpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcywgd3JhcEV2ZW50SW5OYW1lc3BhY2UpO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZXZlbnROYW1lICsgJ18nICsgQ2hpbGRXaW5kb3cuX05BTUVTUEFDRTtcbiAgICB9XG5cbiAgICB2YXIgREVGQVVMVF9PUFRJT05TID0ge1xuICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnXG4gICAgfTtcblxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmV2ZW50T2JqZWN0ID0gbnVsbDtcbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuY2hpbGRXaW5kb3cgPSBudWxsO1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0LnRyaWdnZXIoZXZlbnQsIGRhdGEpO1xuICAgIH07XG5cbiAgICAvKiogUHVibGljIE1lbWJlcnMgKiovXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0aGlzLmNoaWxkV2luZG93ICYmICF0aGlzLmNoaWxkV2luZG93LmNsb3NlZCkge1xuICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFkZEhhbmRsZXJzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMub24oJ2Nsb3NlJywgKGZ1bmN0aW9uIGhhbmRsZUNsb3NlKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5jbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpXG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgLy8gQ3Jvc3Mtd2luZG93IGNvbW11bmljYXRpb25cbiAgICAgICAgICAgIHRoaXMubWVzc2FnZSA9IG5ldyBQb3N0TWVzc2FnZSh0aGlzLmNoaWxkV2luZG93KTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbignZGltZW5zaW9ucyB3aWRnZXQtZGV0ZWN0aW9uJywgKGZ1bmN0aW9uIHdpZGdldERldGVjdGlvbkhhbmRsZShldmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdsb2FkJyk7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RpbWVuc2lvbnMgd2lkZ2V0LWRldGVjdGlvbicsIGhhbmRsZVdpZGdldERldGVjdGlvbik7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbignd2lkZ2V0LWRldGVjdGlvbicsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBjaGlsZFdpbmRvd09wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdzdGF0dXMnLCAoZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ3N0YXR1cycsIGRhdGEpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLm9uKCdjbG9zZScsIChmdW5jdGlvbiBoYW5kbGVDbG9zZShldmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vZmYoKTtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgICAgICBjYXNlICdfc2VsZic6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdyA9IGdsb2JhbC53aW5kb3c7XG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdfcGFyZW50JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdfYmxhbmsnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5vcGVuKHVybCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tXaW5kb3cgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciB0aW1lciA9IGdsb2JhbC5zZXRUaW1lb3V0KGNoZWNrV2luZG93LCAxMDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ29wZW4nKTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlcik7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIpO1xuICAgIH07XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZ2V0UG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93Ll9OQU1FU1BBQ0UgPSAnQ0hJTERfV0lORE9XJztcblxuICAgIHJldHVybiBDaGlsZFdpbmRvdztcbn0pKCk7XG4iLCJ2YXIgYm93c2VyID0gcmVxdWlyZSgnYm93c2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZXZpY2UoKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW9iaWxlIGRldmljZXNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBEZXZpY2UucHJvdG90eXBlLmlzTW9iaWxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBib3dzZXIubW9iaWxlIHx8IGJvd3Nlci50YWJsZXQ7XG4gICAgfTtcblxuICAgIHJldHVybiBEZXZpY2U7XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdGhpcy5uYW1lID0gXCJYc29sbGFQYXlTdGF0aW9uV2lkZ2V0RXhjZXB0aW9uXCI7XG4gICAgdGhpcy50b1N0cmluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyAnOiAnICsgdGhpcy5tZXNzYWdlO1xuICAgIH0pLmJpbmQodGhpcyk7XG59O1xuIiwiZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdW5pcShsaXN0KSB7XG4gIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4LCBpLCBhKSB7XG4gICAgcmV0dXJuIGEuaW5kZXhPZih4KSA9PSBpXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB6aXBPYmplY3QocHJvcHMsIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzID8gcHJvcHMubGVuZ3RoIDogMCxcbiAgICAgIHJlc3VsdCA9IHt9O1xuXG4gIGlmIChsZW5ndGggJiYgIXZhbHVlcyAmJiAhQXJyYXkuaXNBcnJheShwcm9wc1swXSkpIHtcbiAgICB2YWx1ZXMgPSBbXTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgaWYgKHZhbHVlcykge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZXNbaW5kZXhdO1xuICAgIH0gZWxzZSBpZiAoa2V5KSB7XG4gICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcGFyYW0oYSkge1xuICB2YXIgcyA9IFtdO1xuXG4gIHZhciBhZGQgPSBmdW5jdGlvbiAoaywgdikge1xuICAgICAgdiA9IHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nID8gdigpIDogdjtcbiAgICAgIHYgPSB2ID09PSBudWxsID8gJycgOiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHY7XG4gICAgICBzW3MubGVuZ3RoXSA9IGVuY29kZVVSSUNvbXBvbmVudChrKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2KTtcbiAgfTtcblxuICB2YXIgYnVpbGRQYXJhbXMgPSBmdW5jdGlvbiAocHJlZml4LCBvYmopIHtcbiAgICAgIHZhciBpLCBsZW4sIGtleTtcblxuICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhcbiAgICAgICAgICAgICAgICAgICAgICBwcmVmaXggKyAnWycgKyAodHlwZW9mIG9ialtpXSA9PT0gJ29iamVjdCcgJiYgb2JqW2ldID8gaSA6ICcnKSArICddJyxcbiAgICAgICAgICAgICAgICAgICAgICBvYmpbaV1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKFN0cmluZyhvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICAgIGJ1aWxkUGFyYW1zKHByZWZpeCArICdbJyArIGtleSArICddJywgb2JqW2tleV0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYWRkKHByZWZpeCwgb2JqKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICBhZGQob2JqW2ldLm5hbWUsIG9ialtpXS52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgYnVpbGRQYXJhbXMoa2V5LCBvYmpba2V5XSk7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHM7XG4gIH07XG5cbiAgcmV0dXJuIGJ1aWxkUGFyYW1zKCcnLCBhKS5qb2luKCcmJyk7XG59O1xuXG5cbmZ1bmN0aW9uIG9uY2UoZikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBmKCk7XG4gICAgICBmID0gZnVuY3Rpb24oKSB7fTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRFdmVudE9iamVjdChjb250ZXh0LCB3cmFwRXZlbnRJbk5hbWVzcGFjZSkge1xuICAgIHZhciBkdW1teVdyYXBwZXIgPSBmdW5jdGlvbihldmVudCkgeyByZXR1cm4gZXZlbnQgfTtcbiAgICB2YXIgd3JhcEV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZSB8fCBkdW1teVdyYXBwZXI7XG4gICAgY29uc29sZS5sb2coJ3dyYXBFdmVudEluTmFtZXNwYWNlJywgd3JhcEV2ZW50SW5OYW1lc3BhY2UoJ3Rlc3QnKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyaWdnZXI6IChmdW5jdGlvbihldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50SW5OYW1lc3BhY2UsIHtkZXRhaWw6IGRhdGF9KTsgLy8gTm90IHdvcmtpbmcgaW4gSUVcbiAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudEluTmFtZXNwYWNlLCB0cnVlLCB0cnVlLCBkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICB9KS5iaW5kKGNvbnRleHQpLFxuICAgICAgb246IChmdW5jdGlvbihldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZSwgb3B0aW9ucyk7XG4gICAgICB9KS5iaW5kKGNvbnRleHQpLFxuICAgICAgb2ZmOiAoZnVuY3Rpb24oZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XG4gICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudEluTmFtZXNwYWNlLCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgICAgfSkuYmluZChjb250ZXh0KVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkRXZlbnRPYmplY3Q6IGFkZEV2ZW50T2JqZWN0LFxuICBpc0VtcHR5OiBpc0VtcHR5LFxuICB1bmlxOiB1bmlxLFxuICB6aXBPYmplY3Q6IHppcE9iamVjdCxcbiAgcGFyYW06IHBhcmFtLFxuICBvbmNlOiBvbmNlLFxufVxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKTtcbnZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgUG9zdE1lc3NhZ2UgPSByZXF1aXJlKCcuL3Bvc3RtZXNzYWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMaWdodEJveCgpIHtcbiAgICAgICAgcmVxdWlyZSgnLi9zdHlsZXMvbGlnaHRib3guc2NzcycpO1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzLCB3cmFwRXZlbnRJbk5hbWVzcGFjZSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IERFRkFVTFRfT1BUSU9OUztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgQ0xBU1NfUFJFRklYID0gJ3hwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveCc7XG4gICAgdmFyIEVWRU5UX05BTUVTUEFDRSA9ICcueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94JztcbiAgICB2YXIgREVGQVVMVF9PUFRJT05TID0ge1xuICAgICAgICB3aWR0aDogbnVsbCxcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgIHpJbmRleDogMTAwMCxcbiAgICAgICAgb3ZlcmxheU9wYWNpdHk6ICcuNicsXG4gICAgICAgIG92ZXJsYXlCYWNrZ3JvdW5kOiAnIzAwMDAwMCcsXG4gICAgICAgIGNvbnRlbnRCYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXG4gICAgICAgIGNvbnRlbnRNYXJnaW46ICcxMHB4JyxcbiAgICAgICAgY2xvc2VCeUtleWJvYXJkOiB0cnVlLFxuICAgICAgICBjbG9zZUJ5Q2xpY2s6IHRydWUsXG4gICAgICAgIG1vZGFsOiBmYWxzZSxcbiAgICAgICAgc3Bpbm5lcjogJ3hzb2xsYScsXG4gICAgICAgIHNwaW5uZXJDb2xvcjogbnVsbCxcbiAgICAgICAgc3Bpbm5lclVybDogbnVsbCxcbiAgICAgICAgc3Bpbm5lclJvdGF0aW9uUGVyaW9kOiAwXG4gICAgfTtcblxuICAgIHZhciBTUElOTkVSUyA9IHtcbiAgICAgICAgeHNvbGxhOiByZXF1aXJlKCcuL3NwaW5uZXJzL3hzb2xsYS5zdmcnKSxcbiAgICAgICAgcm91bmQ6IHJlcXVpcmUoJy4vc3Bpbm5lcnMvcm91bmQuc3ZnJyksXG4gICAgICAgIG5vbmU6ICcgJ1xuICAgIH07XG5cbiAgICB2YXIgTUlOX1BTX0RJTUVOU0lPTlMgPSB7XG4gICAgICAgIGhlaWdodDogNTAwLFxuICAgICAgICB3aWR0aDogNjAwXG4gICAgfTtcblxuICAgIHZhciBoYW5kbGVLZXl1cEV2ZW50TmFtZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKCdrZXl1cCcpO1xuXG4gICAgdmFyIGhhbmRsZUtleXVwID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09IDI3KSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gZXZlbnROYW1lICsgJ18nICsgRVZFTlRfTkFNRVNQQUNFO1xuICAgIH1cblxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5tZWFzdXJlU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkgeyAvLyB0aHggd2Fsc2g6IGh0dHBzOi8vZGF2aWR3YWxzaC5uYW1lL2RldGVjdC1zY3JvbGxiYXItd2lkdGhcbiAgICAgICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcm9sbERpdi5jbGFzc0xpc3QuYWRkKFwic2Nyb2xsYmFyLW1lYXN1cmVcIik7XG4gICAgICAgIHNjcm9sbERpdi5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFxuICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXG4gICAgICAgIFwidG9wOiAtOTk5OXB4XCIgK1xuICAgICAgICBcIndpZHRoOiA1MHB4XCIgK1xuICAgICAgICBcImhlaWdodDogNTBweFwiICtcbiAgICAgICAgXCJvdmVyZmxvdzogc2Nyb2xsXCJcbiAgICApO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Nyb2xsRGl2KTtcblxuICAgICAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGg7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcblxuICAgICAgICByZXR1cm4gc2Nyb2xsYmFyV2lkdGg7XG4gICAgfTtcblxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cbiAgICBMaWdodEJveC5wcm90b3R5cGUub3BlbkZyYW1lID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgIHZhciBzcGlubmVyID0gb3B0aW9ucy5zcGlubmVyID09PSAnY3VzdG9tJyAmJiAhIW9wdGlvbnMuc3Bpbm5lclVybCA/XG4gICAgICAgICAgICAnPGltZyBjbGFzcz1cInNwaW5uZXItY3VzdG9tXCIgc3JjPVwiJyArIGVuY29kZVVSSShvcHRpb25zLnNwaW5uZXJVcmwpICsgJ1wiIC8+JyA6IFNQSU5ORVJTW29wdGlvbnMuc3Bpbm5lcl0gfHwgT2JqZWN0LnZhbHVlcyhTUElOTkVSUylbMF07XG5cbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgICAgICAgICB2YXIgaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaG9zdC5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXg7XG5cbiAgICAgICAgICAgIHZhciBvdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBvdmVybGF5LmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctb3ZlcmxheSc7XG5cbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBjb250ZW50LmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctY29udGVudCcgKyAnICcgKyBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnRfX2hpZGRlbic7XG5cbiAgICAgICAgICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgICAgIGlmcmFtZS5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnQtaWZyYW1lJztcbiAgICAgICAgICAgIGlmcmFtZS5zcmMgPSBzZXR0aW5ncy51cmw7XG4gICAgICAgICAgICBpZnJhbWUuZnJhbWVCb3JkZXIgPSAnMCc7XG4gICAgICAgICAgICBpZnJhbWUuYWxsb3dGdWxsc2NyZWVuID0gdHJ1ZTtcblxuICAgICAgICAgICAgdmFyIHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1zcGlubmVyJztcbiAgICAgICAgICAgIHNwaW5uZXIuaW5uZXJIVE1MID0gc2V0dGluZ3Muc3Bpbm5lcjtcblxuICAgICAgICAgICAgY29udGVudC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKG92ZXJsYXkpO1xuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQoc3Bpbm5lcik7XG5cbiAgICAgICAgICAgIHJldHVybiBob3N0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBib2R5RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xuICAgICAgICB2YXIgbGlnaHRCb3hFbGVtZW50ID0gdGVtcGxhdGUoe1xuICAgICAgICAgICAgcHJlZml4OiBDTEFTU19QUkVGSVgsXG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIHNwaW5uZXI6IHNwaW5uZXJcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBsaWdodEJveE92ZXJsYXlFbGVtZW50ID0gbGlnaHRCb3hFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1vdmVybGF5Jyk7XG4gICAgICAgIHZhciBsaWdodEJveENvbnRlbnRFbGVtZW50ID0gbGlnaHRCb3hFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1jb250ZW50Jyk7XG4gICAgICAgIHZhciBsaWdodEJveElmcmFtZUVsZW1lbnQgPSBsaWdodEJveENvbnRlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1jb250ZW50LWlmcmFtZScpO1xuICAgICAgICB2YXIgbGlnaHRCb3hTcGlubmVyRWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctc3Bpbm5lcicpO1xuXG4gICAgICAgIHZhciBwc0RpbWVuc2lvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogJzBweCcsXG4gICAgICAgICAgICBoZWlnaHQ6ICcwcHgnXG4gICAgICAgIH07XG5cbiAgICAgICAgbGlnaHRCb3hFbGVtZW50LnN0eWxlLnpJbmRleCA9IG9wdGlvbnMuekluZGV4O1xuXG4gICAgICAgIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IG9wdGlvbnMub3ZlcmxheU9wYWNpdHk7XG4gICAgICAgIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5vdmVybGF5QmFja2dyb3VuZDtcblxuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMuY29udGVudEJhY2tncm91bmQ7XG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubWFyZ2luID0gb3B0aW9ucy5jb250ZW50TWFyZ2luO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnNwaW5uZXJDb2xvcikge1xuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwYXRoJykuc3R5bGUuZmlsbCA9IG9wdGlvbnMuc3Bpbm5lckNvbG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc3Bpbm5lciA9PT0gJ2N1c3RvbScpIHtcbiAgICAgICAgICAgIHZhciBzcGlubmVyQ3VzdG9tID0gbGlnaHRCb3hTcGlubmVyRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3Bpbm5lci1jdXN0b20nKTtcbiAgICAgICAgICAgIHNwaW5uZXJDdXN0b20uc3R5bGVbJy13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uJ10gPSBvcHRpb25zLnNwaW5uZXJSb3RhdGlvblBlcmlvZCArICdzOyc7XG4gICAgICAgICAgICBzcGlubmVyQ3VzdG9tLnN0eWxlWydhbmltYXRpb24tZHVyYXRpb24nXSA9IG9wdGlvbnMuc3Bpbm5lclJvdGF0aW9uUGVyaW9kICsgJ3M7JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmNsb3NlQnlDbGljaykge1xuICAgICAgICAgICAgbGlnaHRCb3hPdmVybGF5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHlFbGVtZW50LmFwcGVuZENoaWxkKGxpZ2h0Qm94RWxlbWVudCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUtleWJvYXJkKSB7XG5cbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGhhbmRsZUtleXVwKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgICAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBjbGlja0V2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG5cbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNob3dDb250ZW50ID0gSGVscGVycy5vbmNlKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBoaWRlU3Bpbm5lcihvcHRpb25zKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19QUkVGSVggKyAnLWNvbnRlbnRfX2hpZGRlbicpXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnbG9hZCcpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB2YXIgbGlnaHRCb3hSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoID8gb3B0aW9ucy53aWR0aCA6IHBzRGltZW5zaW9ucy53aWR0aDtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCA/IG9wdGlvbnMuaGVpZ2h0IDogcHNEaW1lbnNpb25zLmhlaWdodDtcblxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnOHB4JztcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGggPSBsaWdodEJveEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gbGlnaHRCb3hFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IG91dGVyV2lkdGgobGlnaHRCb3hDb250ZW50RWxlbWVudCksXG4gICAgICAgICAgICAgICAgY29udGVudEhlaWdodCA9IG91dGVySGVpZ2h0KGxpZ2h0Qm94Q29udGVudEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB2YXIgaG9yTWFyZ2luID0gY29udGVudFdpZHRoIC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIHZlcnRNYXJnaW4gPSBjb250ZW50SGVpZ2h0IC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgICAgIHZhciBob3JEaWZmID0gY29udGFpbmVyV2lkdGggLSBjb250ZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydERpZmYgPSBjb250YWluZXJIZWlnaHQgLSBjb250ZW50SGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoaG9yRGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gY29udGFpbmVyV2lkdGggLSBob3JNYXJnaW4gKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmxlZnQgPSBNYXRoLnJvdW5kKGhvckRpZmYgLyAyKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2ZXJ0RGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHZlcnRNYXJnaW4gKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLnRvcCA9IE1hdGgucm91bmQodmVydERpZmYgLyAyKSArICdweCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gb3V0ZXJXaWR0aChlbCkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luTGVmdCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5SaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG91dGVySGVpZ2h0KGVsKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYm9keVN0eWxlcztcbiAgICAgICAgdmFyIGhpZGVTY3JvbGxiYXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYm9keVN0eWxlcyA9IEhlbHBlcnMuemlwT2JqZWN0KFsnb3ZlcmZsb3cnLCAncGFkZGluZ1JpZ2h0J10ubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2tleSwgZ2V0Q29tcHV0ZWRTdHlsZShib2R5RWxlbWVudClba2V5XV07XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGlmIChnbG9iYWwud2luZG93LmlubmVyV2lkdGggPiBvdXRlcldpZHRoKGJvZHlFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKGdldENvbXB1dGVkU3R5bGUoYm9keUVsZW1lbnQpW3BhZGRpbmdSaWdodF0gfHwgMCksIDEwKTtcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW47JztcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBib2R5UGFkICsgdGhpcy5tZWFzdXJlU2Nyb2xsYmFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdmFyIHJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhib2R5U3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZVtrZXldID0gYm9keVN0eWxlc1trZXldO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNob3dTcGlubmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaGlkZVNwaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxvYWRUaW1lcjtcbiAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZnVuY3Rpb24gaGFuZGxlTG9hZChldmVudCkge1xuICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSAhb3B0aW9ucy53aWR0aCB8fCAhb3B0aW9ucy5oZWlnaHQgPyAzMDAwMCA6IDEwMDA7IC8vMzAwMDAgaWYgcHNEaW1lbnNpb25zIHdpbGwgbm90IGFycml2ZVxuICAgICAgICAgICAgbG9hZFRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgaGFuZGxlTG9hZCk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHZhciBpZnJhbWVXaW5kb3cgPSBsaWdodEJveElmcmFtZUVsZW1lbnQuY29udGVudFdpbmRvdyB8fCBsaWdodEJveElmcmFtZUVsZW1lbnQ7XG5cbiAgICAgICAgLy8gQ3Jvc3Mtd2luZG93IGNvbW11bmljYXRpb25cbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKGlmcmFtZVdpbmRvdyk7XG4gICAgICAgIGlmIChvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2RpbWVuc2lvbnMnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2RpbWVuc2lvbnMnLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBldmVudC5kZXRhaWw7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZGltZW5zaW9ucykge1xuICAgICAgICAgICAgICAgICAgICBwc0RpbWVuc2lvbnMgPSBIZWxwZXJzLnppcE9iamVjdChbJ3dpZHRoJywgJ2hlaWdodCddLm1hcChmdW5jdGlvbiAoZGltKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2RpbSwgTWF0aC5tYXgoTUlOX1BTX0RJTUVOU0lPTlNbZGltXSB8fCAwLCBkYXRhLmRpbWVuc2lvbnNbZGltXSB8fCAwKSArICdweCddO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hvd0NvbnRlbnQoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3dpZGdldC1kZXRlY3Rpb24nLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBsaWdodEJveE9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignd2lkZ2V0LWNsb3NlJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdzdGF0dXMnLCAoZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZGF0YSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIFJlc2l6ZVxuICAgICAgICB2YXIgaGFuZGxlUmVzaXplRXZlbnROYW1lID0gJ3Jlc2l6ZScgKyBFVkVOVF9OQU1FU1BBQ0U7XG5cbiAgICAgICAgdmFyIHJlc2l6ZUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIHJlc2l6ZUV2ZW50LmluaXRFdmVudChoYW5kbGVSZXNpemVFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihoYW5kbGVSZXNpemVFdmVudE5hbWUsIGxpZ2h0Qm94UmVzaXplKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHJlc2l6ZUV2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG4gICAgICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KHJlc2l6ZUV2ZW50KTtcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBDbGVhbiB1cCBhZnRlciBjbG9zZVxuICAgICAgICB0aGlzLm9uKCdjbG9zZScsIChmdW5jdGlvbiBoYW5kbGVDbG9zZShldmVudCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9mZigpO1xuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgaGFuZGxlS2V5dXApXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVSZXNpemVFdmVudE5hbWUsIGxpZ2h0Qm94UmVzaXplKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGxpZ2h0Qm94RWxlbWVudCk7XG4gICAgICAgICAgICByZXNldFNjcm9sbGJhcigpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpXG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICAgICAgICBsaWdodEJveFJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHNob3dTcGlubmVyKCk7XG4gICAgICAgIGhpZGVTY3JvbGxiYXIoKTtcblxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnb3BlbicpO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUuY2xvc2VGcmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMubW9kYWwpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbi5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZi5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUuZ2V0UG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94Ll9OQU1FU1BBQ0UgPSBFVkVOVF9OQU1FU1BBQ0U7XG5cbiAgICByZXR1cm4gTGlnaHRCb3g7XG59KSgpO1xuIiwiZnVuY3Rpb24gb2JqZWN0QXNzaWduKCkge1xuICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduIFBvbHlmaWxsXG4gIE9iamVjdC5hc3NpZ258fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QsXCJhc3NpZ25cIix7ZW51bWVyYWJsZTohMSxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6ZnVuY3Rpb24oZSxyKXtcInVzZSBzdHJpY3RcIjtpZihudWxsPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCBmaXJzdCBhcmd1bWVudCB0byBvYmplY3RcIik7Zm9yKHZhciB0PU9iamVjdChlKSxuPTE7bjxhcmd1bWVudHMubGVuZ3RoO24rKyl7dmFyIG89YXJndW1lbnRzW25dO2lmKG51bGwhPW8pZm9yKHZhciBhPU9iamVjdC5rZXlzKE9iamVjdChvKSksYz0wLGI9YS5sZW5ndGg7YzxiO2MrKyl7dmFyIGk9YVtjXSxsPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobyxpKTt2b2lkIDAhPT1sJiZsLmVudW1lcmFibGUmJih0W2ldPW9baV0pfX1yZXR1cm4gdH19KTtcbn1cblxuZnVuY3Rpb24gYXJyYXlGb3JFYWNoKCkge1xuICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaHx8KEFycmF5LnByb3RvdHlwZS5mb3JFYWNoPWZ1bmN0aW9uKHIsbyl7dmFyIHQsbjtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3IoXCIgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkXCIpO3ZhciBlPU9iamVjdCh0aGlzKSxpPWUubGVuZ3RoPj4+MDtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiByKXRocm93IG5ldyBUeXBlRXJyb3IocitcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtmb3IoYXJndW1lbnRzLmxlbmd0aD4xJiYodD1vKSxuPTA7bjxpOyl7dmFyIGY7biBpbiBlJiYoZj1lW25dLHIuY2FsbCh0LGYsbixlKSksbisrfX0pO1xufVxuXG5mdW5jdGlvbiBhcHBseVBvbHlmaWxscygpIHtcbiAgb2JqZWN0QXNzaWduKCk7XG4gIGFycmF5Rm9yRWFjaCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXBwbHlQb2x5ZmlsbHM6IGFwcGx5UG9seWZpbGxzXG59XG4iLCJ2YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUG9zdE1lc3NhZ2Uod2luZG93KSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMpO1xuICAgICAgICB0aGlzLmxpbmtlZFdpbmRvdyA9IHdpbmRvdztcblxuICAgICAgICBnbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgZ2xvYmFsLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlICE9PSB0aGlzLmxpbmtlZFdpbmRvdykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnQuZGF0YSA9PT0gJ3N0cmluZycgJiYgZ2xvYmFsLkpTT04gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBnbG9iYWwuSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyKG1lc3NhZ2UuY29tbWFuZCwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBudWxsO1xuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5saW5rZWRXaW5kb3cgPSBudWxsO1xuXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oY29tbWFuZCwgZGF0YSwgdGFyZ2V0T3JpZ2luKSB7XG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRPcmlnaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGFyZ2V0T3JpZ2luID0gJyonO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmxpbmtlZFdpbmRvdyB8fCB0aGlzLmxpbmtlZFdpbmRvdy5wb3N0TWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IGdsb2JhbC53aW5kb3cuSlNPTiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5saW5rZWRXaW5kb3cucG9zdE1lc3NhZ2UoZ2xvYmFsLkpTT04uc3RyaW5naWZ5KHtkYXRhOiBkYXRhLCBjb21tYW5kOiBjb21tYW5kfSksIHRhcmdldE9yaWdpbik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFBvc3RNZXNzYWdlO1xufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHdpZHRoPVxcXCI0N3B4XFxcIiBoZWlnaHQ9XFxcIjQ3cHhcXFwiIGNsYXNzPVxcXCJzcGlubmVyLXJvdW5kXFxcIj48cGF0aCBkPVxcXCJNNC43ODUyNzI4LDEwLjQyMTA4NzUgQzIuOTQxMTE2NjQsMTMuMDU1MjE5NyAxLjYzNzc3MTA5LDE2LjA5NDYxMDYgMS4wMzc1Mzk1NiwxOS4zNzY4NTU2IEw1LjE2NjM4OTcxLDE5LjM3Njg1NTYgQzUuNjQyOTYxNSwxNy4xODc1NTQgNi41MDEyNTI0MywxNS4xMzkxNjQgNy42Njc2ODg5OSwxMy4zMDUzMDUgTDUuOTU1NzI0MjgsMTEuNTkyMjcwNSBMNC43ODUyNzI4LDEwLjQyMTA4NzUgTDQuNzg1MjcyOCwxMC40MjEwODc1IFogTTEwLjQ2OTMwNDgsNC43NDU2NTYxNSBDMTMuMTI3NDg3MywyLjg5MDgwNjEgMTYuMTk2NTk3NiwxLjU4Njc0NjQ4IDE5LjUxMDAxNjEsMSBMMTkuNTEwMDE2MSw0Ljk5NTIzOTM0IEMxNy4yNzEwOTIzLDUuNDg3OTc3ODIgMTUuMTgwMzE5Myw2LjM4MDg1MjkgMTMuMzE2NjkwNyw3LjU5NDgyMTUzIEwxMS42MzM3MzM5LDUuOTEwODEyOTMgTDEwLjQ2OTMwNDgsNC43NDU2NTYxNSBMMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IFogTTQyLjI0MjYzMDksMzYuNTM4ODM4NiBDNDQuMTExMjc4MiwzMy44NTc1MDE2IDQ1LjQyMDY0NjEsMzAuNzU4MTUwNCA0NiwyNy40MTE3MjY5IEw0MS45NDQxMjExLDI3LjQxMTcyNjkgQzQxLjQ1Mjc5NDUsMjkuNjYxODkyNiA0MC41NTgzNjkyLDMxLjc2MjkxMSAzOS4zNDA0NDEyLDMzLjYzNDkzNTYgTDQxLjAzMzIzNDcsMzUuMzI4Nzg2OSBMNDIuMjQyNTMwNiwzNi41Mzg4Mzg2IEw0Mi4yNDI2MzA5LDM2LjUzODgzODYgWiBNMzYuNTcwNzQ0MSw0Mi4yMjY0MjI3IEMzMy45MTY3NzczLDQ0LjA4Njc5NjcgMzAuODUwOTc5Myw0NS4zOTcyODQyIDI3LjUzOTg2OTMsNDUuOTkxMTYxNiBMMjcuNTM5ODY5Myw0MS43OTYwNTQ5IEMyOS43Mzc2NDAyLDQxLjMyMDI5MDEgMzEuNzkzNjg0MSw0MC40NTkzNTM2IDMzLjYzMzYyNDYsMzkuMjg3NTY4IEwzNS4zNTU0MjU4LDQxLjAxMDQ0NTMgTDM2LjU3MDc0NDEsNDIuMjI2NTIzMSBMMzYuNTcwNzQ0MSw0Mi4yMjY0MjI3IFogTTQuNzExNzk5NjUsMzYuNDczMTUzNSBDMi44Njc0NDI3NCwzMy44MDY5ODIzIDEuNTc0NjM2MzcsMzAuNzMwOTMyMiAxLDI3LjQxMTgyNzMgTDUuMTY4ODk5MDQsMjcuNDExODI3MyBDNS42NDgyODEyOCwyOS42MDczNTU5IDYuNTExNTkwODcsMzEuNjYxMDY5IDcuNjg0NjUyMDUsMzMuNDk4NDQzMiBMNS45NTU3MjQyOCwzNS4yMjg0NTE1IEw0LjcxMTc5OTY1LDM2LjQ3MzE1MzUgTDQuNzExNzk5NjUsMzYuNDczMTUzNSBaIE0xMC4zNjQwMTMzLDQyLjE4MDQyMyBDMTMuMDQ2Mjg1NCw0NC4wNzQ1NDM1IDE2LjE1MjczNDUsNDUuNDA1NTIgMTkuNTEwMTE2NSw0NiBMMTkuNTEwMTE2NSw0MS43ODIxOTQ3IEMxNy4yODE3MzE5LDQxLjI5MTY2NTggMTUuMjAwMDkyOCw0MC40MDQ4MTY5IDEzLjM0MzA4ODksMzkuMTk5NTg2MiBMMTEuNjMzNzMzOSw0MC45MTAwMDk0IEwxMC4zNjQwMTMzLDQyLjE4MDUyMzUgTDEwLjM2NDAxMzMsNDIuMTgwNDIzIFogTTQyLjE2ODg1NjcsMTAuMzU1NzAzOCBDNDQuMDM3MzAzMSwxMy4wMDQ4MDA4IDQ1LjM1NzQxMSwxNi4wNjc0OTI5IDQ1Ljk2MjY2MTIsMTkuMzc2ODU1NiBMNDEuOTQ2OTMxNiwxOS4zNzY4NTU2IEM0MS40NTg1MTU4LDE3LjEzMjgxNjQgNDAuNTY5MjA5NSwxNS4wMzY5MjAyIDM5LjM1ODAwNjUsMTMuMTY4NDEwOSBMNDEuMDMzNTM1OCwxMS40OTE4MzQ2IEw0Mi4xNjg5NTcsMTAuMzU1NzAzOCBMNDIuMTY4ODU2NywxMC4zNTU3MDM4IFogTTM2LjQ2NTE1MTYsNC42OTk5NTc4MiBDMzMuODM1NTc1NCwyLjg3ODY1MzM2IDMwLjgwNzExNjIsMS41OTQ4ODE3OSAyNy41NDAwNzAxLDEuMDA4ODM4MzYgTDI3LjU0MDA3MDEsNC45ODExNzgzMSBDMjkuNzQ4NDgwNSw1LjQ1OTE1MjcyIDMxLjgxMzc1ODcsNi4zMjYwMTQ5IDMzLjY2MDQyNDIsNy41MDY0Mzc5NCBMMzUuMzU1NTI2Miw1LjgxMDI3NjYgTDM2LjQ2NTE1MTYsNC42OTk5NTc4MiBMMzYuNDY1MTUxNiw0LjY5OTk1NzgyIFpcXFwiIGZpbGw9XFxcIiNDQ0NDQ0NcXFwiPjwvcGF0aD48L3N2Zz5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYVxcXCIgd2lkdGg9XFxcIjU2XFxcIiBoZWlnaHQ9XFxcIjU1XFxcIj48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEteFxcXCIgZD1cXFwiTTIxLjAzIDUuMDQybC0yLjExMi0yLjE1Ni0zLjY1NyAzLjY5NS0zLjY1Ny0zLjY5NS0yLjExMiAyLjE1NiAzLjY1OSAzLjY3My0zLjY1OSAzLjY5NiAyLjExMiAyLjE1NyAzLjY1Ny0zLjY5NyAzLjY1NyAzLjY5NyAyLjExMi0yLjE1Ny0zLjY0OC0zLjY5NiAzLjY0OC0zLjY3M3pcXFwiIGZpbGw9XFxcIiNGMjU0MkRcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtc1xcXCIgZD1cXFwiTTQxLjIzMiA2Ljg5NmwyLjk0MS0yLjk3NC0yLjEzNC0yLjEzMi0yLjkyIDIuOTczLS4wMDUtLjAwOC0yLjEzNCAyLjEzNS4wMDUuMDA4LS4wMDUuMDA1IDMuNzkyIDMuODItMi45MTUgMi45NDcgMi4xMTIgMi4xNTYgNS4wNi01LjExMS0zLjc5OC0zLjgxNi4wMDEtLjAwMXpcXFwiIGZpbGw9XFxcIiNGQ0NBMjBcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtb1xcXCIgZD1cXFwiTTQ4LjA2NiAyOS4xNTljLTEuNTM2IDAtMi43NjEgMS4yNjMtMi43NjEgMi43OSAwIDEuNTI0IDEuMjI2IDIuNzY1IDIuNzYxIDIuNzY1IDEuNTA5IDAgMi43MzYtMS4yNDIgMi43MzYtMi43NjUgMC0xLjUyNi0xLjIyNy0yLjc5LTIuNzM2LTIuNzltMCA4LjU5M2MtMy4xNzkgMC01Ljc3MS0yLjU5NC01Ljc3MS01LjgwNCAwLTMuMjEzIDIuNTkyLTUuODA4IDUuNzcxLTUuODA4IDMuMTU1IDAgNS43NDUgMi41OTQgNS43NDUgNS44MDggMCAzLjIxLTIuNTg5IDUuODA0LTUuNzQ1IDUuODA0XFxcIiBmaWxsPVxcXCIjOEMzRUE0XFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLWxcXFwiIGQ9XFxcIk0yNC4zODkgNDIuMzIzaDIuOTl2MTAuNDM3aC0yLjk5di0xMC40Mzd6bTQuMzM0IDBoMi45ODl2MTAuNDM3aC0yLjk4OXYtMTAuNDM3elxcXCIgZmlsbD1cXFwiI0I1REMyMFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1hXFxcIiBkPVxcXCJNNy43OTYgMzEuODk4bDEuNDA0IDIuNDU3aC0yLjgzNWwxLjQzMS0yLjQ1N2gtLjAwMXptLS4wMDEtNS43NTdsLTYuMzYzIDExLjEwMmgxMi43MDNsLTYuMzQxLTExLjEwMnpcXFwiIGZpbGw9XFxcIiM2NkNDREFcXFwiPjwvcGF0aD48L3N2Zz5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnc2Fzc2lmeScpKCcueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94e3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbiAwLjE1czthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbiAwLjE1c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LW92ZXJsYXl7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjA7ei1pbmRleDoxfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudHtwb3NpdGlvbjpyZWxhdGl2ZTt0b3A6MDtsZWZ0OjA7ei1pbmRleDozfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudF9faGlkZGVue3Zpc2liaWxpdHk6aGlkZGVuO3otaW5kZXg6LTF9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50LWlmcmFtZXt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnR9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVye3Bvc2l0aW9uOmFic29sdXRlO3RvcDo1MCU7bGVmdDo1MCU7ZGlzcGxheTpub25lO3otaW5kZXg6Mjtwb2ludGVyLWV2ZW50czpub25lfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGF7d2lkdGg6NTZweDtoZWlnaHQ6NTVweDttYXJnaW4tdG9wOi0yOHB4O21hcmdpbi1sZWZ0Oi0yNnB4fS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXgsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtcywueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1vLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWwsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtYXstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXkgMXMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7LXdlYmtpdC1hbmltYXRpb24tZmlsbC1tb2RlOmJvdGg7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDthbmltYXRpb24tZmlsbC1tb2RlOmJvdGh9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEteHstd2Via2l0LWFuaW1hdGlvbi1kZWxheTowczthbmltYXRpb24tZGVsYXk6MHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtc3std2Via2l0LWFuaW1hdGlvbi1kZWxheTouMnM7YW5pbWF0aW9uLWRlbGF5Oi4yc30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1vey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi40czthbmltYXRpb24tZGVsYXk6LjRzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWx7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjZzO2FuaW1hdGlvbi1kZWxheTouNnN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtYXstd2Via2l0LWFuaW1hdGlvbi1kZWxheTouOHM7YW5pbWF0aW9uLWRlbGF5Oi44c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXItcm91bmR7bWFyZ2luLXRvcDotMjNweDttYXJnaW4tbGVmdDotMjNweDstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXI7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIDNzIGluZmluaXRlIGxpbmVhcn0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXItY3VzdG9tey13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIGluZmluaXRlIGxpbmVhcjthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gaW5maW5pdGUgbGluZWFyfUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXl7MCUsODAlLDEwMCV7b3BhY2l0eTowfTQwJXtvcGFjaXR5OjF9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5ezAlLDgwJSwxMDAle29wYWNpdHk6MH00MCV7b3BhY2l0eToxfX1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbntmcm9te29wYWNpdHk6MH10b3tvcGFjaXR5OjF9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbntmcm9te29wYWNpdHk6MH10b3tvcGFjaXR5OjF9fUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbntmcm9tey13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgwZGVnKX10b3std2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbntmcm9te3RyYW5zZm9ybTpyb3RhdGUoMGRlZyl9dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX0gIC8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXdvSkluWmxjbk5wYjI0aU9pQXpMQW9KSW1acGJHVWlPaUFpYkdsbmFIUmliM2d1YzJOemN5SXNDZ2tpYzI5MWNtTmxjeUk2SUZzS0NRa2liR2xuYUhSaWIzZ3VjMk56Y3lJS0NWMHNDZ2tpYzI5MWNtTmxjME52Ym5SbGJuUWlPaUJiQ2drSklpUnNhV2RvZEdKdmVDMXdjbVZtYVhnNklDZDRjR0Y1YzNSaGRHbHZiaTEzYVdSblpYUXRiR2xuYUhSaWIzZ25PMXh1Skd4cFoyaDBZbTk0TFdOc1lYTnpPaUFuTGljZ0t5QWtiR2xuYUhSaWIzZ3RjSEpsWm1sNE8xeHVYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzBnZTF4dUlDQndiM05wZEdsdmJqb2dabWw0WldRN1hHNGdJSFJ2Y0RvZ01EdGNiaUFnYkdWbWREb2dNRHRjYmlBZ1ltOTBkRzl0T2lBd08xeHVJQ0J5YVdkb2REb2dNRHRjYmlBZ2QybGtkR2c2SURFd01DVTdYRzRnSUdobGFXZG9kRG9nTVRBd0pUdGNiaUFnTFhkbFltdHBkQzFoYm1sdFlYUnBiMjQ2SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdFptRmtaV2x1SUM0eE5YTTdYRzRnSUdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMW1ZV1JsYVc0Z0xqRTFjenRjYm4xY2JseHVJM3NrYkdsbmFIUmliM2d0WTJ4aGMzTjlMVzkyWlhKc1lYa2dlMXh1SUNCd2IzTnBkR2x2YmpvZ1lXSnpiMngxZEdVN1hHNGdJSFJ2Y0Rvd08xeHVJQ0JzWldaME9pQXdPMXh1SUNCaWIzUjBiMjA2SURBN1hHNGdJSEpwWjJoME9pQXdPMXh1SUNCNkxXbHVaR1Y0T2lBeE8xeHVmVnh1WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwdFkyOXVkR1Z1ZENCN1hHNGdJSEJ2YzJsMGFXOXVPaUJ5Wld4aGRHbDJaVHRjYmlBZ2RHOXdPaUF3TzF4dUlDQnNaV1owT2lBd08xeHVJQ0I2TFdsdVpHVjRPaUF6TzF4dWZWeHVYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzB0WTI5dWRHVnVkRjlmYUdsa1pHVnVJSHRjYmlBZ2RtbHphV0pwYkdsMGVUb2dhR2xrWkdWdU8xeHVJQ0I2TFdsdVpHVjRPaUF0TVR0Y2JuMWNibHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFdOdmJuUmxiblF0YVdaeVlXMWxJSHRjYmlBZ2QybGtkR2c2SURFd01DVTdYRzRnSUdobGFXZG9kRG9nTVRBd0pUdGNiaUFnWW05eVpHVnlPaUF3TzF4dUlDQmlZV05yWjNKdmRXNWtPaUIwY21GdWMzQmhjbVZ1ZER0Y2JuMWNibHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFhOd2FXNXVaWElnZTF4dUlDQndiM05wZEdsdmJqb2dZV0p6YjJ4MWRHVTdYRzRnSUhSdmNEb2dOVEFsTzF4dUlDQnNaV1owT2lBMU1DVTdYRzRnSUdScGMzQnNZWGs2SUc1dmJtVTdYRzRnSUhvdGFXNWtaWGc2SURJN1hHNGdJSEJ2YVc1MFpYSXRaWFpsYm5Sek9pQnViMjVsTzF4dVhHNGdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTQjdYRzRnSUNBZ2QybGtkR2c2SURVMmNIZzdYRzRnSUNBZ2FHVnBaMmgwT2lBMU5YQjRPMXh1SUNBZ0lHMWhjbWRwYmpvZ2UxeHVJQ0FnSUNBZ2RHOXdPaUF0TWpod2VEdGNiaUFnSUNBZ0lHeGxablE2SUMweU5uQjRPMXh1SUNBZ0lIMWNibHh1SUNBZ0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVMxNExDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGN5d2dMbk53YVc1dVpYSXRlSE52Ykd4aExXOHNJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMXNMQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRZU0I3WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQXhjeUJwYm1acGJtbDBaU0JsWVhObExXbHVMVzkxZER0Y2JpQWdJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1TFdacGJHd3RiVzlrWlRvZ1ltOTBhRHRjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQXhjeUJwYm1acGJtbDBaU0JsWVhObExXbHVMVzkxZER0Y2JpQWdJQ0FnSUdGdWFXMWhkR2x2YmkxbWFXeHNMVzF2WkdVNklHSnZkR2c3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExYZ2dlMXh1SUNBZ0lDQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNHRaR1ZzWVhrNklEQnpPMXh1SUNBZ0lDQWdZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXdjenRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGN5QjdYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqSnpPMXh1SUNBZ0lDQWdZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVNbk03WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExXOGdlMXh1SUNBZ0lDQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNHRaR1ZzWVhrNklDNDBjenRjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMalJ6TzF4dUlDQWdJSDFjYmx4dUlDQWdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMXNJSHRjYmlBZ0lDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVObk03WEc0Z0lDQWdJQ0JoYm1sdFlYUnBiMjR0WkdWc1lYazZJQzQyY3p0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRZU0I3WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMamh6TzF4dUlDQWdJQ0FnWVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF1T0hNN1hHNGdJQ0FnZlZ4dUlDQjlYRzVjYmlBZ0xuTndhVzV1WlhJdGNtOTFibVFnZTF4dUlDQWdJRzFoY21kcGJqb2dlMXh1SUNBZ0lDQWdkRzl3T2lBdE1qTndlRHRjYmlBZ0lDQWdJR3hsWm5RNklDMHlNM0I0TzF4dUlDQWdJSDFjYmlBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzF6Y0dsdUlETnpJR2x1Wm1sdWFYUmxJR3hwYm1WaGNqdGNiaUFnSUNCaGJtbHRZWFJwYjI0NklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRjM0JwYmlBemN5QnBibVpwYm1sMFpTQnNhVzVsWVhJN1hHNGdJSDFjYmx4dUlDQXVjM0JwYm01bGNpMWpkWE4wYjIwZ2UxeHVJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnYVc1bWFXNXBkR1VnYkdsdVpXRnlPMXh1SUNBZ0lHRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzF6Y0dsdUlHbHVabWx1YVhSbElHeHBibVZoY2p0Y2JpQWdmVnh1ZlZ4dVhHNUFMWGRsWW10cGRDMXJaWGxtY21GdFpYTWdJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFpYjNWdVkyVmtaV3hoZVNCN1hHNGdJREFsTENBNE1DVXNJREV3TUNVZ2V5QnZjR0ZqYVhSNU9pQXdPeUI5WEc0Z0lEUXdKU0I3SUc5d1lXTnBkSGs2SURFZ2ZWeHVmVnh1WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRZbTkxYm1ObFpHVnNZWGtnZTF4dUlDQXdKU3dnT0RBbExDQXhNREFsSUhzZ2IzQmhZMmwwZVRvZ01Ec2dmVnh1SUNBME1DVWdleUJ2Y0dGamFYUjVPaUF4T3lCOVhHNTlYRzVjYmtBdGQyVmlhMmwwTFd0bGVXWnlZVzFsY3lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxXWmhaR1ZwYmlCN1hHNGdJR1p5YjIwZ2V5QnZjR0ZqYVhSNU9pQXdPeUI5WEc0Z0lIUnZJSHNnYjNCaFkybDBlVG9nTVRzZ2ZWeHVmVnh1WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRabUZrWldsdUlIdGNiaUFnWm5KdmJTQjdJRzl3WVdOcGRIazZJREE3SUgxY2JpQWdkRzhnZXlCdmNHRmphWFI1T2lBeE95QjlYRzU5WEc1Y2JrQXRkMlZpYTJsMExXdGxlV1p5WVcxbGN5QWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z2UxeHVJQ0JtY205dElIc2dMWGRsWW10cGRDMTBjbUZ1YzJadmNtMDZJSEp2ZEdGMFpTZ3daR1ZuS1RzZ2ZWeHVJQ0IwYnlCN0lDMTNaV0pyYVhRdGRISmhibk5tYjNKdE9pQnliM1JoZEdVb016WXdaR1ZuS1RzZ2ZWeHVmVnh1WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRjM0JwYmlCN1hHNGdJR1p5YjIwZ2V5QjBjbUZ1YzJadmNtMDZJSEp2ZEdGMFpTZ3daR1ZuS1RzZ2ZWeHVJQ0IwYnlCN0lIUnlZVzV6Wm05eWJUb2djbTkwWVhSbEtETTJNR1JsWnlrN0lIMWNibjFjYmlJS0NWMHNDZ2tpYldGd2NHbHVaM01pT2lBaVFVRkhRU3hCUVVGQkxEUkNRVUUwUWl4QlFVRTFRaXhEUVVORkxGRkJRVkVzUTBGQlJTeExRVUZOTEVOQlEyaENMRWRCUVVjc1EwRkJSU3hEUVVGRkxFTkJRMUFzU1VGQlNTeERRVUZGTEVOQlFVVXNRMEZEVWl4TlFVRk5MRU5CUVVVc1EwRkJSU3hEUVVOV0xFdEJRVXNzUTBGQlJTeERRVUZGTEVOQlExUXNTMEZCU3l4RFFVRkZMRWxCUVVzc1EwRkRXaXhOUVVGTkxFTkJRVVVzU1VGQlN5eERRVU5pTEdsQ1FVRnBRaXhEUVVGRkxHdERRVUV3UWl4RFFVRlJMRXRCUVVrc1EwRkRla1FzVTBGQlV5eERRVUZGTEd0RFFVRXdRaXhEUVVGUkxFdEJRVWtzUTBGRGJFUXNRVUZGUkN4QlFVRkJMRzlEUVVGdlF5eEJRVUZ3UXl4RFFVTkZMRkZCUVZFc1EwRkJSU3hSUVVGVExFTkJRMjVDTEVkQlFVY3NRMEZCUXl4RFFVRkZMRU5CUTA0c1NVRkJTU3hEUVVGRkxFTkJRVVVzUTBGRFVpeE5RVUZOTEVOQlFVVXNRMEZCUlN4RFFVTldMRXRCUVVzc1EwRkJSU3hEUVVGRkxFTkJRMVFzVDBGQlR5eERRVUZGTEVOQlFVVXNRMEZEV2l4QlFVVkVMRUZCUVVFc2IwTkJRVzlETEVGQlFYQkRMRU5CUTBVc1VVRkJVU3hEUVVGRkxGRkJRVk1zUTBGRGJrSXNSMEZCUnl4RFFVRkZMRU5CUVVVc1EwRkRVQ3hKUVVGSkxFTkJRVVVzUTBGQlJTeERRVU5TTEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUTFvc1FVRkZSQ3hCUVVGQkxEUkRRVUUwUXl4QlFVRTFReXhEUVVORkxGVkJRVlVzUTBGQlJTeE5RVUZQTEVOQlEyNUNMRTlCUVU4c1EwRkJSU3hGUVVGSExFTkJRMklzUVVGRlJDeEJRVUZCTERKRFFVRXlReXhCUVVFelF5eERRVU5GTEV0QlFVc3NRMEZCUlN4SlFVRkxMRU5CUTFvc1RVRkJUU3hEUVVGRkxFbEJRVXNzUTBGRFlpeE5RVUZOTEVOQlFVVXNRMEZCUlN4RFFVTldMRlZCUVZVc1EwRkJSU3hYUVVGWkxFTkJRM3BDTEVGQlJVUXNRVUZCUVN4dlEwRkJiME1zUVVGQmNFTXNRMEZEUlN4UlFVRlJMRU5CUVVVc1VVRkJVeXhEUVVOdVFpeEhRVUZITEVOQlFVVXNSMEZCU1N4RFFVTlVMRWxCUVVrc1EwRkJSU3hIUVVGSkxFTkJRMVlzVDBGQlR5eERRVUZGTEVsQlFVc3NRMEZEWkN4UFFVRlBMRU5CUVVVc1EwRkJSU3hEUVVOWUxHTkJRV01zUTBGQlJTeEpRVUZMTEVOQmQwUjBRaXhCUVRsRVJDeEJRVkZGTEc5RFFWSnJReXhEUVZGc1F5eGxRVUZsTEVGQlFVTXNRMEZEWkN4TFFVRkxMRU5CUVVVc1NVRkJTeXhEUVVOYUxFMUJRVTBzUTBGQlJTeEpRVUZMTEVOQlEySXNUVUZCVFN4QlFVRkRMRU5CUVVNc1FVRkRUaXhIUVVGSExFTkJRVVVzUzBGQlRTeERRVVJpTEUxQlFVMHNRVUZCUXl4RFFVRkRMRUZCUlU0c1NVRkJTU3hEUVVGRkxFdEJRVTBzUTBGclEyWXNRVUV2UTBnc1FVRm5Ra2tzYjBOQmFFSm5ReXhEUVZGc1F5eGxRVUZsTEVOQlVXSXNhVUpCUVdsQ0xFTkJhRUp5UWl4QlFXZENkVUlzYjBOQmFFSmhMRU5CVVd4RExHVkJRV1VzUTBGUlRTeHBRa0ZCYVVJc1EwRm9RbmhETEVGQlowSXdReXh2UTBGb1FrNHNRMEZSYkVNc1pVRkJaU3hEUVZGNVFpeHBRa0ZCYVVJc1EwRm9Rak5FTEVGQlowSTJSQ3h2UTBGb1FucENMRU5CVVd4RExHVkJRV1VzUTBGUk5FTXNhVUpCUVdsQ0xFTkJhRUk1UlN4QlFXZENaMFlzYjBOQmFFSTFReXhEUVZGc1F5eGxRVUZsTEVOQlVTdEVMR2xDUVVGcFFpeEJRVUZETEVOQlF6VkdMR2xDUVVGcFFpeERRVUZGTEhWRFFVRXJRaXhEUVVGaExFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVTjBSaXd5UWtGQk1rSXNRMEZCUlN4SlFVRkxMRU5CUTJ4RExGTkJRVk1zUTBGQlJTeDFRMEZCSzBJc1EwRkJZU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEZkQlFWY3NRMEZET1VVc2JVSkJRVzFDTEVOQlFVVXNTVUZCU3l4RFFVTXpRaXhCUVhKQ1RDeEJRWFZDU1N4dlEwRjJRbWRETEVOQlVXeERMR1ZCUVdVc1EwRmxZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4RlFVRkhMRU5CUXpWQ0xHVkJRV1VzUTBGQlJTeEZRVUZITEVOQlEzSkNMRUZCTVVKTUxFRkJORUpKTEc5RFFUVkNaME1zUTBGUmJFTXNaVUZCWlN4RFFXOUNZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCTDBKTUxFRkJhVU5KTEc5RFFXcERaME1zUTBGUmJFTXNaVUZCWlN4RFFYbENZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCY0VOTUxFRkJjME5KTEc5RFFYUkRaME1zUTBGUmJFTXNaVUZCWlN4RFFUaENZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCZWtOTUxFRkJNa05KTEc5RFFUTkRaME1zUTBGUmJFTXNaVUZCWlN4RFFXMURZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCT1VOTUxFRkJhVVJGTEc5RFFXcEVhME1zUTBGcFJHeERMR05CUVdNc1FVRkJReXhEUVVOaUxFMUJRVTBzUVVGQlF5eERRVUZETEVGQlEwNHNSMEZCUnl4RFFVRkZMRXRCUVUwc1EwRkVZaXhOUVVGTkxFRkJRVU1zUTBGQlF5eEJRVVZPTEVsQlFVa3NRMEZCUlN4TFFVRk5MRU5CUldRc2FVSkJRV2xDTEVOQlFVVXNaME5CUVhkQ0xFTkJRVTBzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUTI1RkxGTkJRVk1zUTBGQlJTeG5RMEZCZDBJc1EwRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZETlVRc1FVRjRSRWdzUVVFd1JFVXNiME5CTVVSclF5eERRVEJFYkVNc1pVRkJaU3hCUVVGRExFTkJRMlFzYVVKQlFXbENMRU5CUVVVc1owTkJRWGRDTEVOQlFVMHNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkRhRVVzVTBGQlV5eERRVUZGTEdkRFFVRjNRaXhEUVVGTkxGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlEzcEVMRUZCUjBnc2EwSkJRV3RDTEVOQlFXeENMSFZEUVVGclFpeERRVU5vUWl4QlFVRkJMRVZCUVVVc1EwRkJSU3hCUVVGQkxFZEJRVWNzUTBGQlJTeEJRVUZCTEVsQlFVa3NRMEZCUnl4UFFVRlBMRU5CUVVVc1EwRkJSU3hEUVVNelFpeEJRVUZCTEVkQlFVY3NRMEZCUnl4UFFVRlBMRU5CUVVVc1EwRkJSeXhGUVVkd1FpeFZRVUZWTEVOQlFWWXNkVU5CUVZVc1EwRkRVaXhCUVVGQkxFVkJRVVVzUTBGQlJTeEJRVUZCTEVkQlFVY3NRMEZCUlN4QlFVRkJMRWxCUVVrc1EwRkJSeXhQUVVGUExFTkJRVVVzUTBGQlJTeERRVU16UWl4QlFVRkJMRWRCUVVjc1EwRkJSeXhQUVVGUExFTkJRVVVzUTBGQlJTeEZRVWR1UWl4clFrRkJhMElzUTBGQmJFSXNhME5CUVd0Q0xFTkJRMmhDTEVGQlFVRXNTVUZCU1N4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRMnhDTEVGQlFVRXNSVUZCUlN4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFVkJSMnhDTEZWQlFWVXNRMEZCVml4clEwRkJWU3hEUVVOU0xFRkJRVUVzU1VGQlNTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUTJ4Q0xFRkJRVUVzUlVGQlJTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRVZCUjJ4Q0xHdENRVUZyUWl4RFFVRnNRaXhuUTBGQmEwSXNRMEZEYUVJc1FVRkJRU3hKUVVGSkxFTkJRVWNzYVVKQlFXbENMRU5CUVVVc1dVRkJUU3hEUVVOb1F5eEJRVUZCTEVWQlFVVXNRMEZCUnl4cFFrRkJhVUlzUTBGQlJTeGpRVUZOTEVWQlIyaERMRlZCUVZVc1EwRkJWaXhuUTBGQlZTeERRVU5TTEVGQlFVRXNTVUZCU1N4RFFVRkhMRk5CUVZNc1EwRkJSU3haUVVGTkxFTkJRM2hDTEVGQlFVRXNSVUZCUlN4RFFVRkhMRk5CUVZNc1EwRkJSU3hqUVVGTklpd0tDU0p1WVcxbGN5STZJRnRkQ24wPSAqLycpOzsiLCJtb2R1bGUuZXhwb3J0cyA9ICcxLjAuNic7XG4iLCIvKiFcbiAqIEJvd3NlciAtIGEgYnJvd3NlciBkZXRlY3RvclxuICogaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib3dzZXJcbiAqIE1JVCBMaWNlbnNlIHwgKGMpIER1c3RpbiBEaWF6IDIwMTVcbiAqL1xuXG4hZnVuY3Rpb24gKHJvb3QsIG5hbWUsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUobmFtZSwgZGVmaW5pdGlvbilcbiAgZWxzZSByb290W25hbWVdID0gZGVmaW5pdGlvbigpXG59KHRoaXMsICdib3dzZXInLCBmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgICogU2VlIHVzZXJhZ2VudHMuanMgZm9yIGV4YW1wbGVzIG9mIG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAqL1xuXG4gIHZhciB0ID0gdHJ1ZVxuXG4gIGZ1bmN0aW9uIGRldGVjdCh1YSkge1xuXG4gICAgZnVuY3Rpb24gZ2V0Rmlyc3RNYXRjaChyZWdleCkge1xuICAgICAgdmFyIG1hdGNoID0gdWEubWF0Y2gocmVnZXgpO1xuICAgICAgcmV0dXJuIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoWzFdKSB8fCAnJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWNvbmRNYXRjaChyZWdleCkge1xuICAgICAgdmFyIG1hdGNoID0gdWEubWF0Y2gocmVnZXgpO1xuICAgICAgcmV0dXJuIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoWzJdKSB8fCAnJztcbiAgICB9XG5cbiAgICB2YXIgaW9zZGV2aWNlID0gZ2V0Rmlyc3RNYXRjaCgvKGlwb2R8aXBob25lfGlwYWQpL2kpLnRvTG93ZXJDYXNlKClcbiAgICAgICwgbGlrZUFuZHJvaWQgPSAvbGlrZSBhbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgYW5kcm9pZCA9ICFsaWtlQW5kcm9pZCAmJiAvYW5kcm9pZC9pLnRlc3QodWEpXG4gICAgICAsIG5leHVzTW9iaWxlID0gL25leHVzXFxzKlswLTZdXFxzKi9pLnRlc3QodWEpXG4gICAgICAsIG5leHVzVGFibGV0ID0gIW5leHVzTW9iaWxlICYmIC9uZXh1c1xccypbMC05XSsvaS50ZXN0KHVhKVxuICAgICAgLCBjaHJvbWVvcyA9IC9Dck9TLy50ZXN0KHVhKVxuICAgICAgLCBzaWxrID0gL3NpbGsvaS50ZXN0KHVhKVxuICAgICAgLCBzYWlsZmlzaCA9IC9zYWlsZmlzaC9pLnRlc3QodWEpXG4gICAgICAsIHRpemVuID0gL3RpemVuL2kudGVzdCh1YSlcbiAgICAgICwgd2Vib3MgPSAvKHdlYnxocHcpKG98MClzL2kudGVzdCh1YSlcbiAgICAgICwgd2luZG93c3Bob25lID0gL3dpbmRvd3MgcGhvbmUvaS50ZXN0KHVhKVxuICAgICAgLCBzYW1zdW5nQnJvd3NlciA9IC9TYW1zdW5nQnJvd3Nlci9pLnRlc3QodWEpXG4gICAgICAsIHdpbmRvd3MgPSAhd2luZG93c3Bob25lICYmIC93aW5kb3dzL2kudGVzdCh1YSlcbiAgICAgICwgbWFjID0gIWlvc2RldmljZSAmJiAhc2lsayAmJiAvbWFjaW50b3NoL2kudGVzdCh1YSlcbiAgICAgICwgbGludXggPSAhYW5kcm9pZCAmJiAhc2FpbGZpc2ggJiYgIXRpemVuICYmICF3ZWJvcyAmJiAvbGludXgvaS50ZXN0KHVhKVxuICAgICAgLCBlZGdlVmVyc2lvbiA9IGdldFNlY29uZE1hdGNoKC9lZGcoW2VhXXxpb3MpXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB2ZXJzaW9uSWRlbnRpZmllciA9IGdldEZpcnN0TWF0Y2goL3ZlcnNpb25cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICAsIHRhYmxldCA9IC90YWJsZXQvaS50ZXN0KHVhKSAmJiAhL3RhYmxldCBwYy9pLnRlc3QodWEpXG4gICAgICAsIG1vYmlsZSA9ICF0YWJsZXQgJiYgL1teLV1tb2JpL2kudGVzdCh1YSlcbiAgICAgICwgeGJveCA9IC94Ym94L2kudGVzdCh1YSlcbiAgICAgICwgcmVzdWx0XG5cbiAgICBpZiAoL29wZXJhL2kudGVzdCh1YSkpIHtcbiAgICAgIC8vICBhbiBvbGQgT3BlcmFcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhJ1xuICAgICAgLCBvcGVyYTogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpvcGVyYXxvcHJ8b3Bpb3MpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgvb3ByXFwvfG9waW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIC8vIGEgbmV3IE9wZXJhXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSdcbiAgICAgICAgLCBvcGVyYTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om9wcnxvcGlvcylbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL1NhbXN1bmdCcm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhbXN1bmcgSW50ZXJuZXQgZm9yIEFuZHJvaWQnXG4gICAgICAgICwgc2Ftc3VuZ0Jyb3dzZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpTYW1zdW5nQnJvd3NlcilbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL1doYWxlL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ05BVkVSIFdoYWxlIGJyb3dzZXInXG4gICAgICAgICwgd2hhbGU6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp3aGFsZSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvTVpCcm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ01aIEJyb3dzZXInXG4gICAgICAgICwgbXpicm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86TVpCcm93c2VyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jb2FzdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSBDb2FzdCdcbiAgICAgICAgLCBjb2FzdDogdFxuICAgICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OmNvYXN0KVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvZm9jdXMvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnRm9jdXMnXG4gICAgICAgICwgZm9jdXM6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpmb2N1cylbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgveWFicm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1lhbmRleCBCcm93c2VyJ1xuICAgICAgLCB5YW5kZXhicm93c2VyOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OnlhYnJvd3NlcilbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3VjYnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgbmFtZTogJ1VDIEJyb3dzZXInXG4gICAgICAgICwgdWNicm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86dWNicm93c2VyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9teGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNYXh0aG9uJ1xuICAgICAgICAsIG1heHRob246IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpteGlvcylbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvZXBpcGhhbnkvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnRXBpcGhhbnknXG4gICAgICAgICwgZXBpcGhhbnk6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzplcGlwaGFueSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvcHVmZmluL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1B1ZmZpbidcbiAgICAgICAgLCBwdWZmaW46IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpwdWZmaW4pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NsZWlwbmlyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NsZWlwbmlyJ1xuICAgICAgICAsIHNsZWlwbmlyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86c2xlaXBuaXIpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2stbWVsZW9uL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0stTWVsZW9uJ1xuICAgICAgICAsIGtNZWxlb246IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzprLW1lbGVvbilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh3aW5kb3dzcGhvbmUpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1dpbmRvd3MgUGhvbmUnXG4gICAgICAsIG9zbmFtZTogJ1dpbmRvd3MgUGhvbmUnXG4gICAgICAsIHdpbmRvd3NwaG9uZTogdFxuICAgICAgfVxuICAgICAgaWYgKGVkZ2VWZXJzaW9uKSB7XG4gICAgICAgIHJlc3VsdC5tc2VkZ2UgPSB0XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gZWRnZVZlcnNpb25cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQubXNpZSA9IHRcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9pZW1vYmlsZVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL21zaWV8dHJpZGVudC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdJbnRlcm5ldCBFeHBsb3JlcidcbiAgICAgICwgbXNpZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzptc2llIHxydjopKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2hyb21lb3MpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0Nocm9tZSdcbiAgICAgICwgb3NuYW1lOiAnQ2hyb21lIE9TJ1xuICAgICAgLCBjaHJvbWVvczogdFxuICAgICAgLCBjaHJvbWVCb29rOiB0XG4gICAgICAsIGNocm9tZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgvZWRnKFtlYV18aW9zKS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNaWNyb3NvZnQgRWRnZSdcbiAgICAgICwgbXNlZGdlOiB0XG4gICAgICAsIHZlcnNpb246IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC92aXZhbGRpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1ZpdmFsZGknXG4gICAgICAgICwgdml2YWxkaTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3ZpdmFsZGlcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNhaWxmaXNoKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYWlsZmlzaCdcbiAgICAgICwgb3NuYW1lOiAnU2FpbGZpc2ggT1MnXG4gICAgICAsIHNhaWxmaXNoOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NhaWxmaXNoXFxzP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zZWFtb25rZXlcXC8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2VhTW9ua2V5J1xuICAgICAgLCBzZWFtb25rZXk6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2VhbW9ua2V5XFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvZmlyZWZveHxpY2V3ZWFzZWx8Znhpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnRmlyZWZveCdcbiAgICAgICwgZmlyZWZveDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpmaXJlZm94fGljZXdlYXNlbHxmeGlvcylbIFxcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgICBpZiAoL1xcKChtb2JpbGV8dGFibGV0KTtbXlxcKV0qcnY6W1xcZFxcLl0rXFwpL2kudGVzdCh1YSkpIHtcbiAgICAgICAgcmVzdWx0LmZpcmVmb3hvcyA9IHRcbiAgICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdGaXJlZm94IE9TJ1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzaWxrKSB7XG4gICAgICByZXN1bHQgPSAge1xuICAgICAgICBuYW1lOiAnQW1hem9uIFNpbGsnXG4gICAgICAsIHNpbGs6IHRcbiAgICAgICwgdmVyc2lvbiA6IGdldEZpcnN0TWF0Y2goL3NpbGtcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9waGFudG9tL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1BoYW50b21KUydcbiAgICAgICwgcGhhbnRvbTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9waGFudG9tanNcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zbGltZXJqcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTbGltZXJKUydcbiAgICAgICAgLCBzbGltZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zbGltZXJqc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2JsYWNrYmVycnl8XFxiYmJcXGQrL2kudGVzdCh1YSkgfHwgL3JpbVxcc3RhYmxldC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCbGFja0JlcnJ5J1xuICAgICAgLCBvc25hbWU6ICdCbGFja0JlcnJ5IE9TJ1xuICAgICAgLCBibGFja2JlcnJ5OiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL2JsYWNrYmVycnlbXFxkXStcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHdlYm9zKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXZWJPUydcbiAgICAgICwgb3NuYW1lOiAnV2ViT1MnXG4gICAgICAsIHdlYm9zOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL3coPzplYik/b3Nicm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICAgIC90b3VjaHBhZFxcLy9pLnRlc3QodWEpICYmIChyZXN1bHQudG91Y2hwYWQgPSB0KVxuICAgIH1cbiAgICBlbHNlIGlmICgvYmFkYS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCYWRhJ1xuICAgICAgLCBvc25hbWU6ICdCYWRhJ1xuICAgICAgLCBiYWRhOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL2RvbGZpblxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRpemVuKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdUaXplbidcbiAgICAgICwgb3NuYW1lOiAnVGl6ZW4nXG4gICAgICAsIHRpemVuOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnRpemVuXFxzPyk/YnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKC9xdXB6aWxsYS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdRdXBaaWxsYSdcbiAgICAgICAgLCBxdXB6aWxsYTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnF1cHppbGxhKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWl1bS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWl1bSdcbiAgICAgICAgLCBjaHJvbWl1bTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9taXVtKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWV8Y3Jpb3N8Y3Jtby9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAgICwgY2hyb21lOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21lfGNyaW9zfGNybW8pXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChhbmRyb2lkKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdBbmRyb2lkJ1xuICAgICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zYWZhcml8YXBwbGV3ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2FmYXJpJ1xuICAgICAgLCBzYWZhcmk6IHRcbiAgICAgIH1cbiAgICAgIGlmICh2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lIDogaW9zZGV2aWNlID09ICdpcGhvbmUnID8gJ2lQaG9uZScgOiBpb3NkZXZpY2UgPT0gJ2lwYWQnID8gJ2lQYWQnIDogJ2lQb2QnXG4gICAgICB9XG4gICAgICAvLyBXVEY6IHZlcnNpb24gaXMgbm90IHBhcnQgb2YgdXNlciBhZ2VudCBpbiB3ZWIgYXBwc1xuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZigvZ29vZ2xlYm90L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0dvb2dsZWJvdCdcbiAgICAgICwgZ29vZ2xlYm90OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL2dvb2dsZWJvdFxcLyhcXGQrKFxcLlxcZCspKS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogZ2V0Rmlyc3RNYXRjaCgvXiguKilcXC8oLiopIC8pLFxuICAgICAgICB2ZXJzaW9uOiBnZXRTZWNvbmRNYXRjaCgvXiguKilcXC8oLiopIC8pXG4gICAgIH07XG4gICB9XG5cbiAgICAvLyBzZXQgd2Via2l0IG9yIGdlY2tvIGZsYWcgZm9yIGJyb3dzZXJzIGJhc2VkIG9uIHRoZXNlIGVuZ2luZXNcbiAgICBpZiAoIXJlc3VsdC5tc2VkZ2UgJiYgLyhhcHBsZSk/d2Via2l0L2kudGVzdCh1YSkpIHtcbiAgICAgIGlmICgvKGFwcGxlKT93ZWJraXRcXC81MzdcXC4zNi9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5uYW1lID0gcmVzdWx0Lm5hbWUgfHwgXCJCbGlua1wiXG4gICAgICAgIHJlc3VsdC5ibGluayA9IHRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5uYW1lID0gcmVzdWx0Lm5hbWUgfHwgXCJXZWJraXRcIlxuICAgICAgICByZXN1bHQud2Via2l0ID0gdFxuICAgICAgfVxuICAgICAgaWYgKCFyZXN1bHQudmVyc2lvbiAmJiB2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0Lm9wZXJhICYmIC9nZWNrb1xcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiR2Vja29cIlxuICAgICAgcmVzdWx0LmdlY2tvID0gdFxuICAgICAgcmVzdWx0LnZlcnNpb24gPSByZXN1bHQudmVyc2lvbiB8fCBnZXRGaXJzdE1hdGNoKC9nZWNrb1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICB9XG5cbiAgICAvLyBzZXQgT1MgZmxhZ3MgZm9yIHBsYXRmb3JtcyB0aGF0IGhhdmUgbXVsdGlwbGUgYnJvd3NlcnNcbiAgICBpZiAoIXJlc3VsdC53aW5kb3dzcGhvbmUgJiYgKGFuZHJvaWQgfHwgcmVzdWx0LnNpbGspKSB7XG4gICAgICByZXN1bHQuYW5kcm9pZCA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnQW5kcm9pZCdcbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQud2luZG93c3Bob25lICYmIGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0W2lvc2RldmljZV0gPSB0XG4gICAgICByZXN1bHQuaW9zID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdpT1MnXG4gICAgfSBlbHNlIGlmIChtYWMpIHtcbiAgICAgIHJlc3VsdC5tYWMgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ21hY09TJ1xuICAgIH0gZWxzZSBpZiAoeGJveCkge1xuICAgICAgcmVzdWx0Lnhib3ggPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ1hib3gnXG4gICAgfSBlbHNlIGlmICh3aW5kb3dzKSB7XG4gICAgICByZXN1bHQud2luZG93cyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnV2luZG93cydcbiAgICB9IGVsc2UgaWYgKGxpbnV4KSB7XG4gICAgICByZXN1bHQubGludXggPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ0xpbnV4J1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFdpbmRvd3NWZXJzaW9uIChzKSB7XG4gICAgICBzd2l0Y2ggKHMpIHtcbiAgICAgICAgY2FzZSAnTlQnOiByZXR1cm4gJ05UJ1xuICAgICAgICBjYXNlICdYUCc6IHJldHVybiAnWFAnXG4gICAgICAgIGNhc2UgJ05UIDUuMCc6IHJldHVybiAnMjAwMCdcbiAgICAgICAgY2FzZSAnTlQgNS4xJzogcmV0dXJuICdYUCdcbiAgICAgICAgY2FzZSAnTlQgNS4yJzogcmV0dXJuICcyMDAzJ1xuICAgICAgICBjYXNlICdOVCA2LjAnOiByZXR1cm4gJ1Zpc3RhJ1xuICAgICAgICBjYXNlICdOVCA2LjEnOiByZXR1cm4gJzcnXG4gICAgICAgIGNhc2UgJ05UIDYuMic6IHJldHVybiAnOCdcbiAgICAgICAgY2FzZSAnTlQgNi4zJzogcmV0dXJuICc4LjEnXG4gICAgICAgIGNhc2UgJ05UIDEwLjAnOiByZXR1cm4gJzEwJ1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT1MgdmVyc2lvbiBleHRyYWN0aW9uXG4gICAgdmFyIG9zVmVyc2lvbiA9ICcnO1xuICAgIGlmIChyZXN1bHQud2luZG93cykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0V2luZG93c1ZlcnNpb24oZ2V0Rmlyc3RNYXRjaCgvV2luZG93cyAoKE5UfFhQKSggXFxkXFxkPy5cXGQpPykvaSkpXG4gICAgfSBlbHNlIGlmIChyZXN1bHQud2luZG93c3Bob25lKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC93aW5kb3dzIHBob25lICg/Om9zKT9cXHM/KFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5tYWMpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL01hYyBPUyBYIChcXGQrKFtfXFwuXFxzXVxcZCspKikvaSk7XG4gICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb24ucmVwbGFjZSgvW19cXHNdL2csICcuJyk7XG4gICAgfSBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL29zIChcXGQrKFtfXFxzXVxcZCspKikgbGlrZSBtYWMgb3MgeC9pKTtcbiAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9bX1xcc10vZywgJy4nKTtcbiAgICB9IGVsc2UgaWYgKGFuZHJvaWQpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2FuZHJvaWRbIFxcLy1dKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC53ZWJvcykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvKD86d2VifGhwdylvc1xcLyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuYmxhY2tiZXJyeSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvcmltXFxzdGFibGV0XFxzb3NcXHMoXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJhZGEpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2JhZGFcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LnRpemVuKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC90aXplbltcXC9cXHNdKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9XG4gICAgaWYgKG9zVmVyc2lvbikge1xuICAgICAgcmVzdWx0Lm9zdmVyc2lvbiA9IG9zVmVyc2lvbjtcbiAgICB9XG5cbiAgICAvLyBkZXZpY2UgdHlwZSBleHRyYWN0aW9uXG4gICAgdmFyIG9zTWFqb3JWZXJzaW9uID0gIXJlc3VsdC53aW5kb3dzICYmIG9zVmVyc2lvbi5zcGxpdCgnLicpWzBdO1xuICAgIGlmIChcbiAgICAgICAgIHRhYmxldFxuICAgICAgfHwgbmV4dXNUYWJsZXRcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBhZCdcbiAgICAgIHx8IChhbmRyb2lkICYmIChvc01ham9yVmVyc2lvbiA9PSAzIHx8IChvc01ham9yVmVyc2lvbiA+PSA0ICYmICFtb2JpbGUpKSlcbiAgICAgIHx8IHJlc3VsdC5zaWxrXG4gICAgKSB7XG4gICAgICByZXN1bHQudGFibGV0ID0gdFxuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICBtb2JpbGVcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBob25lJ1xuICAgICAgfHwgaW9zZGV2aWNlID09ICdpcG9kJ1xuICAgICAgfHwgYW5kcm9pZFxuICAgICAgfHwgbmV4dXNNb2JpbGVcbiAgICAgIHx8IHJlc3VsdC5ibGFja2JlcnJ5XG4gICAgICB8fCByZXN1bHQud2Vib3NcbiAgICAgIHx8IHJlc3VsdC5iYWRhXG4gICAgKSB7XG4gICAgICByZXN1bHQubW9iaWxlID0gdFxuICAgIH1cblxuICAgIC8vIEdyYWRlZCBCcm93c2VyIFN1cHBvcnRcbiAgICAvLyBodHRwOi8vZGV2ZWxvcGVyLnlhaG9vLmNvbS95dWkvYXJ0aWNsZXMvZ2JzXG4gICAgaWYgKHJlc3VsdC5tc2VkZ2UgfHxcbiAgICAgICAgKHJlc3VsdC5tc2llICYmIHJlc3VsdC52ZXJzaW9uID49IDEwKSB8fFxuICAgICAgICAocmVzdWx0LnlhbmRleGJyb3dzZXIgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTUpIHx8XG5cdFx0ICAgIChyZXN1bHQudml2YWxkaSAmJiByZXN1bHQudmVyc2lvbiA+PSAxLjApIHx8XG4gICAgICAgIChyZXN1bHQuY2hyb21lICYmIHJlc3VsdC52ZXJzaW9uID49IDIwKSB8fFxuICAgICAgICAocmVzdWx0LnNhbXN1bmdCcm93c2VyICYmIHJlc3VsdC52ZXJzaW9uID49IDQpIHx8XG4gICAgICAgIChyZXN1bHQud2hhbGUgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzEuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5temJyb3dzZXIgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzYuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5mb2N1cyAmJiBjb21wYXJlVmVyc2lvbnMoW3Jlc3VsdC52ZXJzaW9uLCAnMS4wJ10pID09PSAxKSB8fFxuICAgICAgICAocmVzdWx0LmZpcmVmb3ggJiYgcmVzdWx0LnZlcnNpb24gPj0gMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5vcGVyYSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMC4wKSB8fFxuICAgICAgICAocmVzdWx0LmlvcyAmJiByZXN1bHQub3N2ZXJzaW9uICYmIHJlc3VsdC5vc3ZlcnNpb24uc3BsaXQoXCIuXCIpWzBdID49IDYpIHx8XG4gICAgICAgIChyZXN1bHQuYmxhY2tiZXJyeSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMC4xKVxuICAgICAgICB8fCAocmVzdWx0LmNocm9taXVtICYmIHJlc3VsdC52ZXJzaW9uID49IDIwKVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5hID0gdDtcbiAgICB9XG4gICAgZWxzZSBpZiAoKHJlc3VsdC5tc2llICYmIHJlc3VsdC52ZXJzaW9uIDwgMTApIHx8XG4gICAgICAgIChyZXN1bHQuY2hyb21lICYmIHJlc3VsdC52ZXJzaW9uIDwgMjApIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA8IDIwLjApIHx8XG4gICAgICAgIChyZXN1bHQuc2FmYXJpICYmIHJlc3VsdC52ZXJzaW9uIDwgNikgfHxcbiAgICAgICAgKHJlc3VsdC5vcGVyYSAmJiByZXN1bHQudmVyc2lvbiA8IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPCA2KVxuICAgICAgICB8fCAocmVzdWx0LmNocm9taXVtICYmIHJlc3VsdC52ZXJzaW9uIDwgMjApXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmMgPSB0XG4gICAgfSBlbHNlIHJlc3VsdC54ID0gdFxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgdmFyIGJvd3NlciA9IGRldGVjdCh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvci51c2VyQWdlbnQgfHwgJycgOiAnJylcblxuICBib3dzZXIudGVzdCA9IGZ1bmN0aW9uIChicm93c2VyTGlzdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnJvd3Nlckxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBicm93c2VySXRlbSA9IGJyb3dzZXJMaXN0W2ldO1xuICAgICAgaWYgKHR5cGVvZiBicm93c2VySXRlbT09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoYnJvd3Nlckl0ZW0gaW4gYm93c2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB2ZXJzaW9uIHByZWNpc2lvbnMgY291bnRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBnZXRWZXJzaW9uUHJlY2lzaW9uKFwiMS4xMC4zXCIpIC8vIDNcbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSB2ZXJzaW9uXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGZ1bmN0aW9uIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbikge1xuICAgIHJldHVybiB2ZXJzaW9uLnNwbGl0KFwiLlwiKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogQXJyYXk6Om1hcCBwb2x5ZmlsbFxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheX0gYXJyXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBpdGVyYXRvclxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGZ1bmN0aW9uIG1hcChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdLCBpO1xuICAgIGlmIChBcnJheS5wcm90b3R5cGUubWFwKSB7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFyciwgaXRlcmF0b3IpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChpdGVyYXRvcihhcnJbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYnJvd3NlciB2ZXJzaW9uIHdlaWdodFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjguMi4xLjkwJ10pICAgIC8vIDFcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjAxMC4yLjEnLCAnMS4wOS4yLjEuOTAnXSk7ICAvLyAxXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4xMC4yLjEnLCAgJzEuMTAuMi4xJ10pOyAgICAgLy8gMFxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjA4MDAuMiddKTsgICAgIC8vIC0xXG4gICAqXG4gICAqIEBwYXJhbSAge0FycmF5PFN0cmluZz59IHZlcnNpb25zIHZlcnNpb25zIHRvIGNvbXBhcmVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjb21wYXJpc29uIHJlc3VsdFxuICAgKi9cbiAgZnVuY3Rpb24gY29tcGFyZVZlcnNpb25zKHZlcnNpb25zKSB7XG4gICAgLy8gMSkgZ2V0IGNvbW1vbiBwcmVjaXNpb24gZm9yIGJvdGggdmVyc2lvbnMsIGZvciBleGFtcGxlIGZvciBcIjEwLjBcIiBhbmQgXCI5XCIgaXQgc2hvdWxkIGJlIDJcbiAgICB2YXIgcHJlY2lzaW9uID0gTWF0aC5tYXgoZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uc1swXSksIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbnNbMV0pKTtcbiAgICB2YXIgY2h1bmtzID0gbWFwKHZlcnNpb25zLCBmdW5jdGlvbiAodmVyc2lvbikge1xuICAgICAgdmFyIGRlbHRhID0gcHJlY2lzaW9uIC0gZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uKTtcblxuICAgICAgLy8gMikgXCI5XCIgLT4gXCI5LjBcIiAoZm9yIHByZWNpc2lvbiA9IDIpXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbiArIG5ldyBBcnJheShkZWx0YSArIDEpLmpvaW4oXCIuMFwiKTtcblxuICAgICAgLy8gMykgXCI5LjBcIiAtPiBbXCIwMDAwMDAwMDBcIlwiLCBcIjAwMDAwMDAwOVwiXVxuICAgICAgcmV0dXJuIG1hcCh2ZXJzaW9uLnNwbGl0KFwiLlwiKSwgZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoMjAgLSBjaHVuay5sZW5ndGgpLmpvaW4oXCIwXCIpICsgY2h1bms7XG4gICAgICB9KS5yZXZlcnNlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBpdGVyYXRlIGluIHJldmVyc2Ugb3JkZXIgYnkgcmV2ZXJzZWQgY2h1bmtzIGFycmF5XG4gICAgd2hpbGUgKC0tcHJlY2lzaW9uID49IDApIHtcbiAgICAgIC8vIDQpIGNvbXBhcmU6IFwiMDAwMDAwMDA5XCIgPiBcIjAwMDAwMDAxMFwiID0gZmFsc2UgKGJ1dCBcIjlcIiA+IFwiMTBcIiA9IHRydWUpXG4gICAgICBpZiAoY2h1bmtzWzBdW3ByZWNpc2lvbl0gPiBjaHVua3NbMV1bcHJlY2lzaW9uXSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGNodW5rc1swXVtwcmVjaXNpb25dID09PSBjaHVua3NbMV1bcHJlY2lzaW9uXSkge1xuICAgICAgICBpZiAocHJlY2lzaW9uID09PSAwKSB7XG4gICAgICAgICAgLy8gYWxsIHZlcnNpb24gY2h1bmtzIGFyZSBzYW1lXG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGJyb3dzZXIgaXMgdW5zdXBwb3J0ZWRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBib3dzZXIuaXNVbnN1cHBvcnRlZEJyb3dzZXIoe1xuICAgKiAgICAgbXNpZTogXCIxMFwiLFxuICAgKiAgICAgZmlyZWZveDogXCIyM1wiLFxuICAgKiAgICAgY2hyb21lOiBcIjI5XCIsXG4gICAqICAgICBzYWZhcmk6IFwiNS4xXCIsXG4gICAqICAgICBvcGVyYTogXCIxNlwiLFxuICAgKiAgICAgcGhhbnRvbTogXCI1MzRcIlxuICAgKiAgIH0pO1xuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBtaW5WZXJzaW9ucyBtYXAgb2YgbWluaW1hbCB2ZXJzaW9uIHRvIGJyb3dzZXJcbiAgICogQHBhcmFtICB7Qm9vbGVhbn0gW3N0cmljdE1vZGUgPSBmYWxzZV0gZmxhZyB0byByZXR1cm4gZmFsc2UgaWYgYnJvd3NlciB3YXNuJ3QgZm91bmQgaW4gbWFwXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIFt1YV0gdXNlciBhZ2VudCBzdHJpbmdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzVW5zdXBwb3J0ZWRCcm93c2VyKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSkge1xuICAgIHZhciBfYm93c2VyID0gYm93c2VyO1xuXG4gICAgLy8gbWFrZSBzdHJpY3RNb2RlIHBhcmFtIG9wdGlvbmFsIHdpdGggdWEgcGFyYW0gdXNhZ2VcbiAgICBpZiAodHlwZW9mIHN0cmljdE1vZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB1YSA9IHN0cmljdE1vZGU7XG4gICAgICBzdHJpY3RNb2RlID0gdm9pZCgwKTtcbiAgICB9XG5cbiAgICBpZiAoc3RyaWN0TW9kZSA9PT0gdm9pZCgwKSkge1xuICAgICAgc3RyaWN0TW9kZSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodWEpIHtcbiAgICAgIF9ib3dzZXIgPSBkZXRlY3QodWEpO1xuICAgIH1cblxuICAgIHZhciB2ZXJzaW9uID0gXCJcIiArIF9ib3dzZXIudmVyc2lvbjtcbiAgICBmb3IgKHZhciBicm93c2VyIGluIG1pblZlcnNpb25zKSB7XG4gICAgICBpZiAobWluVmVyc2lvbnMuaGFzT3duUHJvcGVydHkoYnJvd3NlcikpIHtcbiAgICAgICAgaWYgKF9ib3dzZXJbYnJvd3Nlcl0pIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG1pblZlcnNpb25zW2Jyb3dzZXJdICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyIHZlcnNpb24gaW4gdGhlIG1pblZlcnNpb24gbWFwIHNob3VsZCBiZSBhIHN0cmluZzogJyArIGJyb3dzZXIgKyAnOiAnICsgU3RyaW5nKG1pblZlcnNpb25zKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYnJvd3NlciB2ZXJzaW9uIGFuZCBtaW4gc3VwcG9ydGVkIHZlcnNpb24uXG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVWZXJzaW9ucyhbdmVyc2lvbiwgbWluVmVyc2lvbnNbYnJvd3Nlcl1dKSA8IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaWN0TW9kZTsgLy8gbm90IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYnJvd3NlciBpcyBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBtaW5WZXJzaW9ucyBtYXAgb2YgbWluaW1hbCB2ZXJzaW9uIHRvIGJyb3dzZXJcbiAgICogQHBhcmFtICB7Qm9vbGVhbn0gW3N0cmljdE1vZGUgPSBmYWxzZV0gZmxhZyB0byByZXR1cm4gZmFsc2UgaWYgYnJvd3NlciB3YXNuJ3QgZm91bmQgaW4gbWFwXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIFt1YV0gdXNlciBhZ2VudCBzdHJpbmdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGNoZWNrKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSkge1xuICAgIHJldHVybiAhaXNVbnN1cHBvcnRlZEJyb3dzZXIobWluVmVyc2lvbnMsIHN0cmljdE1vZGUsIHVhKTtcbiAgfVxuXG4gIGJvd3Nlci5pc1Vuc3VwcG9ydGVkQnJvd3NlciA9IGlzVW5zdXBwb3J0ZWRCcm93c2VyO1xuICBib3dzZXIuY29tcGFyZVZlcnNpb25zID0gY29tcGFyZVZlcnNpb25zO1xuICBib3dzZXIuY2hlY2sgPSBjaGVjaztcblxuICAvKlxuICAgKiBTZXQgb3VyIGRldGVjdCBtZXRob2QgdG8gdGhlIG1haW4gYm93c2VyIG9iamVjdCBzbyB3ZSBjYW5cbiAgICogcmV1c2UgaXQgdG8gdGVzdCBvdGhlciB1c2VyIGFnZW50cy5cbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gaW1wbGVtZW50IGZ1dHVyZSB0ZXN0cy5cbiAgICovXG4gIGJvd3Nlci5fZGV0ZWN0ID0gZGV0ZWN0O1xuXG4gIC8qXG4gICAqIFNldCBvdXIgZGV0ZWN0IHB1YmxpYyBtZXRob2QgdG8gdGhlIG1haW4gYm93c2VyIG9iamVjdFxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBpbXBsZW1lbnQgYm93c2VyIGluIHNlcnZlciBzaWRlXG4gICAqL1xuICBib3dzZXIuZGV0ZWN0ID0gZGV0ZWN0O1xuICByZXR1cm4gYm93c2VyXG59KTtcbiIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcCcpO1xudmFyIHBvbHlmaWxscyA9IHJlcXVpcmUoJy4vcG9seWZpbGxzJyk7XG5cbnBvbHlmaWxscy5hcHBseVBvbHlmaWxscygpO1xuXG52YXIgaW5zdGFuY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEFwcCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oSGVscGVycy56aXBPYmplY3QoWydpbml0JywgJ29wZW4nLCAnb24nLCAnb2ZmJywgJ3NlbmRNZXNzYWdlJywgJ29uTWVzc2FnZSddLm1hcChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgICAgICB2YXIgYXBwID0gZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgcmV0dXJuIFttZXRob2ROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwW21ldGhvZE5hbWVdLmFwcGx5KGFwcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfV07XG4gICAgfSkpLCB7XG4gICAgICAgIGV2ZW50VHlwZXM6IEFwcC5ldmVudFR5cGVzLFxuICAgIH0pO1xufSkoKTtcbiJdfQ==
