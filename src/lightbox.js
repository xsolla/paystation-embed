var $ = require('jquery');
var _ = require('lodash');
var version = require('version');
var PostMessage = require('postmessage');

module.exports = (function () {
    function LightBox() {
        require('styles/lightbox.scss');
        this.eventObject = $({});
    }

    var CLASS_PREFIX = 'xpaystation-widget-lightbox';
    var EVENT_NAMESPACE = '.xpaystation-widget-lightbox';
    var DEFAULT_OPTIONS = {
        width: '850px',
        height: '100%',
        zIndex: 1000,
        overlayOpacity: '.6',
        overlayBackground: '#000000',
        contentBackground: '#ffffff',
        contentMargin: '10px',
        closeByKeyboard: true,
        closeByClick: true,
        spinner: 'xsolla',
        spinnerColor: null
    };

    var TEMPLATE = '<div class="<%-prefix%>">' +
        '<div class="<%-prefix%>-overlay"></div>' +
        '<div class="<%-prefix%>-content <%-prefix%>-content__hidden">' +
        '<iframe class="<%-prefix%>-content-iframe" src="<%-url%>" frameborder="0"></iframe>' +
        '</div>' +
        '<div class="<%-prefix%>-spinner"><%=spinner%></div>' +
        '</div>';

    var SPINNERS = {
        xsolla: require('spinners/xsolla.svg'),
        round: require('spinners/round.svg')
    };

    /** Private Members **/
    LightBox.prototype.triggerEvent = function () {
        this.eventObject.trigger.apply(this.eventObject, arguments);
    };

    LightBox.prototype.measureScrollbar = function () { // thx walsh
        var bodyElement = $(global.document.body);

        var scrollDiv = $('<div></div>').css({
            position: 'absolute',
            top: '-9999px',
            width: '50px',
            height: '50px',
            overflow: 'scroll'
        });

        bodyElement.append(scrollDiv);
        var scrollbarWidth = scrollDiv.get(0).offsetWidth - scrollDiv.get(0).clientWidth;
        scrollDiv.remove();

        return scrollbarWidth;
    };

    /** Public Members **/
    LightBox.prototype.openFrame = function (url, options) {
        options = _.extend({}, DEFAULT_OPTIONS, options);

        var bodyElement = $(global.document.body);
        var lightBoxElement = $(_.template(TEMPLATE)({
            prefix: CLASS_PREFIX,
            url: url,
            spinner: options && SPINNERS[options.spinner] || _.values(SPINNERS)[0]
        }));
        var lightBoxOverlayElement = lightBoxElement.find('.' + CLASS_PREFIX + '-overlay');
        var lightBoxContentElement = lightBoxElement.find('.' + CLASS_PREFIX + '-content');
        var lightBoxIframeElement = lightBoxContentElement.find('.' + CLASS_PREFIX + '-content-iframe');
        var lightBoxSpinnerElement = lightBoxElement.find('.' + CLASS_PREFIX + '-spinner');

        lightBoxElement.css({
            zIndex: options.zIndex
        });

        lightBoxOverlayElement.css({
            background: options.overlayBackground,
            opacity: options.overlayOpacity
        });

        lightBoxContentElement.css({
            width: options.width,
            height: options.height,
            margin: options.contentMargin,
            background: options.contentBackground
        });

        if (options.spinnerColor) {
            lightBoxSpinnerElement.find('path').css({
                fill: options.spinnerColor
            });
        }

        if (options.closeByClick) {
            lightBoxOverlayElement.on('click', _.bind(function () {
                this.closeFrame();
            }, this));
        }

        bodyElement.append(lightBoxElement);

        if (options.closeByKeyboard) {
            bodyElement.on('keyup' + EVENT_NAMESPACE, _.bind(function (event) {
                if (event.which == 27) {
                    this.closeFrame();
                }
            }, this));
        }

        var showContent = _.bind(function () {
            showContent = _.noop;
            hideSpinner(options);
            lightBoxContentElement.removeClass(CLASS_PREFIX + '-content__hidden');
            this.triggerEvent('load');
        }, this);

        var lightBoxResize = function () {
            lightBoxContentElement.css({
                top: 0,
                left: 0,
                width: options.width,
                height: options.height
            });

            var containerWidth = lightBoxElement.get(0).clientWidth,
                containerHeight = lightBoxElement.get(0).clientHeight;
            var contentWidth = lightBoxContentElement.outerWidth(true),
                contentHeight = lightBoxContentElement.outerHeight(true);
            var horMargin = contentWidth - lightBoxContentElement.outerWidth(),
                vertMargin = contentHeight - lightBoxContentElement.outerHeight();
            var horDiff = containerWidth - contentWidth,
                vertDiff = containerHeight - contentHeight;

            if (horDiff < 0) {
                lightBoxContentElement.width(containerWidth - horMargin);
            } else {
                lightBoxContentElement.css('left', Math.round(horDiff / 2));
            }

            if (vertDiff < 0) {
                lightBoxContentElement.height(containerHeight - vertMargin);
            } else {
                lightBoxContentElement.css('top', Math.round(vertDiff / 2));
            }
        };

        var bodyStyles;
        var hideScrollbar = _.bind(function () {
            bodyStyles = _.object(_.map(['overflow', 'paddingRight'], function (key) {
                return [key, bodyElement.css(key)];
            }));

            if (global.window.innerWidth > bodyElement.outerWidth(true)) {
                var bodyPad = parseInt((bodyElement.css('paddingRight') || 0), 10);
                bodyElement.css({
                    'paddingRight': bodyPad + this.measureScrollbar(),
                    'overflow': 'hidden'
                });
            }
        }, this);

        var resetScrollbar = function () {
            bodyElement.css(bodyStyles || {});
        };

        var showSpinner = function () {
            lightBoxSpinnerElement.show();
        };

        var hideSpinner = function () {
            lightBoxSpinnerElement.hide();
        };

        var loadTimer;
        lightBoxIframeElement.on('load', _.bind(function (event) {
            loadTimer = global.setTimeout(function () {
                showContent();
            }, 1000);
            $(event.target).off(event);
        }, this));

        var iframeWindow = lightBoxIframeElement.get(0).contentWindow || lightBoxIframeElement.get(0);

        // Cross-window communication
        var message = new PostMessage(iframeWindow);
        message.on('dimensions widget-detection', function () {
            showContent();
        });
        message.on('widget-detection', function () {
            message.send('widget-detected', {version: version});
        });
        message.on('widget-close', _.bind(function () {
            this.closeFrame();
        }, this));
        message.on('status', _.bind(function (event, data) {
            this.triggerEvent('status', data);
        }, this));

        // Resize
        $.event.add(global.window, 'resize' + EVENT_NAMESPACE, lightBoxResize);

        // Clean up after close
        this.on('close', function (event) {
            message.off();
            bodyElement.off(EVENT_NAMESPACE);
            $.event.remove(global.window, 'resize' + EVENT_NAMESPACE, lightBoxResize);
            lightBoxElement.remove();
            resetScrollbar();
            $(event.target).off(event);
        });

        lightBoxResize();
        showSpinner();
        hideScrollbar();

        this.triggerEvent('open');
    };

    LightBox.prototype.closeFrame = function () {
        this.triggerEvent('close');
    };

    LightBox.prototype.on = function () {
        this.eventObject.on.apply(this.eventObject, arguments);
    };

    LightBox.prototype.off = function () {
        this.eventObject.off.apply(this.eventObject, arguments);
    };

    return LightBox;
})();
