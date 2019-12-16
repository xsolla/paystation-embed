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
    App.prototype.eventObject = {
        trigger: (function(event, data) {
            try {
                var event = new CustomEvent(event, {detail: data}); // Not working in IE
            } catch(e) {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent(event, true, true, data);
            }
            document.dispatchEvent(event);
        }).bind(this),
        on: (function(event, handle, options) {
            document.addEventListener(event, handle, options);
        }).bind(this),
        off: (function(event, handle, options) {
            document.removeEventListener(event, handle, options);
        }).bind(this)
    };

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
    App.prototype.init = function (options) {
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
    };

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

        bodyElement.append(lightBoxElement);

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
            lightBoxElement.remove();
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJib3dlcl9jb21wb25lbnRzL2Jvd3Nlci9zcmMvYm93c2VyLmpzIiwic3JjL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9WQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5REE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBOztBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MsIGN1c3RvbURvY3VtZW50KSB7XG4gIHZhciBkb2MgPSBjdXN0b21Eb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgaWYgKGRvYy5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgdmFyIHNoZWV0ID0gZG9jLmNyZWF0ZVN0eWxlU2hlZXQoKVxuICAgIHNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgcmV0dXJuIHNoZWV0Lm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBzdHlsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgfVxuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ieVVybCA9IGZ1bmN0aW9uKHVybCkge1xuICBpZiAoZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KHVybCkub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblxuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9IHVybDtcblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgcmV0dXJuIGxpbms7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2Nzc2lmeScpOyIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcbnZhciBMaWdodEJveCA9IHJlcXVpcmUoJy4vbGlnaHRib3gnKTtcbnZhciBDaGlsZFdpbmRvdyA9IHJlcXVpcmUoJy4vY2hpbGR3aW5kb3cnKTtcbnZhciBEZXZpY2UgPSByZXF1aXJlKCcuL2RldmljZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXBwKCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfQ09ORklHKTtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XG4gICAgICAgIHRoaXMuaXNJbml0aWF0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IG51bGw7XG4gICAgfVxuXG4gICAgQXBwLmV2ZW50VHlwZXMgPSB7XG4gICAgICAgIElOSVQ6ICdpbml0JyxcbiAgICAgICAgT1BFTjogJ29wZW4nLFxuICAgICAgICBPUEVOX1dJTkRPVzogJ29wZW4td2luZG93JyxcbiAgICAgICAgT1BFTl9MSUdIVEJPWDogJ29wZW4tbGlnaHRib3gnLFxuICAgICAgICBMT0FEOiAnbG9hZCcsXG4gICAgICAgIENMT1NFOiAnY2xvc2UnLFxuICAgICAgICBDTE9TRV9XSU5ET1c6ICdjbG9zZS13aW5kb3cnLFxuICAgICAgICBDTE9TRV9MSUdIVEJPWDogJ2Nsb3NlLWxpZ2h0Ym94JyxcbiAgICAgICAgU1RBVFVTOiAnc3RhdHVzJyxcbiAgICAgICAgU1RBVFVTX0lOVk9JQ0U6ICdzdGF0dXMtaW52b2ljZScsXG4gICAgICAgIFNUQVRVU19ERUxJVkVSSU5HOiAnc3RhdHVzLWRlbGl2ZXJpbmcnLFxuICAgICAgICBTVEFUVVNfVFJPVUJMRUQ6ICdzdGF0dXMtdHJvdWJsZWQnLFxuICAgICAgICBTVEFUVVNfRE9ORTogJ3N0YXR1cy1kb25lJ1xuICAgIH07XG5cbiAgICB2YXIgREVGQVVMVF9DT05GSUcgPSB7XG4gICAgICAgIGFjY2Vzc190b2tlbjogbnVsbCxcbiAgICAgICAgYWNjZXNzX2RhdGE6IG51bGwsXG4gICAgICAgIHNhbmRib3g6IGZhbHNlLFxuICAgICAgICBsaWdodGJveDoge30sXG4gICAgICAgIGNoaWxkV2luZG93OiB7fSxcbiAgICAgICAgaG9zdDogJ3NlY3VyZS54c29sbGEuY29tJ1xuICAgIH07XG4gICAgdmFyIEVWRU5UX05BTUVTUEFDRSA9ICcueHBheXN0YXRpb24td2lkZ2V0JztcbiAgICB2YXIgQVRUUl9QUkVGSVggPSAnZGF0YS14cGF5c3RhdGlvbi13aWRnZXQtb3Blbic7XG5cbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xuICAgIEFwcC5wcm90b3R5cGUuY29uZmlnID0ge307XG4gICAgQXBwLnByb3RvdHlwZS5pc0luaXRpYXRlZCA9IGZhbHNlO1xuICAgIEFwcC5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSB7XG4gICAgICAgIHRyaWdnZXI6IChmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnQsIHtkZXRhaWw6IGRhdGF9KTsgLy8gTm90IHdvcmtpbmcgaW4gSUVcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudCwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICAgb246IChmdW5jdGlvbihldmVudCwgaGFuZGxlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpLFxuICAgICAgICBvZmY6IChmdW5jdGlvbihldmVudCwgaGFuZGxlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUuZ2V0UGF5c3RhdGlvblVybCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIFNBTkRCT1hfUEFZU1RBVElPTl9VUkwgPSAnaHR0cHM6Ly9zYW5kYm94LXNlY3VyZS54c29sbGEuY29tL3BheXN0YXRpb24yLz8nO1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuc2FuZGJveCA/IFNBTkRCT1hfUEFZU1RBVElPTl9VUkwgOiAnaHR0cHM6Ly8nICsgdGhpcy5jb25maWcuaG9zdCArICcvcGF5c3RhdGlvbjIvPyc7XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUuY2hlY2tDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX3Rva2VuKSAmJiBIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpKSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ05vIGFjY2VzcyB0b2tlbiBnaXZlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpICYmIHR5cGVvZiB0aGlzLmNvbmZpZy5hY2Nlc3NfZGF0YSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW52YWxpZCBhY2Nlc3MgZGF0YSBmb3JtYXQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuaG9zdCkpIHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW52YWxpZCBob3N0Jyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXBwLnByb3RvdHlwZS5jaGVja0FwcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNJbml0aWF0ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdJbml0aWFsaXplIHdpZGdldCBiZWZvcmUgb3BlbmluZycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUudGhyb3dFcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24obWVzc2FnZSk7XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcbiAgICAgICAgICAgIGV2ZW50LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB3aWRnZXQgd2l0aCBvcHRpb25zXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRywgb3B0aW9ucyk7XG5cbiAgICAgICAgdmFyIGJvZHlFbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmJvZHk7XG4gICAgICAgIHZhciBjbGlja0V2ZW50TmFtZSA9ICdjbGljaycgKyBFVkVOVF9OQU1FU1BBQ0U7XG5cbiAgICAgICAgdmFyIGhhbmRsZUNsaWNrRXZlbnQgPSAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignWycgKyBBVFRSX1BSRUZJWCArICddJyk7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlRXZlbnQudGFyZ2V0ID09PSB0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuLmNhbGwodGhpcywgdGFyZ2V0RWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XG5cbiAgICAgICAgdmFyIGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoY2xpY2tFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgY2xpY2tFdmVudC5zb3VyY2VFdmVudCA9IGV2ZW50O1xuICAgICAgICAgICAgYm9keUVsZW1lbnQuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpO1xuXG4gICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudE5hbWUsIGhhbmRsZUNsaWNrRXZlbnQpO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLklOSVQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBPcGVuIHBheW1lbnQgaW50ZXJmYWNlIChQYXlTdGF0aW9uKVxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jaGVja0NvbmZpZygpO1xuICAgICAgICB0aGlzLmNoZWNrQXBwKCk7XG5cbiAgICAgICAgdmFyIHRyaWdnZXJTcGxpdFN0YXR1cyA9IChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgc3dpdGNoICgoKGRhdGEgfHwge30pLnBheW1lbnRJbmZvIHx8IHt9KS5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdpbnZvaWNlJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX0lOVk9JQ0UsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxpdmVyaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX0RFTElWRVJJTkcsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd0cm91YmxlZCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19UUk9VQkxFRCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RvbmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfRE9ORSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHZhciBxdWVyeSA9IHt9O1xuICAgICAgICBpZiAodGhpcy5jb25maWcuYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBxdWVyeS5hY2Nlc3NfdG9rZW4gPSB0aGlzLmNvbmZpZy5hY2Nlc3NfdG9rZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWVyeS5hY2Nlc3NfZGF0YSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmdldFBheXN0YXRpb25VcmwoKSArIEhlbHBlcnMucGFyYW0ocXVlcnkpO1xuXG4gICAgICAgIHRoaXMucG9zdE1lc3NhZ2UgPSBudWxsO1xuICAgICAgICBpZiAoKG5ldyBEZXZpY2UpLmlzTW9iaWxlKCkpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZFdpbmRvdyA9IG5ldyBDaGlsZFdpbmRvdztcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdvcGVuJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gY2hpbGRXaW5kb3cuZ2V0UG9zdE1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOX1dJTkRPVyk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdsb2FkJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ2Nsb3NlJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0VfV0lORE9XKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ3N0YXR1cycsIChmdW5jdGlvbiAoZXZlbnQsIHN0YXR1c0RhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVMsIHN0YXR1c0RhdGEpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJTcGxpdFN0YXR1cyhzdGF0dXNEYXRhKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub3Blbih1cmwsIHRoaXMuY29uZmlnLmNoaWxkV2luZG93KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsaWdodEJveCA9IG5ldyBMaWdodEJveDtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdvcGVuJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gbGlnaHRCb3guZ2V0UG9zdE1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOX0xJR0hUQk9YKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgbGlnaHRCb3gub24oJ2xvYWQnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkxPQUQpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBsaWdodEJveC5vbignY2xvc2UnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkNMT1NFKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRV9MSUdIVEJPWCk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdzdGF0dXMnLCAoZnVuY3Rpb24gKGV2ZW50LCBzdGF0dXNEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTLCBzdGF0dXNEYXRhKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU3BsaXRTdGF0dXMoc3RhdHVzRGF0YSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9wZW5GcmFtZSh1cmwsIHRoaXMuY29uZmlnLmxpZ2h0Ym94KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbiBmb3Igb25lIG9yIG1vcmUgZXZlbnRzIHRvIHRoZSB3aWRnZXRcbiAgICAgKiBAcGFyYW0gZXZlbnQgT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzIChpbml0LCBvcGVuLCBsb2FkLCBjbG9zZSwgc3RhdHVzLCBzdGF0dXMtaW52b2ljZSwgc3RhdHVzLWRlbGl2ZXJpbmcsIHN0YXR1cy10cm91YmxlZCwgc3RhdHVzLWRvbmUpXG4gICAgICogQHBhcmFtIGhhbmRsZXIgQSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZFxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uKGV2ZW50LCBoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0gZXZlbnQgT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzXG4gICAgICogQHBhcmFtIGhhbmRsZXIgQSBoYW5kbGVyIGZ1bmN0aW9uIHByZXZpb3VzbHkgYXR0YWNoZWQgZm9yIHRoZSBldmVudChzKVxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmKGV2ZW50LCBoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgZGlyZWN0bHkgdG8gUGF5U3RhdGlvblxuICAgICAqIEBwYXJhbSBjb21tYW5kXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKGNvbW1hbmQsIGRhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMucG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uuc2VuZC5hcHBseSh0aGlzLnBvc3RNZXNzYWdlLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBtZXNzYWdlIGV2ZW50IGZyb20gUGF5U3RhdGlvblxuICAgICAqIEBwYXJhbSBjb21tYW5kXG4gICAgICogQHBhcmFtIGhhbmRsZXJcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLm9uTWVzc2FnZSA9IGZ1bmN0aW9uIChjb21tYW5kLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmICh0aGlzLnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlLm9uLmFwcGx5KHRoaXMucG9zdE1lc3NhZ2UsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIEFwcDtcbn0pKCk7XG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpO1xudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENoaWxkV2luZG93KCkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzLCB3cmFwRXZlbnRJbk5hbWVzcGFjZSk7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBldmVudE5hbWUgKyAnXycgKyBDaGlsZFdpbmRvdy5fTkFNRVNQQUNFO1xuICAgIH1cblxuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgICAgIHRhcmdldDogJ19ibGFuaydcbiAgICB9O1xuXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBudWxsO1xuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jaGlsZFdpbmRvdyA9IG51bGw7XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudCwgZGF0YSk7XG4gICAgfTtcblxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cgJiYgIXRoaXMuY2hpbGRXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWRkSGFuZGxlcnMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5vbignY2xvc2UnLCAoZnVuY3Rpb24gaGFuZGxlQ2xvc2UoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLmNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoaWxkV2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBoYW5kbGVDbG9zZSlcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAvLyBDcm9zcy13aW5kb3cgY29tbXVuaWNhdGlvblxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKHRoaXMuY2hpbGRXaW5kb3cpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zIHdpZGdldC1kZXRlY3Rpb24nLCAoZnVuY3Rpb24gd2lkZ2V0RGV0ZWN0aW9uSGFuZGxlKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2xvYWQnKTtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGltZW5zaW9ucyB3aWRnZXQtZGV0ZWN0aW9uJywgaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCd3aWRnZXQtZGV0ZWN0aW9uJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2Uuc2VuZCgnd2lkZ2V0LWRldGVjdGVkJywge3ZlcnNpb246IHZlcnNpb24sIGNoaWxkV2luZG93T3B0aW9uczogb3B0aW9uc30pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3N0YXR1cycsIChmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZGF0YSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMub24oJ2Nsb3NlJywgKGZ1bmN0aW9uIGhhbmRsZUNsb3NlKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9mZigpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbG9zZScsIGhhbmRsZUNsb3NlKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ19zZWxmJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdztcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ19wYXJlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBnbG9iYWwud2luZG93LnBhcmVudDtcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ19ibGFuayc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBnbG9iYWwud2luZG93Lm9wZW4odXJsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcnMoKTtcblxuICAgICAgICAgICAgICAgIHZhciBjaGVja1dpbmRvdyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoaWxkV2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdy5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXIgPSBnbG9iYWwuc2V0VGltZW91dChjaGVja1dpbmRvdywgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnb3BlbicpO1xuICAgIH07XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xuICAgIH07XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uKGV2ZW50LCBoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlcikge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9mZihldmVudCwgaGFuZGxlcik7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5nZXRQb3N0TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cuX05BTUVTUEFDRSA9ICdDSElMRF9XSU5ET1cnO1xuXG4gICAgcmV0dXJuIENoaWxkV2luZG93O1xufSkoKTtcbiIsInZhciBib3dzZXIgPSByZXF1aXJlKCdib3dzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERldmljZSgpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb2JpbGUgZGV2aWNlc1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIERldmljZS5wcm90b3R5cGUuaXNNb2JpbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGJvd3Nlci5tb2JpbGUgfHwgYm93c2VyLnRhYmxldDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIERldmljZTtcbn0pKCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLm5hbWUgPSBcIlhzb2xsYVBheVN0YXRpb25XaWRnZXRFeGNlcHRpb25cIjtcbiAgICB0aGlzLnRvU3RyaW5nID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICc6ICcgKyB0aGlzLm1lc3NhZ2U7XG4gICAgfSkuYmluZCh0aGlzKTtcbn07XG4iLCJmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB1bmlxKGxpc3QpIHtcbiAgcmV0dXJuIGxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgsIGksIGEpIHtcbiAgICByZXR1cm4gYS5pbmRleE9mKHgpID09IGlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHppcE9iamVjdChwcm9wcywgdmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMgPyBwcm9wcy5sZW5ndGggOiAwLFxuICAgICAgcmVzdWx0ID0ge307XG5cbiAgaWYgKGxlbmd0aCAmJiAhdmFsdWVzICYmICFBcnJheS5pc0FycmF5KHByb3BzWzBdKSkge1xuICAgIHZhbHVlcyA9IFtdO1xuICB9XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICBpZiAodmFsdWVzKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlc1tpbmRleF07XG4gICAgfSBlbHNlIGlmIChrZXkpIHtcbiAgICAgIHJlc3VsdFtrZXlbMF1dID0ga2V5WzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwYXJhbShhKSB7XG4gIHZhciBzID0gW107XG5cbiAgdmFyIGFkZCA9IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgICB2ID0gdHlwZW9mIHYgPT09ICdmdW5jdGlvbicgPyB2KCkgOiB2O1xuICAgICAgdiA9IHYgPT09IG51bGwgPyAnJyA6IHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdjtcbiAgICAgIHNbcy5sZW5ndGhdID0gZW5jb2RlVVJJQ29tcG9uZW50KGspICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHYpO1xuICB9O1xuXG4gIHZhciBidWlsZFBhcmFtcyA9IGZ1bmN0aW9uIChwcmVmaXgsIG9iaikge1xuICAgICAgdmFyIGksIGxlbiwga2V5O1xuXG4gICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBvYmoubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIGJ1aWxkUGFyYW1zKFxuICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArICdbJyArICh0eXBlb2Ygb2JqW2ldID09PSAnb2JqZWN0JyAmJiBvYmpbaV0gPyBpIDogJycpICsgJ10nLFxuICAgICAgICAgICAgICAgICAgICAgIG9ialtpXVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoU3RyaW5nKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgICAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICAgICAgICAgICAgYnVpbGRQYXJhbXMocHJlZml4ICsgJ1snICsga2V5ICsgJ10nLCBvYmpba2V5XSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhZGQocHJlZml4LCBvYmopO1xuICAgICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIGFkZChvYmpbaV0ubmFtZSwgb2JqW2ldLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICAgICAgICBidWlsZFBhcmFtcyhrZXksIG9ialtrZXldKTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgfTtcblxuICByZXR1cm4gYnVpbGRQYXJhbXMoJycsIGEpLmpvaW4oJyYnKTtcbn07XG5cblxuZnVuY3Rpb24gb25jZShmKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGYoKTtcbiAgICAgIGYgPSBmdW5jdGlvbigpIHt9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50T2JqZWN0KGNvbnRleHQsIHdyYXBFdmVudEluTmFtZXNwYWNlKSB7XG4gICAgdmFyIGR1bW15V3JhcHBlciA9IGZ1bmN0aW9uKGV2ZW50KSB7IHJldHVybiBldmVudCB9O1xuICAgIHZhciB3cmFwRXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlIHx8IGR1bW15V3JhcHBlcjtcbiAgICByZXR1cm4ge1xuICAgICAgdHJpZ2dlcjogKGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSkge1xuICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnRJbk5hbWVzcGFjZSwge2RldGFpbDogZGF0YX0pOyAvLyBOb3Qgd29ya2luZyBpbiBJRVxuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgICAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50SW5OYW1lc3BhY2UsIHRydWUsIHRydWUsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgIH0pLmJpbmQoY29udGV4dCksXG4gICAgICBvbjogKGZ1bmN0aW9uKGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKSB7XG4gICAgICAgICAgdmFyIGV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpO1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRJbk5hbWVzcGFjZSwgaGFuZGxlLCBvcHRpb25zKTtcbiAgICAgIH0pLmJpbmQoY29udGV4dCksXG4gICAgICBvZmY6IChmdW5jdGlvbihldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZSwgb3B0aW9ucyk7XG4gICAgICB9KS5iaW5kKGNvbnRleHQpXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRFdmVudE9iamVjdDogYWRkRXZlbnRPYmplY3QsXG4gIGlzRW1wdHk6IGlzRW1wdHksXG4gIHVuaXE6IHVuaXEsXG4gIHppcE9iamVjdDogemlwT2JqZWN0LFxuICBwYXJhbTogcGFyYW0sXG4gIG9uY2U6IG9uY2UsXG59XG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpO1xudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExpZ2h0Qm94KCkge1xuICAgICAgICByZXF1aXJlKCcuL3N0eWxlcy9saWdodGJveC5zY3NzJyk7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gREVGQVVMVF9PUFRJT05TO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBDTEFTU19QUkVGSVggPSAneHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94JztcbiAgICB2YXIgRVZFTlRfTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgICAgIHdpZHRoOiBudWxsLFxuICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgekluZGV4OiAxMDAwLFxuICAgICAgICBvdmVybGF5T3BhY2l0eTogJy42JyxcbiAgICAgICAgb3ZlcmxheUJhY2tncm91bmQ6ICcjMDAwMDAwJyxcbiAgICAgICAgY29udGVudEJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgICAgICAgY29udGVudE1hcmdpbjogJzEwcHgnLFxuICAgICAgICBjbG9zZUJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgIGNsb3NlQnlDbGljazogdHJ1ZSxcbiAgICAgICAgbW9kYWw6IGZhbHNlLFxuICAgICAgICBzcGlubmVyOiAneHNvbGxhJyxcbiAgICAgICAgc3Bpbm5lckNvbG9yOiBudWxsLFxuICAgICAgICBzcGlubmVyVXJsOiBudWxsLFxuICAgICAgICBzcGlubmVyUm90YXRpb25QZXJpb2Q6IDBcbiAgICB9O1xuXG4gICAgdmFyIFNQSU5ORVJTID0ge1xuICAgICAgICB4c29sbGE6IHJlcXVpcmUoJy4vc3Bpbm5lcnMveHNvbGxhLnN2ZycpLFxuICAgICAgICByb3VuZDogcmVxdWlyZSgnLi9zcGlubmVycy9yb3VuZC5zdmcnKSxcbiAgICAgICAgbm9uZTogJyAnXG4gICAgfTtcblxuICAgIHZhciBNSU5fUFNfRElNRU5TSU9OUyA9IHtcbiAgICAgICAgaGVpZ2h0OiA1MDAsXG4gICAgICAgIHdpZHRoOiA2MDBcbiAgICB9O1xuXG4gICAgdmFyIGhhbmRsZUtleXVwRXZlbnROYW1lID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoJ2tleXVwJyk7XG5cbiAgICB2YXIgaGFuZGxlS2V5dXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT0gMjcpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBldmVudE5hbWUgKyAnXycgKyBFVkVOVF9OQU1FU1BBQ0U7XG4gICAgfVxuXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cbiAgICBMaWdodEJveC5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0LnRyaWdnZXIuYXBwbHkodGhpcy5ldmVudE9iamVjdCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm1lYXN1cmVTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7IC8vIHRoeCB3YWxzaDogaHR0cHM6Ly9kYXZpZHdhbHNoLm5hbWUvZGV0ZWN0LXNjcm9sbGJhci13aWR0aFxuICAgICAgICB2YXIgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2Nyb2xsRGl2LmNsYXNzTGlzdC5hZGQoXCJzY3JvbGxiYXItbWVhc3VyZVwiKTtcbiAgICAgICAgc2Nyb2xsRGl2LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXG4gICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICtcbiAgICAgICAgXCJ0b3A6IC05OTk5cHhcIiArXG4gICAgICAgIFwid2lkdGg6IDUwcHhcIiArXG4gICAgICAgIFwiaGVpZ2h0OiA1MHB4XCIgK1xuICAgICAgICBcIm92ZXJmbG93OiBzY3JvbGxcIlxuICAgICk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JvbGxEaXYpO1xuXG4gICAgICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpO1xuXG4gICAgICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aDtcbiAgICB9O1xuXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vcGVuRnJhbWUgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgdmFyIHNwaW5uZXIgPSBvcHRpb25zLnNwaW5uZXIgPT09ICdjdXN0b20nICYmICEhb3B0aW9ucy5zcGlubmVyVXJsID9cbiAgICAgICAgICAgICc8aW1nIGNsYXNzPVwic3Bpbm5lci1jdXN0b21cIiBzcmM9XCInICsgZW5jb2RlVVJJKG9wdGlvbnMuc3Bpbm5lclVybCkgKyAnXCIgLz4nIDogU1BJTk5FUlNbb3B0aW9ucy5zcGlubmVyXSB8fCBPYmplY3QudmFsdWVzKFNQSU5ORVJTKVswXTtcblxuICAgICAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIHZhciBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBob3N0LmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeDtcblxuICAgICAgICAgICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG92ZXJsYXkuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1vdmVybGF5JztcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50JyArICcgJyArIHNldHRpbmdzLnByZWZpeCArICctY29udGVudF9faGlkZGVuJztcblxuICAgICAgICAgICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICAgICAgaWZyYW1lLmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctY29udGVudC1pZnJhbWUnO1xuICAgICAgICAgICAgaWZyYW1lLnNyYyA9IHNldHRpbmdzLnVybDtcbiAgICAgICAgICAgIGlmcmFtZS5mcmFtZUJvcmRlciA9ICcwJztcbiAgICAgICAgICAgIGlmcmFtZS5hbGxvd0Z1bGxzY3JlZW4gPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Bpbm5lci5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLXNwaW5uZXInO1xuICAgICAgICAgICAgc3Bpbm5lci5pbm5lckhUTUwgPSBzZXR0aW5ncy5zcGlubmVyO1xuXG4gICAgICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChzcGlubmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGJvZHlFbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmJvZHk7XG4gICAgICAgIHZhciBsaWdodEJveEVsZW1lbnQgPSB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICBwcmVmaXg6IENMQVNTX1BSRUZJWCxcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgc3Bpbm5lcjogc3Bpbm5lclxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94T3ZlcmxheUVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLW92ZXJsYXknKTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLWNvbnRlbnQnKTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94SWZyYW1lRWxlbWVudCA9IGxpZ2h0Qm94Q29udGVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLWNvbnRlbnQtaWZyYW1lJyk7XG4gICAgICAgIHZhciBsaWdodEJveFNwaW5uZXJFbGVtZW50ID0gbGlnaHRCb3hFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NfUFJFRklYICsgJy1zcGlubmVyJyk7XG5cbiAgICAgICAgdmFyIHBzRGltZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAnMHB4JyxcbiAgICAgICAgICAgIGhlaWdodDogJzBweCdcbiAgICAgICAgfTtcblxuICAgICAgICBsaWdodEJveEVsZW1lbnQuc3R5bGUuekluZGV4ID0gb3B0aW9ucy56SW5kZXg7XG5cbiAgICAgICAgbGlnaHRCb3hPdmVybGF5RWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gb3B0aW9ucy5vdmVybGF5T3BhY2l0eTtcbiAgICAgICAgbGlnaHRCb3hPdmVybGF5RWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLm92ZXJsYXlCYWNrZ3JvdW5kO1xuXG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5jb250ZW50QmFja2dyb3VuZDtcbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5tYXJnaW4gPSBvcHRpb25zLmNvbnRlbnRNYXJnaW47XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc3Bpbm5lckNvbG9yKSB7XG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BhdGgnKS5zdHlsZS5maWxsID0gb3B0aW9ucy5zcGlubmVyQ29sb3I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5zcGlubmVyID09PSAnY3VzdG9tJykge1xuICAgICAgICAgICAgdmFyIHNwaW5uZXJDdXN0b20gPSBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyLWN1c3RvbScpO1xuICAgICAgICAgICAgc3Bpbm5lckN1c3RvbS5zdHlsZVsnLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb24nXSA9IG9wdGlvbnMuc3Bpbm5lclJvdGF0aW9uUGVyaW9kICsgJ3M7JztcbiAgICAgICAgICAgIHNwaW5uZXJDdXN0b20uc3R5bGVbJ2FuaW1hdGlvbi1kdXJhdGlvbiddID0gb3B0aW9ucy5zcGlubmVyUm90YXRpb25QZXJpb2QgKyAnczsnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUNsaWNrKSB7XG4gICAgICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kKGxpZ2h0Qm94RWxlbWVudCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUtleWJvYXJkKSB7XG5cbiAgICAgICAgICAgIGJvZHlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGhhbmRsZUtleXVwKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgICAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBjbGlja0V2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG5cbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNob3dDb250ZW50ID0gSGVscGVycy5vbmNlKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBoaWRlU3Bpbm5lcihvcHRpb25zKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19QUkVGSVggKyAnLWNvbnRlbnRfX2hpZGRlbicpXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnbG9hZCcpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB2YXIgbGlnaHRCb3hSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoID8gb3B0aW9ucy53aWR0aCA6IHBzRGltZW5zaW9ucy53aWR0aDtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCA/IG9wdGlvbnMuaGVpZ2h0IDogcHNEaW1lbnNpb25zLmhlaWdodDtcblxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnOHB4JztcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGggPSBsaWdodEJveEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gbGlnaHRCb3hFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IG91dGVyV2lkdGgobGlnaHRCb3hDb250ZW50RWxlbWVudCksXG4gICAgICAgICAgICAgICAgY29udGVudEhlaWdodCA9IG91dGVySGVpZ2h0KGxpZ2h0Qm94Q29udGVudEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB2YXIgaG9yTWFyZ2luID0gY29udGVudFdpZHRoIC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIHZlcnRNYXJnaW4gPSBjb250ZW50SGVpZ2h0IC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgICAgIHZhciBob3JEaWZmID0gY29udGFpbmVyV2lkdGggLSBjb250ZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgdmVydERpZmYgPSBjb250YWluZXJIZWlnaHQgLSBjb250ZW50SGVpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoaG9yRGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gY29udGFpbmVyV2lkdGggLSBob3JNYXJnaW4gKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmxlZnQgPSBNYXRoLnJvdW5kKGhvckRpZmYgLyAyKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2ZXJ0RGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHZlcnRNYXJnaW4gKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLnRvcCA9IE1hdGgucm91bmQodmVydERpZmYgLyAyKSArICdweCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gb3V0ZXJXaWR0aChlbCkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luTGVmdCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5SaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG91dGVySGVpZ2h0KGVsKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYm9keVN0eWxlcztcbiAgICAgICAgdmFyIGhpZGVTY3JvbGxiYXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYm9keVN0eWxlcyA9IEhlbHBlcnMuemlwT2JqZWN0KFsnb3ZlcmZsb3cnLCAncGFkZGluZ1JpZ2h0J10ubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2tleSwgZ2V0Q29tcHV0ZWRTdHlsZShib2R5RWxlbWVudClba2V5XV07XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGlmIChnbG9iYWwud2luZG93LmlubmVyV2lkdGggPiBvdXRlcldpZHRoKGJvZHlFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKGdldENvbXB1dGVkU3R5bGUoYm9keUVsZW1lbnQpW3BhZGRpbmdSaWdodF0gfHwgMCksIDEwKTtcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW47JztcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBib2R5UGFkICsgdGhpcy5tZWFzdXJlU2Nyb2xsYmFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdmFyIHJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhib2R5U3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZVtrZXldID0gYm9keVN0eWxlc1trZXldO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNob3dTcGlubmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaGlkZVNwaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxvYWRUaW1lcjtcbiAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZnVuY3Rpb24gaGFuZGxlTG9hZChldmVudCkge1xuICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSAhb3B0aW9ucy53aWR0aCB8fCAhb3B0aW9ucy5oZWlnaHQgPyAzMDAwMCA6IDEwMDA7IC8vMzAwMDAgaWYgcHNEaW1lbnNpb25zIHdpbGwgbm90IGFycml2ZVxuICAgICAgICAgICAgbG9hZFRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgaGFuZGxlTG9hZCk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHZhciBpZnJhbWVXaW5kb3cgPSBsaWdodEJveElmcmFtZUVsZW1lbnQuY29udGVudFdpbmRvdyB8fCBsaWdodEJveElmcmFtZUVsZW1lbnQ7XG5cbiAgICAgICAgLy8gQ3Jvc3Mtd2luZG93IGNvbW11bmljYXRpb25cbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKGlmcmFtZVdpbmRvdyk7XG4gICAgICAgIGlmIChvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2RpbWVuc2lvbnMnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2RpbWVuc2lvbnMnLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBldmVudC5kZXRhaWw7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZGltZW5zaW9ucykge1xuICAgICAgICAgICAgICAgICAgICBwc0RpbWVuc2lvbnMgPSBIZWxwZXJzLnppcE9iamVjdChbJ3dpZHRoJywgJ2hlaWdodCddLm1hcChmdW5jdGlvbiAoZGltKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2RpbSwgTWF0aC5tYXgoTUlOX1BTX0RJTUVOU0lPTlNbZGltXSB8fCAwLCBkYXRhLmRpbWVuc2lvbnNbZGltXSB8fCAwKSArICdweCddO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hvd0NvbnRlbnQoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3dpZGdldC1kZXRlY3Rpb24nLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBsaWdodEJveE9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignd2lkZ2V0LWNsb3NlJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdzdGF0dXMnLCAoZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZGF0YSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIFJlc2l6ZVxuICAgICAgICB2YXIgaGFuZGxlUmVzaXplRXZlbnROYW1lID0gJ3Jlc2l6ZScgKyBFVkVOVF9OQU1FU1BBQ0U7XG5cbiAgICAgICAgdmFyIHJlc2l6ZUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIHJlc2l6ZUV2ZW50LmluaXRFdmVudChoYW5kbGVSZXNpemVFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihoYW5kbGVSZXNpemVFdmVudE5hbWUsIGxpZ2h0Qm94UmVzaXplKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHJlc2l6ZUV2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG4gICAgICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KHJlc2l6ZUV2ZW50KTtcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBDbGVhbiB1cCBhZnRlciBjbG9zZVxuICAgICAgICB0aGlzLm9uKCdjbG9zZScsIChmdW5jdGlvbiBoYW5kbGVDbG9zZShldmVudCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9mZigpO1xuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgaGFuZGxlS2V5dXApXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVSZXNpemVFdmVudE5hbWUsIGxpZ2h0Qm94UmVzaXplKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94RWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJlc2V0U2Nyb2xsYmFyKCk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBoYW5kbGVDbG9zZSlcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcbiAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2hvd1NwaW5uZXIoKTtcbiAgICAgICAgaGlkZVNjcm9sbGJhcigpO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5jbG9zZUZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5tb2RhbCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5nZXRQb3N0TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3guX05BTUVTUEFDRSA9IEVWRU5UX05BTUVTUEFDRTtcblxuICAgIHJldHVybiBMaWdodEJveDtcbn0pKCk7XG4iLCJmdW5jdGlvbiBvYmplY3RBc3NpZ24oKSB7XG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24gUG9seWZpbGxcbiAgT2JqZWN0LmFzc2lnbnx8T2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdCxcImFzc2lnblwiLHtlbnVtZXJhYmxlOiExLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTpmdW5jdGlvbihlLHIpe1widXNlIHN0cmljdFwiO2lmKG51bGw9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdFwiKTtmb3IodmFyIHQ9T2JqZWN0KGUpLG49MTtuPGFyZ3VtZW50cy5sZW5ndGg7bisrKXt2YXIgbz1hcmd1bWVudHNbbl07aWYobnVsbCE9bylmb3IodmFyIGE9T2JqZWN0LmtleXMoT2JqZWN0KG8pKSxjPTAsYj1hLmxlbmd0aDtjPGI7YysrKXt2YXIgaT1hW2NdLGw9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLGkpO3ZvaWQgMCE9PWwmJmwuZW51bWVyYWJsZSYmKHRbaV09b1tpXSl9fXJldHVybiB0fX0pO1xufVxuXG5mdW5jdGlvbiBhcnJheUZvckVhY2goKSB7XG4gIEFycmF5LnByb3RvdHlwZS5mb3JFYWNofHwoQXJyYXkucHJvdG90eXBlLmZvckVhY2g9ZnVuY3Rpb24ocixvKXt2YXIgdCxuO2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcihcIiB0aGlzIGlzIG51bGwgb3Igbm90IGRlZmluZWRcIik7dmFyIGU9T2JqZWN0KHRoaXMpLGk9ZS5sZW5ndGg+Pj4wO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcihyK1wiIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO2Zvcihhcmd1bWVudHMubGVuZ3RoPjEmJih0PW8pLG49MDtuPGk7KXt2YXIgZjtuIGluIGUmJihmPWVbbl0sci5jYWxsKHQsZixuLGUpKSxuKyt9fSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5UG9seWZpbGxzKCkge1xuICBvYmplY3RBc3NpZ24oKTtcbiAgYXJyYXlGb3JFYWNoKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhcHBseVBvbHlmaWxsczogYXBwbHlQb2x5ZmlsbHNcbn1cbiIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBQb3N0TWVzc2FnZSh3aW5kb3cpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XG4gICAgICAgIHRoaXMubGlua2VkV2luZG93ID0gd2luZG93O1xuXG4gICAgICAgIGdsb2JhbC53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiBnbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgIT09IHRoaXMubGlua2VkV2luZG93KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHt9O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudC5kYXRhID09PSAnc3RyaW5nJyAmJiBnbG9iYWwuSlNPTiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGdsb2JhbC5KU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmNvbW1hbmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50T2JqZWN0LnRyaWdnZXIobWVzc2FnZS5jb21tYW5kLCBtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5ldmVudE9iamVjdCA9IG51bGw7XG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLmxpbmtlZFdpbmRvdyA9IG51bGw7XG5cbiAgICAvKiogUHVibGljIE1lbWJlcnMgKiovXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihjb21tYW5kLCBkYXRhLCB0YXJnZXRPcmlnaW4pIHtcbiAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldE9yaWdpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXJnZXRPcmlnaW4gPSAnKic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubGlua2VkV2luZG93IHx8IHRoaXMubGlua2VkV2luZG93LnBvc3RNZXNzYWdlID09PSB1bmRlZmluZWQgfHwgZ2xvYmFsLndpbmRvdy5KU09OID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxpbmtlZFdpbmRvdy5wb3N0TWVzc2FnZShnbG9iYWwuSlNPTi5zdHJpbmdpZnkoe2RhdGE6IGRhdGEsIGNvbW1hbmQ6IGNvbW1hbmR9KSwgdGFyZ2V0T3JpZ2luKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlLCBvcHRpb25zKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gUG9zdE1lc3NhZ2U7XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgd2lkdGg9XFxcIjQ3cHhcXFwiIGhlaWdodD1cXFwiNDdweFxcXCIgY2xhc3M9XFxcInNwaW5uZXItcm91bmRcXFwiPjxwYXRoIGQ9XFxcIk00Ljc4NTI3MjgsMTAuNDIxMDg3NSBDMi45NDExMTY2NCwxMy4wNTUyMTk3IDEuNjM3NzcxMDksMTYuMDk0NjEwNiAxLjAzNzUzOTU2LDE5LjM3Njg1NTYgTDUuMTY2Mzg5NzEsMTkuMzc2ODU1NiBDNS42NDI5NjE1LDE3LjE4NzU1NCA2LjUwMTI1MjQzLDE1LjEzOTE2NCA3LjY2NzY4ODk5LDEzLjMwNTMwNSBMNS45NTU3MjQyOCwxMS41OTIyNzA1IEw0Ljc4NTI3MjgsMTAuNDIxMDg3NSBMNC43ODUyNzI4LDEwLjQyMTA4NzUgWiBNMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IEMxMy4xMjc0ODczLDIuODkwODA2MSAxNi4xOTY1OTc2LDEuNTg2NzQ2NDggMTkuNTEwMDE2MSwxIEwxOS41MTAwMTYxLDQuOTk1MjM5MzQgQzE3LjI3MTA5MjMsNS40ODc5Nzc4MiAxNS4xODAzMTkzLDYuMzgwODUyOSAxMy4zMTY2OTA3LDcuNTk0ODIxNTMgTDExLjYzMzczMzksNS45MTA4MTI5MyBMMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IEwxMC40NjkzMDQ4LDQuNzQ1NjU2MTUgWiBNNDIuMjQyNjMwOSwzNi41Mzg4Mzg2IEM0NC4xMTEyNzgyLDMzLjg1NzUwMTYgNDUuNDIwNjQ2MSwzMC43NTgxNTA0IDQ2LDI3LjQxMTcyNjkgTDQxLjk0NDEyMTEsMjcuNDExNzI2OSBDNDEuNDUyNzk0NSwyOS42NjE4OTI2IDQwLjU1ODM2OTIsMzEuNzYyOTExIDM5LjM0MDQ0MTIsMzMuNjM0OTM1NiBMNDEuMDMzMjM0NywzNS4zMjg3ODY5IEw0Mi4yNDI1MzA2LDM2LjUzODgzODYgTDQyLjI0MjYzMDksMzYuNTM4ODM4NiBaIE0zNi41NzA3NDQxLDQyLjIyNjQyMjcgQzMzLjkxNjc3NzMsNDQuMDg2Nzk2NyAzMC44NTA5NzkzLDQ1LjM5NzI4NDIgMjcuNTM5ODY5Myw0NS45OTExNjE2IEwyNy41Mzk4NjkzLDQxLjc5NjA1NDkgQzI5LjczNzY0MDIsNDEuMzIwMjkwMSAzMS43OTM2ODQxLDQwLjQ1OTM1MzYgMzMuNjMzNjI0NiwzOS4yODc1NjggTDM1LjM1NTQyNTgsNDEuMDEwNDQ1MyBMMzYuNTcwNzQ0MSw0Mi4yMjY1MjMxIEwzNi41NzA3NDQxLDQyLjIyNjQyMjcgWiBNNC43MTE3OTk2NSwzNi40NzMxNTM1IEMyLjg2NzQ0Mjc0LDMzLjgwNjk4MjMgMS41NzQ2MzYzNywzMC43MzA5MzIyIDEsMjcuNDExODI3MyBMNS4xNjg4OTkwNCwyNy40MTE4MjczIEM1LjY0ODI4MTI4LDI5LjYwNzM1NTkgNi41MTE1OTA4NywzMS42NjEwNjkgNy42ODQ2NTIwNSwzMy40OTg0NDMyIEw1Ljk1NTcyNDI4LDM1LjIyODQ1MTUgTDQuNzExNzk5NjUsMzYuNDczMTUzNSBMNC43MTE3OTk2NSwzNi40NzMxNTM1IFogTTEwLjM2NDAxMzMsNDIuMTgwNDIzIEMxMy4wNDYyODU0LDQ0LjA3NDU0MzUgMTYuMTUyNzM0NSw0NS40MDU1MiAxOS41MTAxMTY1LDQ2IEwxOS41MTAxMTY1LDQxLjc4MjE5NDcgQzE3LjI4MTczMTksNDEuMjkxNjY1OCAxNS4yMDAwOTI4LDQwLjQwNDgxNjkgMTMuMzQzMDg4OSwzOS4xOTk1ODYyIEwxMS42MzM3MzM5LDQwLjkxMDAwOTQgTDEwLjM2NDAxMzMsNDIuMTgwNTIzNSBMMTAuMzY0MDEzMyw0Mi4xODA0MjMgWiBNNDIuMTY4ODU2NywxMC4zNTU3MDM4IEM0NC4wMzczMDMxLDEzLjAwNDgwMDggNDUuMzU3NDExLDE2LjA2NzQ5MjkgNDUuOTYyNjYxMiwxOS4zNzY4NTU2IEw0MS45NDY5MzE2LDE5LjM3Njg1NTYgQzQxLjQ1ODUxNTgsMTcuMTMyODE2NCA0MC41NjkyMDk1LDE1LjAzNjkyMDIgMzkuMzU4MDA2NSwxMy4xNjg0MTA5IEw0MS4wMzM1MzU4LDExLjQ5MTgzNDYgTDQyLjE2ODk1NywxMC4zNTU3MDM4IEw0Mi4xNjg4NTY3LDEwLjM1NTcwMzggWiBNMzYuNDY1MTUxNiw0LjY5OTk1NzgyIEMzMy44MzU1NzU0LDIuODc4NjUzMzYgMzAuODA3MTE2MiwxLjU5NDg4MTc5IDI3LjU0MDA3MDEsMS4wMDg4MzgzNiBMMjcuNTQwMDcwMSw0Ljk4MTE3ODMxIEMyOS43NDg0ODA1LDUuNDU5MTUyNzIgMzEuODEzNzU4Nyw2LjMyNjAxNDkgMzMuNjYwNDI0Miw3LjUwNjQzNzk0IEwzNS4zNTU1MjYyLDUuODEwMjc2NiBMMzYuNDY1MTUxNiw0LjY5OTk1NzgyIEwzNi40NjUxNTE2LDQuNjk5OTU3ODIgWlxcXCIgZmlsbD1cXFwiI0NDQ0NDQ1xcXCI+PC9wYXRoPjwvc3ZnPlwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzdmcgY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhXFxcIiB3aWR0aD1cXFwiNTZcXFwiIGhlaWdodD1cXFwiNTVcXFwiPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS14XFxcIiBkPVxcXCJNMjEuMDMgNS4wNDJsLTIuMTEyLTIuMTU2LTMuNjU3IDMuNjk1LTMuNjU3LTMuNjk1LTIuMTEyIDIuMTU2IDMuNjU5IDMuNjczLTMuNjU5IDMuNjk2IDIuMTEyIDIuMTU3IDMuNjU3LTMuNjk3IDMuNjU3IDMuNjk3IDIuMTEyLTIuMTU3LTMuNjQ4LTMuNjk2IDMuNjQ4LTMuNjczelxcXCIgZmlsbD1cXFwiI0YyNTQyRFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1zXFxcIiBkPVxcXCJNNDEuMjMyIDYuODk2bDIuOTQxLTIuOTc0LTIuMTM0LTIuMTMyLTIuOTIgMi45NzMtLjAwNS0uMDA4LTIuMTM0IDIuMTM1LjAwNS4wMDgtLjAwNS4wMDUgMy43OTIgMy44Mi0yLjkxNSAyLjk0NyAyLjExMiAyLjE1NiA1LjA2LTUuMTExLTMuNzk4LTMuODE2LjAwMS0uMDAxelxcXCIgZmlsbD1cXFwiI0ZDQ0EyMFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1vXFxcIiBkPVxcXCJNNDguMDY2IDI5LjE1OWMtMS41MzYgMC0yLjc2MSAxLjI2My0yLjc2MSAyLjc5IDAgMS41MjQgMS4yMjYgMi43NjUgMi43NjEgMi43NjUgMS41MDkgMCAyLjczNi0xLjI0MiAyLjczNi0yLjc2NSAwLTEuNTI2LTEuMjI3LTIuNzktMi43MzYtMi43OW0wIDguNTkzYy0zLjE3OSAwLTUuNzcxLTIuNTk0LTUuNzcxLTUuODA0IDAtMy4yMTMgMi41OTItNS44MDggNS43NzEtNS44MDggMy4xNTUgMCA1Ljc0NSAyLjU5NCA1Ljc0NSA1LjgwOCAwIDMuMjEtMi41ODkgNS44MDQtNS43NDUgNS44MDRcXFwiIGZpbGw9XFxcIiM4QzNFQTRcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtbFxcXCIgZD1cXFwiTTI0LjM4OSA0Mi4zMjNoMi45OXYxMC40MzdoLTIuOTl2LTEwLjQzN3ptNC4zMzQgMGgyLjk4OXYxMC40MzdoLTIuOTg5di0xMC40Mzd6XFxcIiBmaWxsPVxcXCIjQjVEQzIwXFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLWFcXFwiIGQ9XFxcIk03Ljc5NiAzMS44OThsMS40MDQgMi40NTdoLTIuODM1bDEuNDMxLTIuNDU3aC0uMDAxem0tLjAwMS01Ljc1N2wtNi4zNjMgMTEuMTAyaDEyLjcwM2wtNi4zNDEtMTEuMTAyelxcXCIgZmlsbD1cXFwiIzY2Q0NEQVxcXCI+PC9wYXRoPjwvc3ZnPlwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdzYXNzaWZ5JykoJy54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3h7cG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWluIDAuMTVzO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWluIDAuMTVzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtb3ZlcmxheXtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7Ym90dG9tOjA7cmlnaHQ6MDt6LWluZGV4OjF9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50e3Bvc2l0aW9uOnJlbGF0aXZlO3RvcDowO2xlZnQ6MDt6LWluZGV4OjN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50X19oaWRkZW57dmlzaWJpbGl0eTpoaWRkZW47ei1pbmRleDotMX0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWNvbnRlbnQtaWZyYW1le3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudH0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXJ7cG9zaXRpb246YWJzb2x1dGU7dG9wOjUwJTtsZWZ0OjUwJTtkaXNwbGF5Om5vbmU7ei1pbmRleDoyO3BvaW50ZXItZXZlbnRzOm5vbmV9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYXt3aWR0aDo1NnB4O2hlaWdodDo1NXB4O21hcmdpbi10b3A6LTI4cHg7bWFyZ2luLWxlZnQ6LTI2cHh9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEteCwueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1zLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLW8sLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtbCwueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1hey13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDstd2Via2l0LWFuaW1hdGlvbi1maWxsLW1vZGU6Ym90aDthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5IDFzIGluZmluaXRlIGVhc2UtaW4tb3V0O2FuaW1hdGlvbi1maWxsLW1vZGU6Ym90aH0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS14ey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OjBzO2FuaW1hdGlvbi1kZWxheTowc30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1zey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi4yczthbmltYXRpb24tZGVsYXk6LjJzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLW97LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjRzO2FuaW1hdGlvbi1kZWxheTouNHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtbHstd2Via2l0LWFuaW1hdGlvbi1kZWxheTouNnM7YW5pbWF0aW9uLWRlbGF5Oi42c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1hey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi44czthbmltYXRpb24tZGVsYXk6LjhzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci1yb3VuZHttYXJnaW4tdG9wOi0yM3B4O21hcmdpbi1sZWZ0Oi0yM3B4Oy13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIDNzIGluZmluaXRlIGxpbmVhcjthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gM3MgaW5maW5pdGUgbGluZWFyfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci1jdXN0b217LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gaW5maW5pdGUgbGluZWFyO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiBpbmZpbml0ZSBsaW5lYXJ9QC13ZWJraXQta2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheXswJSw4MCUsMTAwJXtvcGFjaXR5OjB9NDAle29wYWNpdHk6MX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXl7MCUsODAlLDEwMCV7b3BhY2l0eTowfTQwJXtvcGFjaXR5OjF9fUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWlue2Zyb217b3BhY2l0eTowfXRve29wYWNpdHk6MX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtZmFkZWlue2Zyb217b3BhY2l0eTowfXRve29wYWNpdHk6MX19QC13ZWJraXQta2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlue2Zyb217LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDBkZWcpfXRvey13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1Aa2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlue2Zyb217dHJhbnNmb3JtOnJvdGF0ZSgwZGVnKX10b3t0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fSAgLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxld29KSW5abGNuTnBiMjRpT2lBekxBb0pJbVpwYkdVaU9pQWliR2xuYUhSaWIzZ3VjMk56Y3lJc0Nna2ljMjkxY21ObGN5STZJRnNLQ1FraWJHbG5hSFJpYjNndWMyTnpjeUlLQ1Ywc0Nna2ljMjkxY21ObGMwTnZiblJsYm5RaU9pQmJDZ2tKSWlSc2FXZG9kR0p2ZUMxd2NtVm1hWGc2SUNkNGNHRjVjM1JoZEdsdmJpMTNhV1JuWlhRdGJHbG5hSFJpYjNnbk8xeHVKR3hwWjJoMFltOTRMV05zWVhOek9pQW5MaWNnS3lBa2JHbG5hSFJpYjNndGNISmxabWw0TzF4dVhHNGpleVJzYVdkb2RHSnZlQzFqYkdGemMzMGdlMXh1SUNCd2IzTnBkR2x2YmpvZ1ptbDRaV1E3WEc0Z0lIUnZjRG9nTUR0Y2JpQWdiR1ZtZERvZ01EdGNiaUFnWW05MGRHOXRPaUF3TzF4dUlDQnlhV2RvZERvZ01EdGNiaUFnZDJsa2RHZzZJREV3TUNVN1hHNGdJR2hsYVdkb2REb2dNVEF3SlR0Y2JpQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNDZJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0Wm1Ga1pXbHVJQzR4TlhNN1hHNGdJR0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxbVlXUmxhVzRnTGpFMWN6dGNibjFjYmx4dUkzc2tiR2xuYUhSaWIzZ3RZMnhoYzNOOUxXOTJaWEpzWVhrZ2UxeHVJQ0J3YjNOcGRHbHZiam9nWVdKemIyeDFkR1U3WEc0Z0lIUnZjRG93TzF4dUlDQnNaV1owT2lBd08xeHVJQ0JpYjNSMGIyMDZJREE3WEc0Z0lISnBaMmgwT2lBd08xeHVJQ0I2TFdsdVpHVjRPaUF4TzF4dWZWeHVYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzB0WTI5dWRHVnVkQ0I3WEc0Z0lIQnZjMmwwYVc5dU9pQnlaV3hoZEdsMlpUdGNiaUFnZEc5d09pQXdPMXh1SUNCc1pXWjBPaUF3TzF4dUlDQjZMV2x1WkdWNE9pQXpPMXh1ZlZ4dVhHNGpleVJzYVdkb2RHSnZlQzFqYkdGemMzMHRZMjl1ZEdWdWRGOWZhR2xrWkdWdUlIdGNiaUFnZG1semFXSnBiR2wwZVRvZ2FHbGtaR1Z1TzF4dUlDQjZMV2x1WkdWNE9pQXRNVHRjYm4xY2JseHVJM3NrYkdsbmFIUmliM2d0WTJ4aGMzTjlMV052Ym5SbGJuUXRhV1p5WVcxbElIdGNiaUFnZDJsa2RHZzZJREV3TUNVN1hHNGdJR2hsYVdkb2REb2dNVEF3SlR0Y2JpQWdZbTl5WkdWeU9pQXdPMXh1SUNCaVlXTnJaM0p2ZFc1a09pQjBjbUZ1YzNCaGNtVnVkRHRjYm4xY2JseHVJM3NrYkdsbmFIUmliM2d0WTJ4aGMzTjlMWE53YVc1dVpYSWdlMXh1SUNCd2IzTnBkR2x2YmpvZ1lXSnpiMngxZEdVN1hHNGdJSFJ2Y0RvZ05UQWxPMXh1SUNCc1pXWjBPaUExTUNVN1hHNGdJR1JwYzNCc1lYazZJRzV2Ym1VN1hHNGdJSG90YVc1a1pYZzZJREk3WEc0Z0lIQnZhVzUwWlhJdFpYWmxiblJ6T2lCdWIyNWxPMXh1WEc0Z0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVNCN1hHNGdJQ0FnZDJsa2RHZzZJRFUyY0hnN1hHNGdJQ0FnYUdWcFoyaDBPaUExTlhCNE8xeHVJQ0FnSUcxaGNtZHBiam9nZTF4dUlDQWdJQ0FnZEc5d09pQXRNamh3ZUR0Y2JpQWdJQ0FnSUd4bFpuUTZJQzB5Tm5CNE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUM1emNHbHVibVZ5TFhoemIyeHNZUzE0TENBdWMzQnBibTVsY2kxNGMyOXNiR0V0Y3l3Z0xuTndhVzV1WlhJdGVITnZiR3hoTFc4c0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVMxc0xDQXVjM0JwYm01bGNpMTRjMjlzYkdFdFlTQjdYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFpYjNWdVkyVmtaV3hoZVNBeGN5QnBibVpwYm1sMFpTQmxZWE5sTFdsdUxXOTFkRHRjYmlBZ0lDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVMV1pwYkd3dGJXOWtaVG9nWW05MGFEdGNiaUFnSUNBZ0lHRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFpYjNWdVkyVmtaV3hoZVNBeGN5QnBibVpwYm1sMFpTQmxZWE5sTFdsdUxXOTFkRHRjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiaTFtYVd4c0xXMXZaR1U2SUdKdmRHZzdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0xuTndhVzV1WlhJdGVITnZiR3hoTFhnZ2UxeHVJQ0FnSUNBZ0xYZGxZbXRwZEMxaGJtbHRZWFJwYjI0dFpHVnNZWGs2SURCek8xeHVJQ0FnSUNBZ1lXNXBiV0YwYVc5dUxXUmxiR0Y1T2lBd2N6dGNiaUFnSUNCOVhHNWNiaUFnSUNBdWMzQnBibTVsY2kxNGMyOXNiR0V0Y3lCN1hHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTGpKek8xeHVJQ0FnSUNBZ1lXNXBiV0YwYVc5dUxXUmxiR0Y1T2lBdU1uTTdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0xuTndhVzV1WlhJdGVITnZiR3hoTFc4Z2UxeHVJQ0FnSUNBZ0xYZGxZbXRwZEMxaGJtbHRZWFJwYjI0dFpHVnNZWGs2SUM0MGN6dGNiaUFnSUNBZ0lHRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqUnpPMXh1SUNBZ0lIMWNibHh1SUNBZ0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVMxc0lIdGNiaUFnSUNBZ0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dUxXUmxiR0Y1T2lBdU5uTTdYRzRnSUNBZ0lDQmhibWx0WVhScGIyNHRaR1ZzWVhrNklDNDJjenRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXVjM0JwYm01bGNpMTRjMjlzYkdFdFlTQjdYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqaHpPMXh1SUNBZ0lDQWdZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVPSE03WEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnTG5Od2FXNXVaWEl0Y205MWJtUWdlMXh1SUNBZ0lHMWhjbWRwYmpvZ2UxeHVJQ0FnSUNBZ2RHOXdPaUF0TWpOd2VEdGNiaUFnSUNBZ0lHeGxablE2SUMweU0zQjRPMXh1SUNBZ0lIMWNiaUFnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMXpjR2x1SUROeklHbHVabWx1YVhSbElHeHBibVZoY2p0Y2JpQWdJQ0JoYm1sdFlYUnBiMjQ2SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdGMzQnBiaUF6Y3lCcGJtWnBibWwwWlNCc2FXNWxZWEk3WEc0Z0lIMWNibHh1SUNBdWMzQnBibTVsY2kxamRYTjBiMjBnZTF4dUlDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVPaUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFhOd2FXNGdhVzVtYVc1cGRHVWdiR2x1WldGeU8xeHVJQ0FnSUdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMXpjR2x1SUdsdVptbHVhWFJsSUd4cGJtVmhjanRjYmlBZ2ZWeHVmVnh1WEc1QUxYZGxZbXRwZEMxclpYbG1jbUZ0WlhNZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMWliM1Z1WTJWa1pXeGhlU0I3WEc0Z0lEQWxMQ0E0TUNVc0lERXdNQ1VnZXlCdmNHRmphWFI1T2lBd095QjlYRzRnSURRd0pTQjdJRzl3WVdOcGRIazZJREVnZlZ4dWZWeHVYRzVBYTJWNVpuSmhiV1Z6SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdFltOTFibU5sWkdWc1lYa2dlMXh1SUNBd0pTd2dPREFsTENBeE1EQWxJSHNnYjNCaFkybDBlVG9nTURzZ2ZWeHVJQ0EwTUNVZ2V5QnZjR0ZqYVhSNU9pQXhPeUI5WEc1OVhHNWNia0F0ZDJWaWEybDBMV3RsZVdaeVlXMWxjeUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFdaaFpHVnBiaUI3WEc0Z0lHWnliMjBnZXlCdmNHRmphWFI1T2lBd095QjlYRzRnSUhSdklIc2diM0JoWTJsMGVUb2dNVHNnZlZ4dWZWeHVYRzVBYTJWNVpuSmhiV1Z6SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdFptRmtaV2x1SUh0Y2JpQWdabkp2YlNCN0lHOXdZV05wZEhrNklEQTdJSDFjYmlBZ2RHOGdleUJ2Y0dGamFYUjVPaUF4T3lCOVhHNTlYRzVjYmtBdGQyVmlhMmwwTFd0bGVXWnlZVzFsY3lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnZTF4dUlDQm1jbTl0SUhzZ0xYZGxZbXRwZEMxMGNtRnVjMlp2Y20wNklISnZkR0YwWlNnd1pHVm5LVHNnZlZ4dUlDQjBieUI3SUMxM1pXSnJhWFF0ZEhKaGJuTm1iM0p0T2lCeWIzUmhkR1VvTXpZd1pHVm5LVHNnZlZ4dWZWeHVYRzVBYTJWNVpuSmhiV1Z6SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdGMzQnBiaUI3WEc0Z0lHWnliMjBnZXlCMGNtRnVjMlp2Y20wNklISnZkR0YwWlNnd1pHVm5LVHNnZlZ4dUlDQjBieUI3SUhSeVlXNXpabTl5YlRvZ2NtOTBZWFJsS0RNMk1HUmxaeWs3SUgxY2JuMWNiaUlLQ1Ywc0Nna2liV0Z3Y0dsdVozTWlPaUFpUVVGSFFTeEJRVUZCTERSQ1FVRTBRaXhCUVVFMVFpeERRVU5GTEZGQlFWRXNRMEZCUlN4TFFVRk5MRU5CUTJoQ0xFZEJRVWNzUTBGQlJTeERRVUZGTEVOQlExQXNTVUZCU1N4RFFVRkZMRU5CUVVVc1EwRkRVaXhOUVVGTkxFTkJRVVVzUTBGQlJTeERRVU5XTEV0QlFVc3NRMEZCUlN4RFFVRkZMRU5CUTFRc1MwRkJTeXhEUVVGRkxFbEJRVXNzUTBGRFdpeE5RVUZOTEVOQlFVVXNTVUZCU3l4RFFVTmlMR2xDUVVGcFFpeERRVUZGTEd0RFFVRXdRaXhEUVVGUkxFdEJRVWtzUTBGRGVrUXNVMEZCVXl4RFFVRkZMR3REUVVFd1FpeERRVUZSTEV0QlFVa3NRMEZEYkVRc1FVRkZSQ3hCUVVGQkxHOURRVUZ2UXl4QlFVRndReXhEUVVORkxGRkJRVkVzUTBGQlJTeFJRVUZUTEVOQlEyNUNMRWRCUVVjc1EwRkJReXhEUVVGRkxFTkJRMDRzU1VGQlNTeERRVUZGTEVOQlFVVXNRMEZEVWl4TlFVRk5MRU5CUVVVc1EwRkJSU3hEUVVOV0xFdEJRVXNzUTBGQlJTeERRVUZGTEVOQlExUXNUMEZCVHl4RFFVRkZMRU5CUVVVc1EwRkRXaXhCUVVWRUxFRkJRVUVzYjBOQlFXOURMRUZCUVhCRExFTkJRMFVzVVVGQlVTeERRVUZGTEZGQlFWTXNRMEZEYmtJc1IwRkJSeXhEUVVGRkxFTkJRVVVzUTBGRFVDeEpRVUZKTEVOQlFVVXNRMEZCUlN4RFFVTlNMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRMW9zUVVGRlJDeEJRVUZCTERSRFFVRTBReXhCUVVFMVF5eERRVU5GTEZWQlFWVXNRMEZCUlN4TlFVRlBMRU5CUTI1Q0xFOUJRVThzUTBGQlJTeEZRVUZITEVOQlEySXNRVUZGUkN4QlFVRkJMREpEUVVFeVF5eEJRVUV6UXl4RFFVTkZMRXRCUVVzc1EwRkJSU3hKUVVGTExFTkJRMW9zVFVGQlRTeERRVUZGTEVsQlFVc3NRMEZEWWl4TlFVRk5MRU5CUVVVc1EwRkJSU3hEUVVOV0xGVkJRVlVzUTBGQlJTeFhRVUZaTEVOQlEzcENMRUZCUlVRc1FVRkJRU3h2UTBGQmIwTXNRVUZCY0VNc1EwRkRSU3hSUVVGUkxFTkJRVVVzVVVGQlV5eERRVU51UWl4SFFVRkhMRU5CUVVVc1IwRkJTU3hEUVVOVUxFbEJRVWtzUTBGQlJTeEhRVUZKTEVOQlExWXNUMEZCVHl4RFFVRkZMRWxCUVVzc1EwRkRaQ3hQUVVGUExFTkJRVVVzUTBGQlJTeERRVU5ZTEdOQlFXTXNRMEZCUlN4SlFVRkxMRU5CZDBSMFFpeEJRVGxFUkN4QlFWRkZMRzlEUVZKclF5eERRVkZzUXl4bFFVRmxMRUZCUVVNc1EwRkRaQ3hMUVVGTExFTkJRVVVzU1VGQlN5eERRVU5hTEUxQlFVMHNRMEZCUlN4SlFVRkxMRU5CUTJJc1RVRkJUU3hCUVVGRExFTkJRVU1zUVVGRFRpeEhRVUZITEVOQlFVVXNTMEZCVFN4RFFVUmlMRTFCUVUwc1FVRkJReXhEUVVGRExFRkJSVTRzU1VGQlNTeERRVUZGTEV0QlFVMHNRMEZyUTJZc1FVRXZRMGdzUVVGblFra3NiME5CYUVKblF5eERRVkZzUXl4bFFVRmxMRU5CVVdJc2FVSkJRV2xDTEVOQmFFSnlRaXhCUVdkQ2RVSXNiME5CYUVKaExFTkJVV3hETEdWQlFXVXNRMEZSVFN4cFFrRkJhVUlzUTBGb1FuaERMRUZCWjBJd1F5eHZRMEZvUWs0c1EwRlJiRU1zWlVGQlpTeERRVkY1UWl4cFFrRkJhVUlzUTBGb1FqTkVMRUZCWjBJMlJDeHZRMEZvUW5wQ0xFTkJVV3hETEdWQlFXVXNRMEZSTkVNc2FVSkJRV2xDTEVOQmFFSTVSU3hCUVdkQ1owWXNiME5CYUVJMVF5eERRVkZzUXl4bFFVRmxMRU5CVVN0RUxHbENRVUZwUWl4QlFVRkRMRU5CUXpWR0xHbENRVUZwUWl4RFFVRkZMSFZEUVVFclFpeERRVUZoTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVOMFJpd3lRa0ZCTWtJc1EwRkJSU3hKUVVGTExFTkJRMnhETEZOQlFWTXNRMEZCUlN4MVEwRkJLMElzUTBGQllTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRmRCUVZjc1EwRkRPVVVzYlVKQlFXMUNMRU5CUVVVc1NVRkJTeXhEUVVNelFpeEJRWEpDVEN4QlFYVkNTU3h2UTBGMlFtZERMRU5CVVd4RExHVkJRV1VzUTBGbFlpeHBRa0ZCYVVJc1FVRkJReXhEUVVOb1FpeDFRa0ZCZFVJc1EwRkJSU3hGUVVGSExFTkJRelZDTEdWQlFXVXNRMEZCUlN4RlFVRkhMRU5CUTNKQ0xFRkJNVUpNTEVGQk5FSkpMRzlEUVRWQ1owTXNRMEZSYkVNc1pVRkJaU3hEUVc5Q1lpeHBRa0ZCYVVJc1FVRkJReXhEUVVOb1FpeDFRa0ZCZFVJc1EwRkJSU3hIUVVGSkxFTkJRemRDTEdWQlFXVXNRMEZCUlN4SFFVRkpMRU5CUTNSQ0xFRkJMMEpNTEVGQmFVTkpMRzlEUVdwRFowTXNRMEZSYkVNc1pVRkJaU3hEUVhsQ1lpeHBRa0ZCYVVJc1FVRkJReXhEUVVOb1FpeDFRa0ZCZFVJc1EwRkJSU3hIUVVGSkxFTkJRemRDTEdWQlFXVXNRMEZCUlN4SFFVRkpMRU5CUTNSQ0xFRkJjRU5NTEVGQmMwTkpMRzlEUVhSRFowTXNRMEZSYkVNc1pVRkJaU3hEUVRoQ1lpeHBRa0ZCYVVJc1FVRkJReXhEUVVOb1FpeDFRa0ZCZFVJc1EwRkJSU3hIUVVGSkxFTkJRemRDTEdWQlFXVXNRMEZCUlN4SFFVRkpMRU5CUTNSQ0xFRkJla05NTEVGQk1rTkpMRzlEUVRORFowTXNRMEZSYkVNc1pVRkJaU3hEUVcxRFlpeHBRa0ZCYVVJc1FVRkJReXhEUVVOb1FpeDFRa0ZCZFVJc1EwRkJSU3hIUVVGSkxFTkJRemRDTEdWQlFXVXNRMEZCUlN4SFFVRkpMRU5CUTNSQ0xFRkJPVU5NTEVGQmFVUkZMRzlEUVdwRWEwTXNRMEZwUkd4RExHTkJRV01zUVVGQlF5eERRVU5pTEUxQlFVMHNRVUZCUXl4RFFVRkRMRUZCUTA0c1IwRkJSeXhEUVVGRkxFdEJRVTBzUTBGRVlpeE5RVUZOTEVGQlFVTXNRMEZCUXl4QlFVVk9MRWxCUVVrc1EwRkJSU3hMUVVGTkxFTkJSV1FzYVVKQlFXbENMRU5CUVVVc1owTkJRWGRDTEVOQlFVMHNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRMjVGTEZOQlFWTXNRMEZCUlN4blEwRkJkMElzUTBGQlRTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkROVVFzUVVGNFJFZ3NRVUV3UkVVc2IwTkJNVVJyUXl4RFFUQkViRU1zWlVGQlpTeEJRVUZETEVOQlEyUXNhVUpCUVdsQ0xFTkJRVVVzWjBOQlFYZENMRU5CUVUwc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGRGFFVXNVMEZCVXl4RFFVRkZMR2REUVVGM1FpeERRVUZOTEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUTNwRUxFRkJSMGdzYTBKQlFXdENMRU5CUVd4Q0xIVkRRVUZyUWl4RFFVTm9RaXhCUVVGQkxFVkJRVVVzUTBGQlJTeEJRVUZCTEVkQlFVY3NRMEZCUlN4QlFVRkJMRWxCUVVrc1EwRkJSeXhQUVVGUExFTkJRVVVzUTBGQlJTeERRVU16UWl4QlFVRkJMRWRCUVVjc1EwRkJSeXhQUVVGUExFTkJRVVVzUTBGQlJ5eEZRVWR3UWl4VlFVRlZMRU5CUVZZc2RVTkJRVlVzUTBGRFVpeEJRVUZCTEVWQlFVVXNRMEZCUlN4QlFVRkJMRWRCUVVjc1EwRkJSU3hCUVVGQkxFbEJRVWtzUTBGQlJ5eFBRVUZQTEVOQlFVVXNRMEZCUlN4RFFVTXpRaXhCUVVGQkxFZEJRVWNzUTBGQlJ5eFBRVUZQTEVOQlFVVXNRMEZCUlN4RlFVZHVRaXhyUWtGQmEwSXNRMEZCYkVJc2EwTkJRV3RDTEVOQlEyaENMRUZCUVVFc1NVRkJTU3hEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVOQlEyeENMRUZCUVVFc1JVRkJSU3hEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVWQlIyeENMRlZCUVZVc1EwRkJWaXhyUTBGQlZTeERRVU5TTEVGQlFVRXNTVUZCU1N4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRMnhDTEVGQlFVRXNSVUZCUlN4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFVkJSMnhDTEd0Q1FVRnJRaXhEUVVGc1FpeG5RMEZCYTBJc1EwRkRhRUlzUVVGQlFTeEpRVUZKTEVOQlFVY3NhVUpCUVdsQ0xFTkJRVVVzV1VGQlRTeERRVU5vUXl4QlFVRkJMRVZCUVVVc1EwRkJSeXhwUWtGQmFVSXNRMEZCUlN4alFVRk5MRVZCUjJoRExGVkJRVlVzUTBGQlZpeG5RMEZCVlN4RFFVTlNMRUZCUVVFc1NVRkJTU3hEUVVGSExGTkJRVk1zUTBGQlJTeFpRVUZOTEVOQlEzaENMRUZCUVVFc1JVRkJSU3hEUVVGSExGTkJRVk1zUTBGQlJTeGpRVUZOSWl3S0NTSnVZVzFsY3lJNklGdGRDbjA9ICovJyk7OyIsIm1vZHVsZS5leHBvcnRzID0gJzEuMC42JztcbiIsIi8qIVxuICogQm93c2VyIC0gYSBicm93c2VyIGRldGVjdG9yXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZGVkL2Jvd3NlclxuICogTUlUIExpY2Vuc2UgfCAoYykgRHVzdGluIERpYXogMjAxNVxuICovXG5cbiFmdW5jdGlvbiAocm9vdCwgbmFtZSwgZGVmaW5pdGlvbikge1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShuYW1lLCBkZWZpbml0aW9uKVxuICBlbHNlIHJvb3RbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0odGhpcywgJ2Jvd3NlcicsIGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAgKiBTZWUgdXNlcmFnZW50cy5qcyBmb3IgZXhhbXBsZXMgb2YgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICovXG5cbiAgdmFyIHQgPSB0cnVlXG5cbiAgZnVuY3Rpb24gZGV0ZWN0KHVhKSB7XG5cbiAgICBmdW5jdGlvbiBnZXRGaXJzdE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMV0pIHx8ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNlY29uZE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMl0pIHx8ICcnO1xuICAgIH1cblxuICAgIHZhciBpb3NkZXZpY2UgPSBnZXRGaXJzdE1hdGNoKC8oaXBvZHxpcGhvbmV8aXBhZCkvaSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBsaWtlQW5kcm9pZCA9IC9saWtlIGFuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBhbmRyb2lkID0gIWxpa2VBbmRyb2lkICYmIC9hbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgbmV4dXNNb2JpbGUgPSAvbmV4dXNcXHMqWzAtNl1cXHMqL2kudGVzdCh1YSlcbiAgICAgICwgbmV4dXNUYWJsZXQgPSAhbmV4dXNNb2JpbGUgJiYgL25leHVzXFxzKlswLTldKy9pLnRlc3QodWEpXG4gICAgICAsIGNocm9tZW9zID0gL0NyT1MvLnRlc3QodWEpXG4gICAgICAsIHNpbGsgPSAvc2lsay9pLnRlc3QodWEpXG4gICAgICAsIHNhaWxmaXNoID0gL3NhaWxmaXNoL2kudGVzdCh1YSlcbiAgICAgICwgdGl6ZW4gPSAvdGl6ZW4vaS50ZXN0KHVhKVxuICAgICAgLCB3ZWJvcyA9IC8od2VifGhwdykob3wwKXMvaS50ZXN0KHVhKVxuICAgICAgLCB3aW5kb3dzcGhvbmUgPSAvd2luZG93cyBwaG9uZS9pLnRlc3QodWEpXG4gICAgICAsIHNhbXN1bmdCcm93c2VyID0gL1NhbXN1bmdCcm93c2VyL2kudGVzdCh1YSlcbiAgICAgICwgd2luZG93cyA9ICF3aW5kb3dzcGhvbmUgJiYgL3dpbmRvd3MvaS50ZXN0KHVhKVxuICAgICAgLCBtYWMgPSAhaW9zZGV2aWNlICYmICFzaWxrICYmIC9tYWNpbnRvc2gvaS50ZXN0KHVhKVxuICAgICAgLCBsaW51eCA9ICFhbmRyb2lkICYmICFzYWlsZmlzaCAmJiAhdGl6ZW4gJiYgIXdlYm9zICYmIC9saW51eC9pLnRlc3QodWEpXG4gICAgICAsIGVkZ2VWZXJzaW9uID0gZ2V0U2Vjb25kTWF0Y2goL2VkZyhbZWFdfGlvcylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICAsIHZlcnNpb25JZGVudGlmaWVyID0gZ2V0Rmlyc3RNYXRjaCgvdmVyc2lvblxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgICwgdGFibGV0ID0gL3RhYmxldC9pLnRlc3QodWEpICYmICEvdGFibGV0IHBjL2kudGVzdCh1YSlcbiAgICAgICwgbW9iaWxlID0gIXRhYmxldCAmJiAvW14tXW1vYmkvaS50ZXN0KHVhKVxuICAgICAgLCB4Ym94ID0gL3hib3gvaS50ZXN0KHVhKVxuICAgICAgLCByZXN1bHRcblxuICAgIGlmICgvb3BlcmEvaS50ZXN0KHVhKSkge1xuICAgICAgLy8gIGFuIG9sZCBPcGVyYVxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEnXG4gICAgICAsIG9wZXJhOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/Om9wZXJhfG9wcnxvcGlvcylbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9vcHJcXC98b3Bpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgLy8gYSBuZXcgT3BlcmFcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhJ1xuICAgICAgICAsIG9wZXJhOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86b3ByfG9waW9zKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvU2Ftc3VuZ0Jyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2Ftc3VuZyBJbnRlcm5ldCBmb3IgQW5kcm9pZCdcbiAgICAgICAgLCBzYW1zdW5nQnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OlNhbXN1bmdCcm93c2VyKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvV2hhbGUvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTkFWRVIgV2hhbGUgYnJvd3NlcidcbiAgICAgICAgLCB3aGFsZTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OndoYWxlKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9NWkJyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTVogQnJvd3NlcidcbiAgICAgICAgLCBtemJyb3dzZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpNWkJyb3dzZXIpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2NvYXN0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhIENvYXN0J1xuICAgICAgICAsIGNvYXN0OiB0XG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86Y29hc3QpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9mb2N1cy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdGb2N1cydcbiAgICAgICAgLCBmb2N1czogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmZvY3VzKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC95YWJyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnWWFuZGV4IEJyb3dzZXInXG4gICAgICAsIHlhbmRleGJyb3dzZXI6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86eWFicm93c2VyKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvdWNicm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICBuYW1lOiAnVUMgQnJvd3NlcidcbiAgICAgICAgLCB1Y2Jyb3dzZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp1Y2Jyb3dzZXIpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL214aW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ01heHRob24nXG4gICAgICAgICwgbWF4dGhvbjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om14aW9zKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9lcGlwaGFueS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdFcGlwaGFueSdcbiAgICAgICAgLCBlcGlwaGFueTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmVwaXBoYW55KVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9wdWZmaW4vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUHVmZmluJ1xuICAgICAgICAsIHB1ZmZpbjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnB1ZmZpbilbXFxzXFwvXShcXGQrKD86XFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2xlaXBuaXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2xlaXBuaXInXG4gICAgICAgICwgc2xlaXBuaXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpzbGVpcG5pcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvay1tZWxlb24vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnSy1NZWxlb24nXG4gICAgICAgICwga01lbGVvbjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmstbWVsZW9uKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHdpbmRvd3NwaG9uZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2luZG93cyBQaG9uZSdcbiAgICAgICwgb3NuYW1lOiAnV2luZG93cyBQaG9uZSdcbiAgICAgICwgd2luZG93c3Bob25lOiB0XG4gICAgICB9XG4gICAgICBpZiAoZWRnZVZlcnNpb24pIHtcbiAgICAgICAgcmVzdWx0Lm1zZWRnZSA9IHRcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdC5tc2llID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2llbW9iaWxlXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXNpZXx0cmlkZW50L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ludGVybmV0IEV4cGxvcmVyJ1xuICAgICAgLCBtc2llOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om1zaWUgfHJ2OikoXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaHJvbWVvcykge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21lJ1xuICAgICAgLCBvc25hbWU6ICdDaHJvbWUgT1MnXG4gICAgICAsIGNocm9tZW9zOiB0XG4gICAgICAsIGNocm9tZUJvb2s6IHRcbiAgICAgICwgY2hyb21lOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9tZXxjcmlvc3xjcm1vKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9lZGcoW2VhXXxpb3MpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ01pY3Jvc29mdCBFZGdlJ1xuICAgICAgLCBtc2VkZ2U6IHRcbiAgICAgICwgdmVyc2lvbjogZWRnZVZlcnNpb25cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3ZpdmFsZGkvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnVml2YWxkaSdcbiAgICAgICAgLCB2aXZhbGRpOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvdml2YWxkaVxcLyhcXGQrKFxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2FpbGZpc2gpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhaWxmaXNoJ1xuICAgICAgLCBvc25hbWU6ICdTYWlsZmlzaCBPUydcbiAgICAgICwgc2FpbGZpc2g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2FpbGZpc2hcXHM/YnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NlYW1vbmtleVxcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTZWFNb25rZXknXG4gICAgICAsIHNlYW1vbmtleTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zZWFtb25rZXlcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9maXJlZm94fGljZXdlYXNlbHxmeGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdGaXJlZm94J1xuICAgICAgLCBmaXJlZm94OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmZpcmVmb3h8aWNld2Vhc2VsfGZ4aW9zKVsgXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICAgIGlmICgvXFwoKG1vYmlsZXx0YWJsZXQpO1teXFwpXSpydjpbXFxkXFwuXStcXCkvaS50ZXN0KHVhKSkge1xuICAgICAgICByZXN1bHQuZmlyZWZveG9zID0gdFxuICAgICAgICByZXN1bHQub3NuYW1lID0gJ0ZpcmVmb3ggT1MnXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNpbGspIHtcbiAgICAgIHJlc3VsdCA9ICB7XG4gICAgICAgIG5hbWU6ICdBbWF6b24gU2lsaydcbiAgICAgICwgc2lsazogdFxuICAgICAgLCB2ZXJzaW9uIDogZ2V0Rmlyc3RNYXRjaCgvc2lsa1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3BoYW50b20vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUGhhbnRvbUpTJ1xuICAgICAgLCBwaGFudG9tOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3BoYW50b21qc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NsaW1lcmpzL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NsaW1lckpTJ1xuICAgICAgICAsIHNsaW1lcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NsaW1lcmpzXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvYmxhY2tiZXJyeXxcXGJiYlxcZCsvaS50ZXN0KHVhKSB8fCAvcmltXFxzdGFibGV0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JsYWNrQmVycnknXG4gICAgICAsIG9zbmFtZTogJ0JsYWNrQmVycnkgT1MnXG4gICAgICAsIGJsYWNrYmVycnk6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvYmxhY2tiZXJyeVtcXGRdK1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAod2Vib3MpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1dlYk9TJ1xuICAgICAgLCBvc25hbWU6ICdXZWJPUydcbiAgICAgICwgd2Vib3M6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvdyg/OmViKT9vc2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgICAgL3RvdWNocGFkXFwvL2kudGVzdCh1YSkgJiYgKHJlc3VsdC50b3VjaHBhZCA9IHQpXG4gICAgfVxuICAgIGVsc2UgaWYgKC9iYWRhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JhZGEnXG4gICAgICAsIG9zbmFtZTogJ0JhZGEnXG4gICAgICAsIGJhZGE6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZG9sZmluXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGl6ZW4pIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1RpemVuJ1xuICAgICAgLCBvc25hbWU6ICdUaXplbidcbiAgICAgICwgdGl6ZW46IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86dGl6ZW5cXHM/KT9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoL3F1cHppbGxhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1F1cFppbGxhJ1xuICAgICAgICAsIHF1cHppbGxhOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86cXVwemlsbGEpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2Nocm9taXVtL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0Nocm9taXVtJ1xuICAgICAgICAsIGNocm9taXVtOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21pdW0pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2Nocm9tZXxjcmlvc3xjcm1vL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0Nocm9tZSdcbiAgICAgICAgLCBjaHJvbWU6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGFuZHJvaWQpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0FuZHJvaWQnXG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NhZmFyaXxhcHBsZXdlYmtpdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYWZhcmknXG4gICAgICAsIHNhZmFyaTogdFxuICAgICAgfVxuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaW9zZGV2aWNlKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWUgOiBpb3NkZXZpY2UgPT0gJ2lwaG9uZScgPyAnaVBob25lJyA6IGlvc2RldmljZSA9PSAnaXBhZCcgPyAnaVBhZCcgOiAnaVBvZCdcbiAgICAgIH1cbiAgICAgIC8vIFdURjogdmVyc2lvbiBpcyBub3QgcGFydCBvZiB1c2VyIGFnZW50IGluIHdlYiBhcHBzXG4gICAgICBpZiAodmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmKC9nb29nbGVib3QvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnR29vZ2xlYm90J1xuICAgICAgLCBnb29nbGVib3Q6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZ29vZ2xlYm90XFwvKFxcZCsoXFwuXFxkKykpL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiBnZXRGaXJzdE1hdGNoKC9eKC4qKVxcLyguKikgLyksXG4gICAgICAgIHZlcnNpb246IGdldFNlY29uZE1hdGNoKC9eKC4qKVxcLyguKikgLylcbiAgICAgfTtcbiAgIH1cblxuICAgIC8vIHNldCB3ZWJraXQgb3IgZ2Vja28gZmxhZyBmb3IgYnJvd3NlcnMgYmFzZWQgb24gdGhlc2UgZW5naW5lc1xuICAgIGlmICghcmVzdWx0Lm1zZWRnZSAmJiAvKGFwcGxlKT93ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgaWYgKC8oYXBwbGUpP3dlYmtpdFxcLzUzN1xcLjM2L2kudGVzdCh1YSkpIHtcbiAgICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIkJsaW5rXCJcbiAgICAgICAgcmVzdWx0LmJsaW5rID0gdFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIldlYmtpdFwiXG4gICAgICAgIHJlc3VsdC53ZWJraXQgPSB0XG4gICAgICB9XG4gICAgICBpZiAoIXJlc3VsdC52ZXJzaW9uICYmIHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQub3BlcmEgJiYgL2dlY2tvXFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdC5uYW1lID0gcmVzdWx0Lm5hbWUgfHwgXCJHZWNrb1wiXG4gICAgICByZXN1bHQuZ2Vja28gPSB0XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHJlc3VsdC52ZXJzaW9uIHx8IGdldEZpcnN0TWF0Y2goL2dlY2tvXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgIH1cblxuICAgIC8vIHNldCBPUyBmbGFncyBmb3IgcGxhdGZvcm1zIHRoYXQgaGF2ZSBtdWx0aXBsZSBicm93c2Vyc1xuICAgIGlmICghcmVzdWx0LndpbmRvd3NwaG9uZSAmJiAoYW5kcm9pZCB8fCByZXN1bHQuc2lsaykpIHtcbiAgICAgIHJlc3VsdC5hbmRyb2lkID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdBbmRyb2lkJ1xuICAgIH0gZWxzZSBpZiAoIXJlc3VsdC53aW5kb3dzcGhvbmUgJiYgaW9zZGV2aWNlKSB7XG4gICAgICByZXN1bHRbaW9zZGV2aWNlXSA9IHRcbiAgICAgIHJlc3VsdC5pb3MgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ2lPUydcbiAgICB9IGVsc2UgaWYgKG1hYykge1xuICAgICAgcmVzdWx0Lm1hYyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnbWFjT1MnXG4gICAgfSBlbHNlIGlmICh4Ym94KSB7XG4gICAgICByZXN1bHQueGJveCA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnWGJveCdcbiAgICB9IGVsc2UgaWYgKHdpbmRvd3MpIHtcbiAgICAgIHJlc3VsdC53aW5kb3dzID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdXaW5kb3dzJ1xuICAgIH0gZWxzZSBpZiAobGludXgpIHtcbiAgICAgIHJlc3VsdC5saW51eCA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnTGludXgnXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0V2luZG93c1ZlcnNpb24gKHMpIHtcbiAgICAgIHN3aXRjaCAocykge1xuICAgICAgICBjYXNlICdOVCc6IHJldHVybiAnTlQnXG4gICAgICAgIGNhc2UgJ1hQJzogcmV0dXJuICdYUCdcbiAgICAgICAgY2FzZSAnTlQgNS4wJzogcmV0dXJuICcyMDAwJ1xuICAgICAgICBjYXNlICdOVCA1LjEnOiByZXR1cm4gJ1hQJ1xuICAgICAgICBjYXNlICdOVCA1LjInOiByZXR1cm4gJzIwMDMnXG4gICAgICAgIGNhc2UgJ05UIDYuMCc6IHJldHVybiAnVmlzdGEnXG4gICAgICAgIGNhc2UgJ05UIDYuMSc6IHJldHVybiAnNydcbiAgICAgICAgY2FzZSAnTlQgNi4yJzogcmV0dXJuICc4J1xuICAgICAgICBjYXNlICdOVCA2LjMnOiByZXR1cm4gJzguMSdcbiAgICAgICAgY2FzZSAnTlQgMTAuMCc6IHJldHVybiAnMTAnXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPUyB2ZXJzaW9uIGV4dHJhY3Rpb25cbiAgICB2YXIgb3NWZXJzaW9uID0gJyc7XG4gICAgaWYgKHJlc3VsdC53aW5kb3dzKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRXaW5kb3dzVmVyc2lvbihnZXRGaXJzdE1hdGNoKC9XaW5kb3dzICgoTlR8WFApKCBcXGRcXGQ/LlxcZCk/KS9pKSlcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC53aW5kb3dzcGhvbmUpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3dpbmRvd3MgcGhvbmUgKD86b3MpP1xccz8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0Lm1hYykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvTWFjIE9TIFggKFxcZCsoW19cXC5cXHNdXFxkKykqKS9pKTtcbiAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9bX1xcc10vZywgJy4nKTtcbiAgICB9IGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvb3MgKFxcZCsoW19cXHNdXFxkKykqKSBsaWtlIG1hYyBvcyB4L2kpO1xuICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL1tfXFxzXS9nLCAnLicpO1xuICAgIH0gZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvYW5kcm9pZFsgXFwvLV0oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LndlYm9zKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC8oPzp3ZWJ8aHB3KW9zXFwvKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5ibGFja2JlcnJ5KSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9yaW1cXHN0YWJsZXRcXHNvc1xccyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuYmFkYSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvYmFkYVxcLyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQudGl6ZW4pIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3RpemVuW1xcL1xcc10oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH1cbiAgICBpZiAob3NWZXJzaW9uKSB7XG4gICAgICByZXN1bHQub3N2ZXJzaW9uID0gb3NWZXJzaW9uO1xuICAgIH1cblxuICAgIC8vIGRldmljZSB0eXBlIGV4dHJhY3Rpb25cbiAgICB2YXIgb3NNYWpvclZlcnNpb24gPSAhcmVzdWx0LndpbmRvd3MgJiYgb3NWZXJzaW9uLnNwbGl0KCcuJylbMF07XG4gICAgaWYgKFxuICAgICAgICAgdGFibGV0XG4gICAgICB8fCBuZXh1c1RhYmxldFxuICAgICAgfHwgaW9zZGV2aWNlID09ICdpcGFkJ1xuICAgICAgfHwgKGFuZHJvaWQgJiYgKG9zTWFqb3JWZXJzaW9uID09IDMgfHwgKG9zTWFqb3JWZXJzaW9uID49IDQgJiYgIW1vYmlsZSkpKVxuICAgICAgfHwgcmVzdWx0LnNpbGtcbiAgICApIHtcbiAgICAgIHJlc3VsdC50YWJsZXQgPSB0XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgIG1vYmlsZVxuICAgICAgfHwgaW9zZGV2aWNlID09ICdpcGhvbmUnXG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwb2QnXG4gICAgICB8fCBhbmRyb2lkXG4gICAgICB8fCBuZXh1c01vYmlsZVxuICAgICAgfHwgcmVzdWx0LmJsYWNrYmVycnlcbiAgICAgIHx8IHJlc3VsdC53ZWJvc1xuICAgICAgfHwgcmVzdWx0LmJhZGFcbiAgICApIHtcbiAgICAgIHJlc3VsdC5tb2JpbGUgPSB0XG4gICAgfVxuXG4gICAgLy8gR3JhZGVkIEJyb3dzZXIgU3VwcG9ydFxuICAgIC8vIGh0dHA6Ly9kZXZlbG9wZXIueWFob28uY29tL3l1aS9hcnRpY2xlcy9nYnNcbiAgICBpZiAocmVzdWx0Lm1zZWRnZSB8fFxuICAgICAgICAocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTApIHx8XG4gICAgICAgIChyZXN1bHQueWFuZGV4YnJvd3NlciAmJiByZXN1bHQudmVyc2lvbiA+PSAxNSkgfHxcblx0XHQgICAgKHJlc3VsdC52aXZhbGRpICYmIHJlc3VsdC52ZXJzaW9uID49IDEuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMjApIHx8XG4gICAgICAgIChyZXN1bHQuc2Ftc3VuZ0Jyb3dzZXIgJiYgcmVzdWx0LnZlcnNpb24gPj0gNCkgfHxcbiAgICAgICAgKHJlc3VsdC53aGFsZSAmJiBjb21wYXJlVmVyc2lvbnMoW3Jlc3VsdC52ZXJzaW9uLCAnMS4wJ10pID09PSAxKSB8fFxuICAgICAgICAocmVzdWx0Lm16YnJvd3NlciAmJiBjb21wYXJlVmVyc2lvbnMoW3Jlc3VsdC52ZXJzaW9uLCAnNi4wJ10pID09PSAxKSB8fFxuICAgICAgICAocmVzdWx0LmZvY3VzICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICcxLjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA+PSAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5ibGFja2JlcnJ5ICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjEpXG4gICAgICAgIHx8IChyZXN1bHQuY2hyb21pdW0gJiYgcmVzdWx0LnZlcnNpb24gPj0gMjApXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmEgPSB0O1xuICAgIH1cbiAgICBlbHNlIGlmICgocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPCAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPCAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uIDwgMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPCA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uIDwgMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA8IDYpXG4gICAgICAgIHx8IChyZXN1bHQuY2hyb21pdW0gJiYgcmVzdWx0LnZlcnNpb24gPCAyMClcbiAgICAgICAgKSB7XG4gICAgICByZXN1bHQuYyA9IHRcbiAgICB9IGVsc2UgcmVzdWx0LnggPSB0XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICB2YXIgYm93c2VyID0gZGV0ZWN0KHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJyA6ICcnKVxuXG4gIGJvd3Nlci50ZXN0ID0gZnVuY3Rpb24gKGJyb3dzZXJMaXN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBicm93c2VyTGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGJyb3dzZXJJdGVtID0gYnJvd3Nlckxpc3RbaV07XG4gICAgICBpZiAodHlwZW9mIGJyb3dzZXJJdGVtPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChicm93c2VySXRlbSBpbiBib3dzZXIpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHZlcnNpb24gcHJlY2lzaW9ucyBjb3VudFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgIGdldFZlcnNpb25QcmVjaXNpb24oXCIxLjEwLjNcIikgLy8gM1xuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHZlcnNpb25cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIHZlcnNpb24uc3BsaXQoXCIuXCIpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcnJheTo6bWFwIHBvbHlmaWxsXG4gICAqXG4gICAqIEBwYXJhbSAge0FycmF5fSBhcnJcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZnVuY3Rpb24gbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICB2YXIgcmVzdWx0ID0gW10sIGk7XG4gICAgaWYgKEFycmF5LnByb3RvdHlwZS5tYXApIHtcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyLCBpdGVyYXRvcik7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdC5wdXNoKGl0ZXJhdG9yKGFycltpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSBicm93c2VyIHZlcnNpb24gd2VpZ2h0XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4xMC4yLjEnLCAgJzEuOC4yLjEuOTAnXSkgICAgLy8gMVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMDEwLjIuMScsICcxLjA5LjIuMS45MCddKTsgIC8vIDFcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS4xMC4yLjEnXSk7ICAgICAvLyAwXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4xMC4yLjEnLCAgJzEuMDgwMC4yJ10pOyAgICAgLy8gLTFcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXk8U3RyaW5nPn0gdmVyc2lvbnMgdmVyc2lvbnMgdG8gY29tcGFyZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGNvbXBhcmlzb24gcmVzdWx0XG4gICAqL1xuICBmdW5jdGlvbiBjb21wYXJlVmVyc2lvbnModmVyc2lvbnMpIHtcbiAgICAvLyAxKSBnZXQgY29tbW9uIHByZWNpc2lvbiBmb3IgYm90aCB2ZXJzaW9ucywgZm9yIGV4YW1wbGUgZm9yIFwiMTAuMFwiIGFuZCBcIjlcIiBpdCBzaG91bGQgYmUgMlxuICAgIHZhciBwcmVjaXNpb24gPSBNYXRoLm1heChnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb25zWzBdKSwgZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uc1sxXSkpO1xuICAgIHZhciBjaHVua3MgPSBtYXAodmVyc2lvbnMsIGZ1bmN0aW9uICh2ZXJzaW9uKSB7XG4gICAgICB2YXIgZGVsdGEgPSBwcmVjaXNpb24gLSBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb24pO1xuXG4gICAgICAvLyAyKSBcIjlcIiAtPiBcIjkuMFwiIChmb3IgcHJlY2lzaW9uID0gMilcbiAgICAgIHZlcnNpb24gPSB2ZXJzaW9uICsgbmV3IEFycmF5KGRlbHRhICsgMSkuam9pbihcIi4wXCIpO1xuXG4gICAgICAvLyAzKSBcIjkuMFwiIC0+IFtcIjAwMDAwMDAwMFwiXCIsIFwiMDAwMDAwMDA5XCJdXG4gICAgICByZXR1cm4gbWFwKHZlcnNpb24uc3BsaXQoXCIuXCIpLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBcnJheSgyMCAtIGNodW5rLmxlbmd0aCkuam9pbihcIjBcIikgKyBjaHVuaztcbiAgICAgIH0pLnJldmVyc2UoKTtcbiAgICB9KTtcblxuICAgIC8vIGl0ZXJhdGUgaW4gcmV2ZXJzZSBvcmRlciBieSByZXZlcnNlZCBjaHVua3MgYXJyYXlcbiAgICB3aGlsZSAoLS1wcmVjaXNpb24gPj0gMCkge1xuICAgICAgLy8gNCkgY29tcGFyZTogXCIwMDAwMDAwMDlcIiA+IFwiMDAwMDAwMDEwXCIgPSBmYWxzZSAoYnV0IFwiOVwiID4gXCIxMFwiID0gdHJ1ZSlcbiAgICAgIGlmIChjaHVua3NbMF1bcHJlY2lzaW9uXSA+IGNodW5rc1sxXVtwcmVjaXNpb25dKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoY2h1bmtzWzBdW3ByZWNpc2lvbl0gPT09IGNodW5rc1sxXVtwcmVjaXNpb25dKSB7XG4gICAgICAgIGlmIChwcmVjaXNpb24gPT09IDApIHtcbiAgICAgICAgICAvLyBhbGwgdmVyc2lvbiBjaHVua3MgYXJlIHNhbWVcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYnJvd3NlciBpcyB1bnN1cHBvcnRlZFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgIGJvd3Nlci5pc1Vuc3VwcG9ydGVkQnJvd3Nlcih7XG4gICAqICAgICBtc2llOiBcIjEwXCIsXG4gICAqICAgICBmaXJlZm94OiBcIjIzXCIsXG4gICAqICAgICBjaHJvbWU6IFwiMjlcIixcbiAgICogICAgIHNhZmFyaTogXCI1LjFcIixcbiAgICogICAgIG9wZXJhOiBcIjE2XCIsXG4gICAqICAgICBwaGFudG9tOiBcIjUzNFwiXG4gICAqICAgfSk7XG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gIG1pblZlcnNpb25zIG1hcCBvZiBtaW5pbWFsIHZlcnNpb24gdG8gYnJvd3NlclxuICAgKiBAcGFyYW0gIHtCb29sZWFufSBbc3RyaWN0TW9kZSA9IGZhbHNlXSBmbGFnIHRvIHJldHVybiBmYWxzZSBpZiBicm93c2VyIHdhc24ndCBmb3VuZCBpbiBtYXBcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgW3VhXSB1c2VyIGFnZW50IHN0cmluZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNVbnN1cHBvcnRlZEJyb3dzZXIobWluVmVyc2lvbnMsIHN0cmljdE1vZGUsIHVhKSB7XG4gICAgdmFyIF9ib3dzZXIgPSBib3dzZXI7XG5cbiAgICAvLyBtYWtlIHN0cmljdE1vZGUgcGFyYW0gb3B0aW9uYWwgd2l0aCB1YSBwYXJhbSB1c2FnZVxuICAgIGlmICh0eXBlb2Ygc3RyaWN0TW9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHVhID0gc3RyaWN0TW9kZTtcbiAgICAgIHN0cmljdE1vZGUgPSB2b2lkKDApO1xuICAgIH1cblxuICAgIGlmIChzdHJpY3RNb2RlID09PSB2b2lkKDApKSB7XG4gICAgICBzdHJpY3RNb2RlID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh1YSkge1xuICAgICAgX2Jvd3NlciA9IGRldGVjdCh1YSk7XG4gICAgfVxuXG4gICAgdmFyIHZlcnNpb24gPSBcIlwiICsgX2Jvd3Nlci52ZXJzaW9uO1xuICAgIGZvciAodmFyIGJyb3dzZXIgaW4gbWluVmVyc2lvbnMpIHtcbiAgICAgIGlmIChtaW5WZXJzaW9ucy5oYXNPd25Qcm9wZXJ0eShicm93c2VyKSkge1xuICAgICAgICBpZiAoX2Jvd3Nlclticm93c2VyXSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbWluVmVyc2lvbnNbYnJvd3Nlcl0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXIgdmVyc2lvbiBpbiB0aGUgbWluVmVyc2lvbiBtYXAgc2hvdWxkIGJlIGEgc3RyaW5nOiAnICsgYnJvd3NlciArICc6ICcgKyBTdHJpbmcobWluVmVyc2lvbnMpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBicm93c2VyIHZlcnNpb24gYW5kIG1pbiBzdXBwb3J0ZWQgdmVyc2lvbi5cbiAgICAgICAgICByZXR1cm4gY29tcGFyZVZlcnNpb25zKFt2ZXJzaW9uLCBtaW5WZXJzaW9uc1ticm93c2VyXV0pIDwgMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpY3RNb2RlOyAvLyBub3QgZm91bmRcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBicm93c2VyIGlzIHN1cHBvcnRlZFxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IG1pblZlcnNpb25zIG1hcCBvZiBtaW5pbWFsIHZlcnNpb24gdG8gYnJvd3NlclxuICAgKiBAcGFyYW0gIHtCb29sZWFufSBbc3RyaWN0TW9kZSA9IGZhbHNlXSBmbGFnIHRvIHJldHVybiBmYWxzZSBpZiBicm93c2VyIHdhc24ndCBmb3VuZCBpbiBtYXBcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgW3VhXSB1c2VyIGFnZW50IHN0cmluZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gY2hlY2sobWluVmVyc2lvbnMsIHN0cmljdE1vZGUsIHVhKSB7XG4gICAgcmV0dXJuICFpc1Vuc3VwcG9ydGVkQnJvd3NlcihtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpO1xuICB9XG5cbiAgYm93c2VyLmlzVW5zdXBwb3J0ZWRCcm93c2VyID0gaXNVbnN1cHBvcnRlZEJyb3dzZXI7XG4gIGJvd3Nlci5jb21wYXJlVmVyc2lvbnMgPSBjb21wYXJlVmVyc2lvbnM7XG4gIGJvd3Nlci5jaGVjayA9IGNoZWNrO1xuXG4gIC8qXG4gICAqIFNldCBvdXIgZGV0ZWN0IG1ldGhvZCB0byB0aGUgbWFpbiBib3dzZXIgb2JqZWN0IHNvIHdlIGNhblxuICAgKiByZXVzZSBpdCB0byB0ZXN0IG90aGVyIHVzZXIgYWdlbnRzLlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBpbXBsZW1lbnQgZnV0dXJlIHRlc3RzLlxuICAgKi9cbiAgYm93c2VyLl9kZXRlY3QgPSBkZXRlY3Q7XG5cbiAgLypcbiAgICogU2V0IG91ciBkZXRlY3QgcHVibGljIG1ldGhvZCB0byB0aGUgbWFpbiBib3dzZXIgb2JqZWN0XG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGltcGxlbWVudCBib3dzZXIgaW4gc2VydmVyIHNpZGVcbiAgICovXG4gIGJvd3Nlci5kZXRlY3QgPSBkZXRlY3Q7XG4gIHJldHVybiBib3dzZXJcbn0pO1xuIiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG52YXIgcG9seWZpbGxzID0gcmVxdWlyZSgnLi9wb2x5ZmlsbHMnKTtcblxucG9seWZpbGxzLmFwcGx5UG9seWZpbGxzKCk7XG5cbnZhciBpbnN0YW5jZTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZXRJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH07XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihIZWxwZXJzLnppcE9iamVjdChbJ2luaXQnLCAnb3BlbicsICdvbicsICdvZmYnLCAnc2VuZE1lc3NhZ2UnLCAnb25NZXNzYWdlJ10ubWFwKGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAgICAgIHZhciBhcHAgPSBnZXRJbnN0YW5jZSgpO1xuICAgICAgICByZXR1cm4gW21ldGhvZE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBbbWV0aG9kTmFtZV0uYXBwbHkoYXBwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XTtcbiAgICB9KSksIHtcbiAgICAgICAgZXZlbnRUeXBlczogQXBwLmV2ZW50VHlwZXMsXG4gICAgfSk7XG59KSgpO1xuIl19
