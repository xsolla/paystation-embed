(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.XPayStationWidget = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = require('cssify');
},{"cssify":2}],4:[function(require,module,exports){
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
        iframeOnly: false,
        consentId: null
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

        const query = this.config.queryParams || {};
        if (this.config.access_token) {
            query.access_token = this.config.access_token;
        } else {
            query.access_data = JSON.stringify(this.config.access_data);
        }

        const urlWithoutQueryParams = this.config.sandbox ?
            SANDBOX_PAYSTATION_URL :
            'https://' + this.config.host + '/paystation2/?';

        const paymentUrl = urlWithoutQueryParams + Helpers.param(query);

        if (this.config.consentId) {
            return Helpers.getPaymentUrlWithConsentId(paymentUrl, this.config.consentId)
        }

        return paymentUrl;
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

},{"./childwindow":5,"./device":6,"./exception":7,"./helpers":8,"./lightbox":9}],5:[function(require,module,exports){
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

},{"./helpers":8,"./postmessage":11,"./version":15}],6:[function(require,module,exports){
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

},{"bowser":1}],7:[function(require,module,exports){
module.exports = function (message) {
    this.message = message;
    this.name = "XsollaPayStationWidgetException";
    this.toString = (function () {
        return this.name + ': ' + this.message;
    }).bind(this);
};

},{}],8:[function(require,module,exports){
function isEmpty(value) {
    return value === null || value === undefined;
}

function uniq(list) {
    return list.filter(function (x, i, a) {
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
    return function () {
        f(arguments);
        f = function () {
        };
    }
}

function addEventObject(context, wrapEventInNamespace) {
    var dummyWrapper = function (event) {
        return event
    };
    var wrapEventInNamespace = wrapEventInNamespace || dummyWrapper;
    var eventsList = [];
    var handlers = new WeakMap();

    function isStringContainedSpace(str) {
        return / /.test(str)
    }

    return {
        trigger: (function (eventName, data) {
            var eventInNamespace = wrapEventInNamespace(eventName);
            try {
                var event = new CustomEvent(eventInNamespace, {detail: data}); // Not working in IE
            } catch (e) {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent(eventInNamespace, true, true, data);
            }
            document.dispatchEvent(event);
        }).bind(context),
        on: (function (eventName, handle, options) {
            function addEvent(eventName, handle, options) {
                const handlerDecorator = function (event) {
                    handle(event, event.detail);
                }

                handlers.set(handle, handlerDecorator);

                var eventInNamespace = wrapEventInNamespace(eventName);
                document.addEventListener(eventInNamespace, handlerDecorator, options);
                eventsList.push({name: eventInNamespace, handle: handlerDecorator, options: options});
            }

            if (isStringContainedSpace(eventName)) {
                var events = eventName.split(' ');
                events.forEach(function (parsedEventName) {
                    addEvent(parsedEventName, handle, options)
                })
            } else {
                addEvent(eventName, handle, options);
            }

        }).bind(context),

        off: (function (eventName, handle, options) {
            const offAllEvents = !eventName && !handle && !options;

            if (offAllEvents) {
                eventsList.forEach(function (event) {
                    document.removeEventListener(event.name, event.handle, event.options);
                });
                return;
            }

            function removeEvent(eventName, handle, options) {
                var eventInNamespace = wrapEventInNamespace(eventName);

                const handlerDecorator = handlers.get(handle);

                document.removeEventListener(eventInNamespace, handlerDecorator, options);
                eventsList = eventsList.filter(function (event) {
                    return event.name !== eventInNamespace;
                });
            }

            if (isStringContainedSpace(eventName)) {
                var events = eventName.split(' ');
                events.forEach(function (parsedEventName) {
                    removeEvent(parsedEventName, handle, options)
                })
            } else {
                removeEvent(eventName, handle, options);
            }

        }).bind(context)
    };
}

function getPaymentUrlWithConsentId(url, consentId) {
    let paymentUrl = new URL(url);

    paymentUrl.searchParams.append('consentId', consentId);

    return paymentUrl.toString();
}


module.exports = {
    addEventObject: addEventObject,
    isEmpty: isEmpty,
    uniq: uniq,
    zipObject: zipObject,
    param: param,
    once: once,
    getPaymentUrlWithConsentId: getPaymentUrlWithConsentId
}

},{}],9:[function(require,module,exports){
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
            iframe.allow = 'payment';

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

		var detectOS = function () {
			const platform = navigator.platform.toLowerCase();
			const userAgent = navigator.userAgent.toLowerCase();

			if (/windows phone/.test(userAgent)) return "Windows Phone";
			if (/win/.test(platform)) return "Windows";
			if (/mac/.test(platform)) return "macOS";
			if (/linux/.test(platform)) return "Linux";
			if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";
			if (/android/.test(userAgent)) return "Android";

			return "Unknown OS";
		};

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

            var widthAfterResize = containerWidth - horMargin;

            if (widthAfterResize > contentWidth) {
                widthAfterResize = contentWidth;
            }

            if (widthAfterResize > containerWidth) {
                widthAfterResize = containerWidth;
            }

            var heightAfterResize = containerHeight - vertMargin;

            if (heightAfterResize > contentHeight) {
                heightAfterResize = contentHeight;
            }

            if (heightAfterResize > containerHeight) {
                heightAfterResize = containerHeight;
            }

			var isIos = detectOS() === "iOS";

			var isBrowserWithResizeIssue = /fxios|crios|opt/i.test(navigator.userAgent);
            var isFirefoxOrOperaWithResizeIssue = /fxios|opt/i.test(
                navigator.userAgent
            );

			if (isIos && isBrowserWithResizeIssue) {
				lightBoxContentElement.style.width = "100vw";
                /*
                * Browsers like Firefox and Opera display Pay Station correctly when the height is set to 100vh.
                * However, Google Chrome restricts vertical scrolling of Pay Station at that height.
                * Through experimentation, a value of 90vh was found to work better for Chrome.
                * */
				lightBoxContentElement.style.height = isFirefoxOrOperaWithResizeIssue
					? "100vh"
					: "90vh";
			} else {
				lightBoxContentElement.style.width =
					withDefaultPXUnit(widthAfterResize);
				lightBoxContentElement.style.height =
					withDefaultPXUnit(heightAfterResize);
			}

            var leftOffset = ((window.innerWidth - widthAfterResize) / 2) - (horMargin / 2);
            var topOffset = ((window.innerHeight - heightAfterResize) / 2)  - (vertMargin / 2);

            lightBoxContentElement.style.left = withDefaultPXUnit(Math.max(leftOffset, 0));
            lightBoxContentElement.style.top = withDefaultPXUnit(Math.max(topOffset, 0));
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

},{"./helpers":8,"./postmessage":11,"./spinners/round.svg":12,"./spinners/xsolla.svg":13,"./styles/lightbox.scss":14,"./version":15}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./helpers":8}],12:[function(require,module,exports){
module.exports = "<svg width=\"47px\" height=\"47px\" class=\"spinner-round\"><path d=\"M4.7852728,10.4210875 C2.94111664,13.0552197 1.63777109,16.0946106 1.03753956,19.3768556 L5.16638971,19.3768556 C5.6429615,17.187554 6.50125243,15.139164 7.66768899,13.305305 L5.95572428,11.5922705 L4.7852728,10.4210875 L4.7852728,10.4210875 Z M10.4693048,4.74565615 C13.1274873,2.8908061 16.1965976,1.58674648 19.5100161,1 L19.5100161,4.99523934 C17.2710923,5.48797782 15.1803193,6.3808529 13.3166907,7.59482153 L11.6337339,5.91081293 L10.4693048,4.74565615 L10.4693048,4.74565615 Z M42.2426309,36.5388386 C44.1112782,33.8575016 45.4206461,30.7581504 46,27.4117269 L41.9441211,27.4117269 C41.4527945,29.6618926 40.5583692,31.762911 39.3404412,33.6349356 L41.0332347,35.3287869 L42.2425306,36.5388386 L42.2426309,36.5388386 Z M36.5707441,42.2264227 C33.9167773,44.0867967 30.8509793,45.3972842 27.5398693,45.9911616 L27.5398693,41.7960549 C29.7376402,41.3202901 31.7936841,40.4593536 33.6336246,39.287568 L35.3554258,41.0104453 L36.5707441,42.2265231 L36.5707441,42.2264227 Z M4.71179965,36.4731535 C2.86744274,33.8069823 1.57463637,30.7309322 1,27.4118273 L5.16889904,27.4118273 C5.64828128,29.6073559 6.51159087,31.661069 7.68465205,33.4984432 L5.95572428,35.2284515 L4.71179965,36.4731535 L4.71179965,36.4731535 Z M10.3640133,42.180423 C13.0462854,44.0745435 16.1527345,45.40552 19.5101165,46 L19.5101165,41.7821947 C17.2817319,41.2916658 15.2000928,40.4048169 13.3430889,39.1995862 L11.6337339,40.9100094 L10.3640133,42.1805235 L10.3640133,42.180423 Z M42.1688567,10.3557038 C44.0373031,13.0048008 45.357411,16.0674929 45.9626612,19.3768556 L41.9469316,19.3768556 C41.4585158,17.1328164 40.5692095,15.0369202 39.3580065,13.1684109 L41.0335358,11.4918346 L42.168957,10.3557038 L42.1688567,10.3557038 Z M36.4651516,4.69995782 C33.8355754,2.87865336 30.8071162,1.59488179 27.5400701,1.00883836 L27.5400701,4.98117831 C29.7484805,5.45915272 31.8137587,6.3260149 33.6604242,7.50643794 L35.3555262,5.8102766 L36.4651516,4.69995782 L36.4651516,4.69995782 Z\" fill=\"#CCCCCC\"></path></svg>";

},{}],13:[function(require,module,exports){
module.exports = "<svg class=\"spinner-xsolla\" width=\"56\" height=\"55\"><path class=\"spinner-xsolla-x\" d=\"M21.03 5.042l-2.112-2.156-3.657 3.695-3.657-3.695-2.112 2.156 3.659 3.673-3.659 3.696 2.112 2.157 3.657-3.697 3.657 3.697 2.112-2.157-3.648-3.696 3.648-3.673z\" fill=\"#F2542D\"></path><path class=\"spinner-xsolla-s\" d=\"M41.232 6.896l2.941-2.974-2.134-2.132-2.92 2.973-.005-.008-2.134 2.135.005.008-.005.005 3.792 3.82-2.915 2.947 2.112 2.156 5.06-5.111-3.798-3.816.001-.001z\" fill=\"#FCCA20\"></path><path class=\"spinner-xsolla-o\" d=\"M48.066 29.159c-1.536 0-2.761 1.263-2.761 2.79 0 1.524 1.226 2.765 2.761 2.765 1.509 0 2.736-1.242 2.736-2.765 0-1.526-1.227-2.79-2.736-2.79m0 8.593c-3.179 0-5.771-2.594-5.771-5.804 0-3.213 2.592-5.808 5.771-5.808 3.155 0 5.745 2.594 5.745 5.808 0 3.21-2.589 5.804-5.745 5.804\" fill=\"#8C3EA4\"></path><path class=\"spinner-xsolla-l\" d=\"M24.389 42.323h2.99v10.437h-2.99v-10.437zm4.334 0h2.989v10.437h-2.989v-10.437z\" fill=\"#B5DC20\"></path><path class=\"spinner-xsolla-a\" d=\"M7.796 31.898l1.404 2.457h-2.835l1.431-2.457h-.001zm-.001-5.757l-6.363 11.102h12.703l-6.341-11.102z\" fill=\"#66CCDA\"></path></svg>";

},{}],14:[function(require,module,exports){
module.exports = require('sassify')('.xpaystation-widget-lightbox{position:fixed;top:0;left:0;bottom:0;right:0;width:100%;height:100%;-webkit-animation:xpaystation-widget-lightbox-fadein 0.15s;animation:xpaystation-widget-lightbox-fadein 0.15s}.xpaystation-widget-lightbox-overlay{position:absolute;top:0;left:0;bottom:0;right:0;z-index:1}.xpaystation-widget-lightbox-content{position:relative;top:0;left:0;z-index:3}.xpaystation-widget-lightbox-content__hidden{visibility:hidden;z-index:-1}.xpaystation-widget-lightbox-content-iframe{width:100%;height:100%;border:0;background:transparent}.xpaystation-widget-lightbox-spinner{position:absolute;top:50%;left:50%;display:none;z-index:2;pointer-events:none}.xpaystation-widget-lightbox-spinner .spinner-xsolla{width:56px;height:55px;margin-top:-28px;margin-left:-26px}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-x,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-s,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-o,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-l,.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-a{-webkit-animation:xpaystation-widget-lightbox-bouncedelay 1s infinite ease-in-out;-webkit-animation-fill-mode:both;animation:xpaystation-widget-lightbox-bouncedelay 1s infinite ease-in-out;animation-fill-mode:both}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-x{-webkit-animation-delay:0s;animation-delay:0s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-s{-webkit-animation-delay:.2s;animation-delay:.2s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-o{-webkit-animation-delay:.4s;animation-delay:.4s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-l{-webkit-animation-delay:.6s;animation-delay:.6s}.xpaystation-widget-lightbox-spinner .spinner-xsolla .spinner-xsolla-a{-webkit-animation-delay:.8s;animation-delay:.8s}.xpaystation-widget-lightbox-spinner .spinner-round{margin-top:-23px;margin-left:-23px;-webkit-animation:xpaystation-widget-lightbox-spin 3s infinite linear;animation:xpaystation-widget-lightbox-spin 3s infinite linear}.xpaystation-widget-lightbox-spinner .spinner-custom{-webkit-animation:xpaystation-widget-lightbox-spin infinite linear;animation:xpaystation-widget-lightbox-spin infinite linear}@-webkit-keyframes xpaystation-widget-lightbox-bouncedelay{0%,80%,100%{opacity:0}40%{opacity:1}}@keyframes xpaystation-widget-lightbox-bouncedelay{0%,80%,100%{opacity:0}40%{opacity:1}}@-webkit-keyframes xpaystation-widget-lightbox-fadein{from{opacity:0}to{opacity:1}}@keyframes xpaystation-widget-lightbox-fadein{from{opacity:0}to{opacity:1}}@-webkit-keyframes xpaystation-widget-lightbox-spin{from{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(360deg)}}@keyframes xpaystation-widget-lightbox-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}  /*# sourceMappingURL=data:application/json;base64,ewoJInZlcnNpb24iOiAzLAoJImZpbGUiOiAibGlnaHRib3guc2NzcyIsCgkic291cmNlcyI6IFsKCQkibGlnaHRib3guc2NzcyIKCV0sCgkic291cmNlc0NvbnRlbnQiOiBbCgkJIiRsaWdodGJveC1wcmVmaXg6ICd4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xuJGxpZ2h0Ym94LWNsYXNzOiAnLicgKyAkbGlnaHRib3gtcHJlZml4O1xuXG4jeyRsaWdodGJveC1jbGFzc30ge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgYm90dG9tOiAwO1xuICByaWdodDogMDtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgLXdlYmtpdC1hbmltYXRpb246ICN7JGxpZ2h0Ym94LXByZWZpeH0tZmFkZWluIC4xNXM7XG4gIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1mYWRlaW4gLjE1cztcbn1cblxuI3skbGlnaHRib3gtY2xhc3N9LW92ZXJsYXkge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDowO1xuICBsZWZ0OiAwO1xuICBib3R0b206IDA7XG4gIHJpZ2h0OiAwO1xuICB6LWluZGV4OiAxO1xufVxuXG4jeyRsaWdodGJveC1jbGFzc30tY29udGVudCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB6LWluZGV4OiAzO1xufVxuXG4jeyRsaWdodGJveC1jbGFzc30tY29udGVudF9faGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICB6LWluZGV4OiAtMTtcbn1cblxuI3skbGlnaHRib3gtY2xhc3N9LWNvbnRlbnQtaWZyYW1lIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgYm9yZGVyOiAwO1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbn1cblxuI3skbGlnaHRib3gtY2xhc3N9LXNwaW5uZXIge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogNTAlO1xuICBsZWZ0OiA1MCU7XG4gIGRpc3BsYXk6IG5vbmU7XG4gIHotaW5kZXg6IDI7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuXG4gIC5zcGlubmVyLXhzb2xsYSB7XG4gICAgd2lkdGg6IDU2cHg7XG4gICAgaGVpZ2h0OiA1NXB4O1xuICAgIG1hcmdpbjoge1xuICAgICAgdG9wOiAtMjhweDtcbiAgICAgIGxlZnQ6IC0yNnB4O1xuICAgIH1cblxuICAgIC5zcGlubmVyLXhzb2xsYS14LCAuc3Bpbm5lci14c29sbGEtcywgLnNwaW5uZXIteHNvbGxhLW8sIC5zcGlubmVyLXhzb2xsYS1sLCAuc3Bpbm5lci14c29sbGEtYSB7XG4gICAgICAtd2Via2l0LWFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcbiAgICAgIC13ZWJraXQtYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDtcbiAgICAgIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcbiAgICAgIGFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7XG4gICAgfVxuXG4gICAgLnNwaW5uZXIteHNvbGxhLXgge1xuICAgICAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcbiAgICB9XG5cbiAgICAuc3Bpbm5lci14c29sbGEtcyB7XG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjJzO1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuMnM7XG4gICAgfVxuXG4gICAgLnNwaW5uZXIteHNvbGxhLW8ge1xuICAgICAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC40cztcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLjRzO1xuICAgIH1cblxuICAgIC5zcGlubmVyLXhzb2xsYS1sIHtcbiAgICAgIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAuNnM7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC42cztcbiAgICB9XG5cbiAgICAuc3Bpbm5lci14c29sbGEtYSB7XG4gICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjhzO1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuOHM7XG4gICAgfVxuICB9XG5cbiAgLnNwaW5uZXItcm91bmQge1xuICAgIG1hcmdpbjoge1xuICAgICAgdG9wOiAtMjNweDtcbiAgICAgIGxlZnQ6IC0yM3B4O1xuICAgIH1cbiAgICAtd2Via2l0LWFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1zcGluIDNzIGluZmluaXRlIGxpbmVhcjtcbiAgICBhbmltYXRpb246ICN7JGxpZ2h0Ym94LXByZWZpeH0tc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXI7XG4gIH1cblxuICAuc3Bpbm5lci1jdXN0b20ge1xuICAgIC13ZWJraXQtYW5pbWF0aW9uOiAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4gaW5maW5pdGUgbGluZWFyO1xuICAgIGFuaW1hdGlvbjogI3skbGlnaHRib3gtcHJlZml4fS1zcGluIGluZmluaXRlIGxpbmVhcjtcbiAgfVxufVxuXG5ALXdlYmtpdC1rZXlmcmFtZXMgI3skbGlnaHRib3gtcHJlZml4fS1ib3VuY2VkZWxheSB7XG4gIDAlLCA4MCUsIDEwMCUgeyBvcGFjaXR5OiAwOyB9XG4gIDQwJSB7IG9wYWNpdHk6IDEgfVxufVxuXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tYm91bmNlZGVsYXkge1xuICAwJSwgODAlLCAxMDAlIHsgb3BhY2l0eTogMDsgfVxuICA0MCUgeyBvcGFjaXR5OiAxOyB9XG59XG5cbkAtd2Via2l0LWtleWZyYW1lcyAjeyRsaWdodGJveC1wcmVmaXh9LWZhZGVpbiB7XG4gIGZyb20geyBvcGFjaXR5OiAwOyB9XG4gIHRvIHsgb3BhY2l0eTogMTsgfVxufVxuXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tZmFkZWluIHtcbiAgZnJvbSB7IG9wYWNpdHk6IDA7IH1cbiAgdG8geyBvcGFjaXR5OiAxOyB9XG59XG5cbkAtd2Via2l0LWtleWZyYW1lcyAjeyRsaWdodGJveC1wcmVmaXh9LXNwaW4ge1xuICBmcm9tIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxuICB0byB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxufVxuXG5Aa2V5ZnJhbWVzICN7JGxpZ2h0Ym94LXByZWZpeH0tc3BpbiB7XG4gIGZyb20geyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxuICB0byB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cbn1cbiIKCV0sCgkibWFwcGluZ3MiOiAiQUFHQSxBQUFBLDRCQUE0QixBQUE1QixDQUNFLFFBQVEsQ0FBRSxLQUFNLENBQ2hCLEdBQUcsQ0FBRSxDQUFFLENBQ1AsSUFBSSxDQUFFLENBQUUsQ0FDUixNQUFNLENBQUUsQ0FBRSxDQUNWLEtBQUssQ0FBRSxDQUFFLENBQ1QsS0FBSyxDQUFFLElBQUssQ0FDWixNQUFNLENBQUUsSUFBSyxDQUNiLGlCQUFpQixDQUFFLGtDQUEwQixDQUFRLEtBQUksQ0FDekQsU0FBUyxDQUFFLGtDQUEwQixDQUFRLEtBQUksQ0FDbEQsQUFFRCxBQUFBLG9DQUFvQyxBQUFwQyxDQUNFLFFBQVEsQ0FBRSxRQUFTLENBQ25CLEdBQUcsQ0FBQyxDQUFFLENBQ04sSUFBSSxDQUFFLENBQUUsQ0FDUixNQUFNLENBQUUsQ0FBRSxDQUNWLEtBQUssQ0FBRSxDQUFFLENBQ1QsT0FBTyxDQUFFLENBQUUsQ0FDWixBQUVELEFBQUEsb0NBQW9DLEFBQXBDLENBQ0UsUUFBUSxDQUFFLFFBQVMsQ0FDbkIsR0FBRyxDQUFFLENBQUUsQ0FDUCxJQUFJLENBQUUsQ0FBRSxDQUNSLE9BQU8sQ0FBRSxDQUFFLENBQ1osQUFFRCxBQUFBLDRDQUE0QyxBQUE1QyxDQUNFLFVBQVUsQ0FBRSxNQUFPLENBQ25CLE9BQU8sQ0FBRSxFQUFHLENBQ2IsQUFFRCxBQUFBLDJDQUEyQyxBQUEzQyxDQUNFLEtBQUssQ0FBRSxJQUFLLENBQ1osTUFBTSxDQUFFLElBQUssQ0FDYixNQUFNLENBQUUsQ0FBRSxDQUNWLFVBQVUsQ0FBRSxXQUFZLENBQ3pCLEFBRUQsQUFBQSxvQ0FBb0MsQUFBcEMsQ0FDRSxRQUFRLENBQUUsUUFBUyxDQUNuQixHQUFHLENBQUUsR0FBSSxDQUNULElBQUksQ0FBRSxHQUFJLENBQ1YsT0FBTyxDQUFFLElBQUssQ0FDZCxPQUFPLENBQUUsQ0FBRSxDQUNYLGNBQWMsQ0FBRSxJQUFLLENBd0R0QixBQTlERCxBQVFFLG9DQVJrQyxDQVFsQyxlQUFlLEFBQUMsQ0FDZCxLQUFLLENBQUUsSUFBSyxDQUNaLE1BQU0sQ0FBRSxJQUFLLENBQ2IsTUFBTSxBQUFDLENBQUMsQUFDTixHQUFHLENBQUUsS0FBTSxDQURiLE1BQU0sQUFBQyxDQUFDLEFBRU4sSUFBSSxDQUFFLEtBQU0sQ0FrQ2YsQUEvQ0gsQUFnQkksb0NBaEJnQyxDQVFsQyxlQUFlLENBUWIsaUJBQWlCLENBaEJyQixBQWdCdUIsb0NBaEJhLENBUWxDLGVBQWUsQ0FRTSxpQkFBaUIsQ0FoQnhDLEFBZ0IwQyxvQ0FoQk4sQ0FRbEMsZUFBZSxDQVF5QixpQkFBaUIsQ0FoQjNELEFBZ0I2RCxvQ0FoQnpCLENBUWxDLGVBQWUsQ0FRNEMsaUJBQWlCLENBaEI5RSxBQWdCZ0Ysb0NBaEI1QyxDQVFsQyxlQUFlLENBUStELGlCQUFpQixBQUFDLENBQzVGLGlCQUFpQixDQUFFLHVDQUErQixDQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUN0RiwyQkFBMkIsQ0FBRSxJQUFLLENBQ2xDLFNBQVMsQ0FBRSx1Q0FBK0IsQ0FBYSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FDOUUsbUJBQW1CLENBQUUsSUFBSyxDQUMzQixBQXJCTCxBQXVCSSxvQ0F2QmdDLENBUWxDLGVBQWUsQ0FlYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxFQUFHLENBQzVCLGVBQWUsQ0FBRSxFQUFHLENBQ3JCLEFBMUJMLEFBNEJJLG9DQTVCZ0MsQ0FRbEMsZUFBZSxDQW9CYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBL0JMLEFBaUNJLG9DQWpDZ0MsQ0FRbEMsZUFBZSxDQXlCYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBcENMLEFBc0NJLG9DQXRDZ0MsQ0FRbEMsZUFBZSxDQThCYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBekNMLEFBMkNJLG9DQTNDZ0MsQ0FRbEMsZUFBZSxDQW1DYixpQkFBaUIsQUFBQyxDQUNoQix1QkFBdUIsQ0FBRSxHQUFJLENBQzdCLGVBQWUsQ0FBRSxHQUFJLENBQ3RCLEFBOUNMLEFBaURFLG9DQWpEa0MsQ0FpRGxDLGNBQWMsQUFBQyxDQUNiLE1BQU0sQUFBQyxDQUFDLEFBQ04sR0FBRyxDQUFFLEtBQU0sQ0FEYixNQUFNLEFBQUMsQ0FBQyxBQUVOLElBQUksQ0FBRSxLQUFNLENBRWQsaUJBQWlCLENBQUUsZ0NBQXdCLENBQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQ25FLFNBQVMsQ0FBRSxnQ0FBd0IsQ0FBTSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FDNUQsQUF4REgsQUEwREUsb0NBMURrQyxDQTBEbEMsZUFBZSxBQUFDLENBQ2QsaUJBQWlCLENBQUUsZ0NBQXdCLENBQU0sUUFBUSxDQUFDLE1BQU0sQ0FDaEUsU0FBUyxDQUFFLGdDQUF3QixDQUFNLFFBQVEsQ0FBQyxNQUFNLENBQ3pELEFBR0gsa0JBQWtCLENBQWxCLHVDQUFrQixDQUNoQixBQUFBLEVBQUUsQ0FBRSxBQUFBLEdBQUcsQ0FBRSxBQUFBLElBQUksQ0FBRyxPQUFPLENBQUUsQ0FBRSxDQUMzQixBQUFBLEdBQUcsQ0FBRyxPQUFPLENBQUUsQ0FBRyxFQUdwQixVQUFVLENBQVYsdUNBQVUsQ0FDUixBQUFBLEVBQUUsQ0FBRSxBQUFBLEdBQUcsQ0FBRSxBQUFBLElBQUksQ0FBRyxPQUFPLENBQUUsQ0FBRSxDQUMzQixBQUFBLEdBQUcsQ0FBRyxPQUFPLENBQUUsQ0FBRSxFQUduQixrQkFBa0IsQ0FBbEIsa0NBQWtCLENBQ2hCLEFBQUEsSUFBSSxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQ2xCLEFBQUEsRUFBRSxDQUFHLE9BQU8sQ0FBRSxDQUFFLEVBR2xCLFVBQVUsQ0FBVixrQ0FBVSxDQUNSLEFBQUEsSUFBSSxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQ2xCLEFBQUEsRUFBRSxDQUFHLE9BQU8sQ0FBRSxDQUFFLEVBR2xCLGtCQUFrQixDQUFsQixnQ0FBa0IsQ0FDaEIsQUFBQSxJQUFJLENBQUcsaUJBQWlCLENBQUUsWUFBTSxDQUNoQyxBQUFBLEVBQUUsQ0FBRyxpQkFBaUIsQ0FBRSxjQUFNLEVBR2hDLFVBQVUsQ0FBVixnQ0FBVSxDQUNSLEFBQUEsSUFBSSxDQUFHLFNBQVMsQ0FBRSxZQUFNLENBQ3hCLEFBQUEsRUFBRSxDQUFHLFNBQVMsQ0FBRSxjQUFNIiwKCSJuYW1lcyI6IFtdCn0= */');;
},{"sassify":3}],15:[function(require,module,exports){
module.exports = '1.2.12';

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

},{"./app":4,"./helpers":8,"./polyfills":10}]},{},["main"])("main")
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYm93c2VyL3NyYy9ib3dzZXIuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckVBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTs7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBCb3dzZXIgLSBhIGJyb3dzZXIgZGV0ZWN0b3JcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm93c2VyXG4gKiBNSVQgTGljZW5zZSB8IChjKSBEdXN0aW4gRGlheiAyMDE1XG4gKi9cblxuIWZ1bmN0aW9uIChyb290LCBuYW1lLCBkZWZpbml0aW9uKSB7XG4gIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKVxuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKG5hbWUsIGRlZmluaXRpb24pXG4gIGVsc2Ugcm9vdFtuYW1lXSA9IGRlZmluaXRpb24oKVxufSh0aGlzLCAnYm93c2VyJywgZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICAqIFNlZSB1c2VyYWdlbnRzLmpzIGZvciBleGFtcGxlcyBvZiBuYXZpZ2F0b3IudXNlckFnZW50XG4gICAgKi9cblxuICB2YXIgdCA9IHRydWVcblxuICBmdW5jdGlvbiBkZXRlY3QodWEpIHtcblxuICAgIGZ1bmN0aW9uIGdldEZpcnN0TWF0Y2gocmVnZXgpIHtcbiAgICAgIHZhciBtYXRjaCA9IHVhLm1hdGNoKHJlZ2V4KTtcbiAgICAgIHJldHVybiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaFsxXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2Vjb25kTWF0Y2gocmVnZXgpIHtcbiAgICAgIHZhciBtYXRjaCA9IHVhLm1hdGNoKHJlZ2V4KTtcbiAgICAgIHJldHVybiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaFsyXSkgfHwgJyc7XG4gICAgfVxuXG4gICAgdmFyIGlvc2RldmljZSA9IGdldEZpcnN0TWF0Y2goLyhpcG9kfGlwaG9uZXxpcGFkKS9pKS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIGxpa2VBbmRyb2lkID0gL2xpa2UgYW5kcm9pZC9pLnRlc3QodWEpXG4gICAgICAsIGFuZHJvaWQgPSAhbGlrZUFuZHJvaWQgJiYgL2FuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBuZXh1c01vYmlsZSA9IC9uZXh1c1xccypbMC02XVxccyovaS50ZXN0KHVhKVxuICAgICAgLCBuZXh1c1RhYmxldCA9ICFuZXh1c01vYmlsZSAmJiAvbmV4dXNcXHMqWzAtOV0rL2kudGVzdCh1YSlcbiAgICAgICwgY2hyb21lb3MgPSAvQ3JPUy8udGVzdCh1YSlcbiAgICAgICwgc2lsayA9IC9zaWxrL2kudGVzdCh1YSlcbiAgICAgICwgc2FpbGZpc2ggPSAvc2FpbGZpc2gvaS50ZXN0KHVhKVxuICAgICAgLCB0aXplbiA9IC90aXplbi9pLnRlc3QodWEpXG4gICAgICAsIHdlYm9zID0gLyh3ZWJ8aHB3KShvfDApcy9pLnRlc3QodWEpXG4gICAgICAsIHdpbmRvd3NwaG9uZSA9IC93aW5kb3dzIHBob25lL2kudGVzdCh1YSlcbiAgICAgICwgc2Ftc3VuZ0Jyb3dzZXIgPSAvU2Ftc3VuZ0Jyb3dzZXIvaS50ZXN0KHVhKVxuICAgICAgLCB3aW5kb3dzID0gIXdpbmRvd3NwaG9uZSAmJiAvd2luZG93cy9pLnRlc3QodWEpXG4gICAgICAsIG1hYyA9ICFpb3NkZXZpY2UgJiYgIXNpbGsgJiYgL21hY2ludG9zaC9pLnRlc3QodWEpXG4gICAgICAsIGxpbnV4ID0gIWFuZHJvaWQgJiYgIXNhaWxmaXNoICYmICF0aXplbiAmJiAhd2Vib3MgJiYgL2xpbnV4L2kudGVzdCh1YSlcbiAgICAgICwgZWRnZVZlcnNpb24gPSBnZXRTZWNvbmRNYXRjaCgvZWRnKFtlYV18aW9zKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgICwgdmVyc2lvbklkZW50aWZpZXIgPSBnZXRGaXJzdE1hdGNoKC92ZXJzaW9uXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB0YWJsZXQgPSAvdGFibGV0L2kudGVzdCh1YSkgJiYgIS90YWJsZXQgcGMvaS50ZXN0KHVhKVxuICAgICAgLCBtb2JpbGUgPSAhdGFibGV0ICYmIC9bXi1dbW9iaS9pLnRlc3QodWEpXG4gICAgICAsIHhib3ggPSAveGJveC9pLnRlc3QodWEpXG4gICAgICAsIHJlc3VsdFxuXG4gICAgaWYgKC9vcGVyYS9pLnRlc3QodWEpKSB7XG4gICAgICAvLyAgYW4gb2xkIE9wZXJhXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSdcbiAgICAgICwgb3BlcmE6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86b3BlcmF8b3ByfG9waW9zKVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoL29wclxcL3xvcGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICAvLyBhIG5ldyBPcGVyYVxuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEnXG4gICAgICAgICwgb3BlcmE6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpvcHJ8b3Bpb3MpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9TYW1zdW5nQnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYW1zdW5nIEludGVybmV0IGZvciBBbmRyb2lkJ1xuICAgICAgICAsIHNhbXN1bmdCcm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvKD86U2Ftc3VuZ0Jyb3dzZXIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9XaGFsZS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdOQVZFUiBXaGFsZSBicm93c2VyJ1xuICAgICAgICAsIHdoYWxlOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86d2hhbGUpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL01aQnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNWiBCcm93c2VyJ1xuICAgICAgICAsIG16YnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Ok1aQnJvd3NlcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY29hc3QvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnT3BlcmEgQ29hc3QnXG4gICAgICAgICwgY29hc3Q6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpjb2FzdClbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZvY3VzL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZvY3VzJ1xuICAgICAgICAsIGZvY3VzOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Zm9jdXMpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3lhYnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdZYW5kZXggQnJvd3NlcidcbiAgICAgICwgeWFuZGV4YnJvd3NlcjogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzp5YWJyb3dzZXIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC91Y2Jyb3dzZXIvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgIG5hbWU6ICdVQyBCcm93c2VyJ1xuICAgICAgICAsIHVjYnJvd3NlcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnVjYnJvd3NlcilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXhpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTWF4dGhvbidcbiAgICAgICAgLCBtYXh0aG9uOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86bXhpb3MpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2VwaXBoYW55L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0VwaXBoYW55J1xuICAgICAgICAsIGVwaXBoYW55OiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZXBpcGhhbnkpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3B1ZmZpbi9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdQdWZmaW4nXG4gICAgICAgICwgcHVmZmluOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86cHVmZmluKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zbGVpcG5pci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTbGVpcG5pcidcbiAgICAgICAgLCBzbGVpcG5pcjogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnNsZWlwbmlyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9rLW1lbGVvbi9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdLLU1lbGVvbidcbiAgICAgICAgLCBrTWVsZW9uOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ay1tZWxlb24pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAod2luZG93c3Bob25lKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXaW5kb3dzIFBob25lJ1xuICAgICAgLCBvc25hbWU6ICdXaW5kb3dzIFBob25lJ1xuICAgICAgLCB3aW5kb3dzcGhvbmU6IHRcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlVmVyc2lvbikge1xuICAgICAgICByZXN1bHQubXNlZGdlID0gdFxuICAgICAgICByZXN1bHQudmVyc2lvbiA9IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0Lm1zaWUgPSB0XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvaWVtb2JpbGVcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9tc2llfHRyaWRlbnQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnSW50ZXJuZXQgRXhwbG9yZXInXG4gICAgICAsIG1zaWU6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86bXNpZSB8cnY6KShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNocm9tZW9zKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIG9zbmFtZTogJ0Nocm9tZSBPUydcbiAgICAgICwgY2hyb21lb3M6IHRcbiAgICAgICwgY2hyb21lQm9vazogdFxuICAgICAgLCBjaHJvbWU6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21lfGNyaW9zfGNybW8pXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoL2VkZyhbZWFdfGlvcykvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnTWljcm9zb2Z0IEVkZ2UnXG4gICAgICAsIG1zZWRnZTogdFxuICAgICAgLCB2ZXJzaW9uOiBlZGdlVmVyc2lvblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvdml2YWxkaS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdWaXZhbGRpJ1xuICAgICAgICAsIHZpdmFsZGk6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC92aXZhbGRpXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzYWlsZmlzaCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2FpbGZpc2gnXG4gICAgICAsIG9zbmFtZTogJ1NhaWxmaXNoIE9TJ1xuICAgICAgLCBzYWlsZmlzaDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zYWlsZmlzaFxccz9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2VhbW9ua2V5XFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NlYU1vbmtleSdcbiAgICAgICwgc2VhbW9ua2V5OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NlYW1vbmtleVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZpcmVmb3h8aWNld2Vhc2VsfGZ4aW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZpcmVmb3gnXG4gICAgICAsIGZpcmVmb3g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZmlyZWZveHxpY2V3ZWFzZWx8Znhpb3MpWyBcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgICAgaWYgKC9cXCgobW9iaWxlfHRhYmxldCk7W15cXCldKnJ2OltcXGRcXC5dK1xcKS9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5maXJlZm94b3MgPSB0XG4gICAgICAgIHJlc3VsdC5vc25hbWUgPSAnRmlyZWZveCBPUydcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2lsaykge1xuICAgICAgcmVzdWx0ID0gIHtcbiAgICAgICAgbmFtZTogJ0FtYXpvbiBTaWxrJ1xuICAgICAgLCBzaWxrOiB0XG4gICAgICAsIHZlcnNpb24gOiBnZXRGaXJzdE1hdGNoKC9zaWxrXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvcGhhbnRvbS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdQaGFudG9tSlMnXG4gICAgICAsIHBoYW50b206IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvcGhhbnRvbWpzXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2xpbWVyanMvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2xpbWVySlMnXG4gICAgICAgICwgc2xpbWVyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2xpbWVyanNcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9ibGFja2JlcnJ5fFxcYmJiXFxkKy9pLnRlc3QodWEpIHx8IC9yaW1cXHN0YWJsZXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQmxhY2tCZXJyeSdcbiAgICAgICwgb3NuYW1lOiAnQmxhY2tCZXJyeSBPUydcbiAgICAgICwgYmxhY2tiZXJyeTogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC9ibGFja2JlcnJ5W1xcZF0rXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh3ZWJvcykge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnV2ViT1MnXG4gICAgICAsIG9zbmFtZTogJ1dlYk9TJ1xuICAgICAgLCB3ZWJvczogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC93KD86ZWIpP29zYnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH07XG4gICAgICAvdG91Y2hwYWRcXC8vaS50ZXN0KHVhKSAmJiAocmVzdWx0LnRvdWNocGFkID0gdClcbiAgICB9XG4gICAgZWxzZSBpZiAoL2JhZGEvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQmFkYSdcbiAgICAgICwgb3NuYW1lOiAnQmFkYSdcbiAgICAgICwgYmFkYTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9kb2xmaW5cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh0aXplbikge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnVGl6ZW4nXG4gICAgICAsIG9zbmFtZTogJ1RpemVuJ1xuICAgICAgLCB0aXplbjogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp0aXplblxccz8pP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICgvcXVwemlsbGEvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUXVwWmlsbGEnXG4gICAgICAgICwgcXVwemlsbGE6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpxdXB6aWxsYSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY2hyb21pdW0vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21pdW0nXG4gICAgICAgICwgY2hyb21pdW06IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWl1bSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKyk/KS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvY2hyb21lfGNyaW9zfGNybW8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQ2hyb21lJ1xuICAgICAgICAsIGNocm9tZTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9tZXxjcmlvc3xjcm1vKVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQW5kcm9pZCdcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2FmYXJpfGFwcGxld2Via2l0L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhZmFyaSdcbiAgICAgICwgc2FmYXJpOiB0XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZSA6IGlvc2RldmljZSA9PSAnaXBob25lJyA/ICdpUGhvbmUnIDogaW9zZGV2aWNlID09ICdpcGFkJyA/ICdpUGFkJyA6ICdpUG9kJ1xuICAgICAgfVxuICAgICAgLy8gV1RGOiB2ZXJzaW9uIGlzIG5vdCBwYXJ0IG9mIHVzZXIgYWdlbnQgaW4gd2ViIGFwcHNcbiAgICAgIGlmICh2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYoL2dvb2dsZWJvdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdHb29nbGVib3QnXG4gICAgICAsIGdvb2dsZWJvdDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9nb29nbGVib3RcXC8oXFxkKyhcXC5cXGQrKSkvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6IGdldEZpcnN0TWF0Y2goL14oLiopXFwvKC4qKSAvKSxcbiAgICAgICAgdmVyc2lvbjogZ2V0U2Vjb25kTWF0Y2goL14oLiopXFwvKC4qKSAvKVxuICAgICB9O1xuICAgfVxuXG4gICAgLy8gc2V0IHdlYmtpdCBvciBnZWNrbyBmbGFnIGZvciBicm93c2VycyBiYXNlZCBvbiB0aGVzZSBlbmdpbmVzXG4gICAgaWYgKCFyZXN1bHQubXNlZGdlICYmIC8oYXBwbGUpP3dlYmtpdC9pLnRlc3QodWEpKSB7XG4gICAgICBpZiAoLyhhcHBsZSk/d2Via2l0XFwvNTM3XFwuMzYvaS50ZXN0KHVhKSkge1xuICAgICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiQmxpbmtcIlxuICAgICAgICByZXN1bHQuYmxpbmsgPSB0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiV2Via2l0XCJcbiAgICAgICAgcmVzdWx0LndlYmtpdCA9IHRcbiAgICAgIH1cbiAgICAgIGlmICghcmVzdWx0LnZlcnNpb24gJiYgdmVyc2lvbklkZW50aWZpZXIpIHtcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXJlc3VsdC5vcGVyYSAmJiAvZ2Vja29cXC8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIkdlY2tvXCJcbiAgICAgIHJlc3VsdC5nZWNrbyA9IHRcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gcmVzdWx0LnZlcnNpb24gfHwgZ2V0Rmlyc3RNYXRjaCgvZ2Vja29cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgfVxuXG4gICAgLy8gc2V0IE9TIGZsYWdzIGZvciBwbGF0Zm9ybXMgdGhhdCBoYXZlIG11bHRpcGxlIGJyb3dzZXJzXG4gICAgaWYgKCFyZXN1bHQud2luZG93c3Bob25lICYmIChhbmRyb2lkIHx8IHJlc3VsdC5zaWxrKSkge1xuICAgICAgcmVzdWx0LmFuZHJvaWQgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ0FuZHJvaWQnXG4gICAgfSBlbHNlIGlmICghcmVzdWx0LndpbmRvd3NwaG9uZSAmJiBpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdFtpb3NkZXZpY2VdID0gdFxuICAgICAgcmVzdWx0LmlvcyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnaU9TJ1xuICAgIH0gZWxzZSBpZiAobWFjKSB7XG4gICAgICByZXN1bHQubWFjID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdtYWNPUydcbiAgICB9IGVsc2UgaWYgKHhib3gpIHtcbiAgICAgIHJlc3VsdC54Ym94ID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdYYm94J1xuICAgIH0gZWxzZSBpZiAod2luZG93cykge1xuICAgICAgcmVzdWx0LndpbmRvd3MgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ1dpbmRvd3MnXG4gICAgfSBlbHNlIGlmIChsaW51eCkge1xuICAgICAgcmVzdWx0LmxpbnV4ID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdMaW51eCdcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXaW5kb3dzVmVyc2lvbiAocykge1xuICAgICAgc3dpdGNoIChzKSB7XG4gICAgICAgIGNhc2UgJ05UJzogcmV0dXJuICdOVCdcbiAgICAgICAgY2FzZSAnWFAnOiByZXR1cm4gJ1hQJ1xuICAgICAgICBjYXNlICdOVCA1LjAnOiByZXR1cm4gJzIwMDAnXG4gICAgICAgIGNhc2UgJ05UIDUuMSc6IHJldHVybiAnWFAnXG4gICAgICAgIGNhc2UgJ05UIDUuMic6IHJldHVybiAnMjAwMydcbiAgICAgICAgY2FzZSAnTlQgNi4wJzogcmV0dXJuICdWaXN0YSdcbiAgICAgICAgY2FzZSAnTlQgNi4xJzogcmV0dXJuICc3J1xuICAgICAgICBjYXNlICdOVCA2LjInOiByZXR1cm4gJzgnXG4gICAgICAgIGNhc2UgJ05UIDYuMyc6IHJldHVybiAnOC4xJ1xuICAgICAgICBjYXNlICdOVCAxMC4wJzogcmV0dXJuICcxMCdcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9TIHZlcnNpb24gZXh0cmFjdGlvblxuICAgIHZhciBvc1ZlcnNpb24gPSAnJztcbiAgICBpZiAocmVzdWx0LndpbmRvd3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldFdpbmRvd3NWZXJzaW9uKGdldEZpcnN0TWF0Y2goL1dpbmRvd3MgKChOVHxYUCkoIFxcZFxcZD8uXFxkKT8pL2kpKVxuICAgIH0gZWxzZSBpZiAocmVzdWx0LndpbmRvd3NwaG9uZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvd2luZG93cyBwaG9uZSAoPzpvcyk/XFxzPyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQubWFjKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9NYWMgT1MgWCAoXFxkKyhbX1xcLlxcc11cXGQrKSopL2kpO1xuICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL1tfXFxzXS9nLCAnLicpO1xuICAgIH0gZWxzZSBpZiAoaW9zZGV2aWNlKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9vcyAoXFxkKyhbX1xcc11cXGQrKSopIGxpa2UgbWFjIG9zIHgvaSk7XG4gICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb24ucmVwbGFjZSgvW19cXHNdL2csICcuJyk7XG4gICAgfSBlbHNlIGlmIChhbmRyb2lkKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9hbmRyb2lkWyBcXC8tXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQud2Vib3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goLyg/OndlYnxocHcpb3NcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJsYWNrYmVycnkpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3JpbVxcc3RhYmxldFxcc29zXFxzKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5iYWRhKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9iYWRhXFwvKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC50aXplbikge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvdGl6ZW5bXFwvXFxzXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfVxuICAgIGlmIChvc1ZlcnNpb24pIHtcbiAgICAgIHJlc3VsdC5vc3ZlcnNpb24gPSBvc1ZlcnNpb247XG4gICAgfVxuXG4gICAgLy8gZGV2aWNlIHR5cGUgZXh0cmFjdGlvblxuICAgIHZhciBvc01ham9yVmVyc2lvbiA9ICFyZXN1bHQud2luZG93cyAmJiBvc1ZlcnNpb24uc3BsaXQoJy4nKVswXTtcbiAgICBpZiAoXG4gICAgICAgICB0YWJsZXRcbiAgICAgIHx8IG5leHVzVGFibGV0XG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwYWQnXG4gICAgICB8fCAoYW5kcm9pZCAmJiAob3NNYWpvclZlcnNpb24gPT0gMyB8fCAob3NNYWpvclZlcnNpb24gPj0gNCAmJiAhbW9iaWxlKSkpXG4gICAgICB8fCByZXN1bHQuc2lsa1xuICAgICkge1xuICAgICAgcmVzdWx0LnRhYmxldCA9IHRcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgbW9iaWxlXG4gICAgICB8fCBpb3NkZXZpY2UgPT0gJ2lwaG9uZSdcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBvZCdcbiAgICAgIHx8IGFuZHJvaWRcbiAgICAgIHx8IG5leHVzTW9iaWxlXG4gICAgICB8fCByZXN1bHQuYmxhY2tiZXJyeVxuICAgICAgfHwgcmVzdWx0LndlYm9zXG4gICAgICB8fCByZXN1bHQuYmFkYVxuICAgICkge1xuICAgICAgcmVzdWx0Lm1vYmlsZSA9IHRcbiAgICB9XG5cbiAgICAvLyBHcmFkZWQgQnJvd3NlciBTdXBwb3J0XG4gICAgLy8gaHR0cDovL2RldmVsb3Blci55YWhvby5jb20veXVpL2FydGljbGVzL2dic1xuICAgIGlmIChyZXN1bHQubXNlZGdlIHx8XG4gICAgICAgIChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC55YW5kZXhicm93c2VyICYmIHJlc3VsdC52ZXJzaW9uID49IDE1KSB8fFxuXHRcdCAgICAocmVzdWx0LnZpdmFsZGkgJiYgcmVzdWx0LnZlcnNpb24gPj0gMS4wKSB8fFxuICAgICAgICAocmVzdWx0LmNocm9tZSAmJiByZXN1bHQudmVyc2lvbiA+PSAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYW1zdW5nQnJvd3NlciAmJiByZXN1bHQudmVyc2lvbiA+PSA0KSB8fFxuICAgICAgICAocmVzdWx0LndoYWxlICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICcxLjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQubXpicm93c2VyICYmIGNvbXBhcmVWZXJzaW9ucyhbcmVzdWx0LnZlcnNpb24sICc2LjAnXSkgPT09IDEpIHx8XG4gICAgICAgIChyZXN1bHQuZm9jdXMgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzEuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uID49IDIwLjApIHx8XG4gICAgICAgIChyZXN1bHQuc2FmYXJpICYmIHJlc3VsdC52ZXJzaW9uID49IDYpIHx8XG4gICAgICAgIChyZXN1bHQub3BlcmEgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0LmJsYWNrYmVycnkgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTAuMSlcbiAgICAgICAgfHwgKHJlc3VsdC5jaHJvbWl1bSAmJiByZXN1bHQudmVyc2lvbiA+PSAyMClcbiAgICAgICAgKSB7XG4gICAgICByZXN1bHQuYSA9IHQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA8IDEwKSB8fFxuICAgICAgICAocmVzdWx0LmNocm9tZSAmJiByZXN1bHQudmVyc2lvbiA8IDIwKSB8fFxuICAgICAgICAocmVzdWx0LmZpcmVmb3ggJiYgcmVzdWx0LnZlcnNpb24gPCAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA8IDYpIHx8XG4gICAgICAgIChyZXN1bHQub3BlcmEgJiYgcmVzdWx0LnZlcnNpb24gPCAxMC4wKSB8fFxuICAgICAgICAocmVzdWx0LmlvcyAmJiByZXN1bHQub3N2ZXJzaW9uICYmIHJlc3VsdC5vc3ZlcnNpb24uc3BsaXQoXCIuXCIpWzBdIDwgNilcbiAgICAgICAgfHwgKHJlc3VsdC5jaHJvbWl1bSAmJiByZXN1bHQudmVyc2lvbiA8IDIwKVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5jID0gdFxuICAgIH0gZWxzZSByZXN1bHQueCA9IHRcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHZhciBib3dzZXIgPSBkZXRlY3QodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnIDogJycpXG5cbiAgYm93c2VyLnRlc3QgPSBmdW5jdGlvbiAoYnJvd3Nlckxpc3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJyb3dzZXJMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYnJvd3Nlckl0ZW0gPSBicm93c2VyTGlzdFtpXTtcbiAgICAgIGlmICh0eXBlb2YgYnJvd3Nlckl0ZW09PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJJdGVtIGluIGJvd3Nlcikge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdmVyc2lvbiBwcmVjaXNpb25zIGNvdW50XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgZ2V0VmVyc2lvblByZWNpc2lvbihcIjEuMTAuM1wiKSAvLyAzXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdmVyc2lvblxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb24pIHtcbiAgICByZXR1cm4gdmVyc2lvbi5zcGxpdChcIi5cIikubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEFycmF5OjptYXAgcG9seWZpbGxcbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXl9IGFyclxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBmdW5jdGlvbiBtYXAoYXJyLCBpdGVyYXRvcikge1xuICAgIHZhciByZXN1bHQgPSBbXSwgaTtcbiAgICBpZiAoQXJyYXkucHJvdG90eXBlLm1hcCkge1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnIsIGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2goaXRlcmF0b3IoYXJyW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGJyb3dzZXIgdmVyc2lvbiB3ZWlnaHRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS44LjIuMS45MCddKSAgICAvLyAxXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4wMTAuMi4xJywgJzEuMDkuMi4xLjkwJ10pOyAgLy8gMVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjEwLjIuMSddKTsgICAgIC8vIDBcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjEwLjIuMScsICAnMS4wODAwLjInXSk7ICAgICAvLyAtMVxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheTxTdHJpbmc+fSB2ZXJzaW9ucyB2ZXJzaW9ucyB0byBjb21wYXJlXG4gICAqIEByZXR1cm4ge051bWJlcn0gY29tcGFyaXNvbiByZXN1bHRcbiAgICovXG4gIGZ1bmN0aW9uIGNvbXBhcmVWZXJzaW9ucyh2ZXJzaW9ucykge1xuICAgIC8vIDEpIGdldCBjb21tb24gcHJlY2lzaW9uIGZvciBib3RoIHZlcnNpb25zLCBmb3IgZXhhbXBsZSBmb3IgXCIxMC4wXCIgYW5kIFwiOVwiIGl0IHNob3VsZCBiZSAyXG4gICAgdmFyIHByZWNpc2lvbiA9IE1hdGgubWF4KGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbnNbMF0pLCBnZXRWZXJzaW9uUHJlY2lzaW9uKHZlcnNpb25zWzFdKSk7XG4gICAgdmFyIGNodW5rcyA9IG1hcCh2ZXJzaW9ucywgZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgIHZhciBkZWx0YSA9IHByZWNpc2lvbiAtIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbik7XG5cbiAgICAgIC8vIDIpIFwiOVwiIC0+IFwiOS4wXCIgKGZvciBwcmVjaXNpb24gPSAyKVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24gKyBuZXcgQXJyYXkoZGVsdGEgKyAxKS5qb2luKFwiLjBcIik7XG5cbiAgICAgIC8vIDMpIFwiOS4wXCIgLT4gW1wiMDAwMDAwMDAwXCJcIiwgXCIwMDAwMDAwMDlcIl1cbiAgICAgIHJldHVybiBtYXAodmVyc2lvbi5zcGxpdChcIi5cIiksIGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KDIwIC0gY2h1bmsubGVuZ3RoKS5qb2luKFwiMFwiKSArIGNodW5rO1xuICAgICAgfSkucmV2ZXJzZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gaXRlcmF0ZSBpbiByZXZlcnNlIG9yZGVyIGJ5IHJldmVyc2VkIGNodW5rcyBhcnJheVxuICAgIHdoaWxlICgtLXByZWNpc2lvbiA+PSAwKSB7XG4gICAgICAvLyA0KSBjb21wYXJlOiBcIjAwMDAwMDAwOVwiID4gXCIwMDAwMDAwMTBcIiA9IGZhbHNlIChidXQgXCI5XCIgPiBcIjEwXCIgPSB0cnVlKVxuICAgICAgaWYgKGNodW5rc1swXVtwcmVjaXNpb25dID4gY2h1bmtzWzFdW3ByZWNpc2lvbl0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHVua3NbMF1bcHJlY2lzaW9uXSA9PT0gY2h1bmtzWzFdW3ByZWNpc2lvbl0pIHtcbiAgICAgICAgaWYgKHByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgICAgIC8vIGFsbCB2ZXJzaW9uIGNodW5rcyBhcmUgc2FtZVxuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBicm93c2VyIGlzIHVuc3VwcG9ydGVkXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgYm93c2VyLmlzVW5zdXBwb3J0ZWRCcm93c2VyKHtcbiAgICogICAgIG1zaWU6IFwiMTBcIixcbiAgICogICAgIGZpcmVmb3g6IFwiMjNcIixcbiAgICogICAgIGNocm9tZTogXCIyOVwiLFxuICAgKiAgICAgc2FmYXJpOiBcIjUuMVwiLFxuICAgKiAgICAgb3BlcmE6IFwiMTZcIixcbiAgICogICAgIHBoYW50b206IFwiNTM0XCJcbiAgICogICB9KTtcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgbWluVmVyc2lvbnMgbWFwIG9mIG1pbmltYWwgdmVyc2lvbiB0byBicm93c2VyXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IFtzdHJpY3RNb2RlID0gZmFsc2VdIGZsYWcgdG8gcmV0dXJuIGZhbHNlIGlmIGJyb3dzZXIgd2Fzbid0IGZvdW5kIGluIG1hcFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBbdWFdIHVzZXIgYWdlbnQgc3RyaW5nXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc1Vuc3VwcG9ydGVkQnJvd3NlcihtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpIHtcbiAgICB2YXIgX2Jvd3NlciA9IGJvd3NlcjtcblxuICAgIC8vIG1ha2Ugc3RyaWN0TW9kZSBwYXJhbSBvcHRpb25hbCB3aXRoIHVhIHBhcmFtIHVzYWdlXG4gICAgaWYgKHR5cGVvZiBzdHJpY3RNb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgdWEgPSBzdHJpY3RNb2RlO1xuICAgICAgc3RyaWN0TW9kZSA9IHZvaWQoMCk7XG4gICAgfVxuXG4gICAgaWYgKHN0cmljdE1vZGUgPT09IHZvaWQoMCkpIHtcbiAgICAgIHN0cmljdE1vZGUgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHVhKSB7XG4gICAgICBfYm93c2VyID0gZGV0ZWN0KHVhKTtcbiAgICB9XG5cbiAgICB2YXIgdmVyc2lvbiA9IFwiXCIgKyBfYm93c2VyLnZlcnNpb247XG4gICAgZm9yICh2YXIgYnJvd3NlciBpbiBtaW5WZXJzaW9ucykge1xuICAgICAgaWYgKG1pblZlcnNpb25zLmhhc093blByb3BlcnR5KGJyb3dzZXIpKSB7XG4gICAgICAgIGlmIChfYm93c2VyW2Jyb3dzZXJdKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBtaW5WZXJzaW9uc1ticm93c2VyXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnJvd3NlciB2ZXJzaW9uIGluIHRoZSBtaW5WZXJzaW9uIG1hcCBzaG91bGQgYmUgYSBzdHJpbmc6ICcgKyBicm93c2VyICsgJzogJyArIFN0cmluZyhtaW5WZXJzaW9ucykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGJyb3dzZXIgdmVyc2lvbiBhbmQgbWluIHN1cHBvcnRlZCB2ZXJzaW9uLlxuICAgICAgICAgIHJldHVybiBjb21wYXJlVmVyc2lvbnMoW3ZlcnNpb24sIG1pblZlcnNpb25zW2Jyb3dzZXJdXSkgPCAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmljdE1vZGU7IC8vIG5vdCBmb3VuZFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGJyb3dzZXIgaXMgc3VwcG9ydGVkXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gbWluVmVyc2lvbnMgbWFwIG9mIG1pbmltYWwgdmVyc2lvbiB0byBicm93c2VyXG4gICAqIEBwYXJhbSAge0Jvb2xlYW59IFtzdHJpY3RNb2RlID0gZmFsc2VdIGZsYWcgdG8gcmV0dXJuIGZhbHNlIGlmIGJyb3dzZXIgd2Fzbid0IGZvdW5kIGluIG1hcFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBbdWFdIHVzZXIgYWdlbnQgc3RyaW5nXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBjaGVjayhtaW5WZXJzaW9ucywgc3RyaWN0TW9kZSwgdWEpIHtcbiAgICByZXR1cm4gIWlzVW5zdXBwb3J0ZWRCcm93c2VyKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSk7XG4gIH1cblxuICBib3dzZXIuaXNVbnN1cHBvcnRlZEJyb3dzZXIgPSBpc1Vuc3VwcG9ydGVkQnJvd3NlcjtcbiAgYm93c2VyLmNvbXBhcmVWZXJzaW9ucyA9IGNvbXBhcmVWZXJzaW9ucztcbiAgYm93c2VyLmNoZWNrID0gY2hlY2s7XG5cbiAgLypcbiAgICogU2V0IG91ciBkZXRlY3QgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3Qgc28gd2UgY2FuXG4gICAqIHJldXNlIGl0IHRvIHRlc3Qgb3RoZXIgdXNlciBhZ2VudHMuXG4gICAqIFRoaXMgaXMgbmVlZGVkIHRvIGltcGxlbWVudCBmdXR1cmUgdGVzdHMuXG4gICAqL1xuICBib3dzZXIuX2RldGVjdCA9IGRldGVjdDtcblxuICAvKlxuICAgKiBTZXQgb3VyIGRldGVjdCBwdWJsaWMgbWV0aG9kIHRvIHRoZSBtYWluIGJvd3NlciBvYmplY3RcbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gaW1wbGVtZW50IGJvd3NlciBpbiBzZXJ2ZXIgc2lkZVxuICAgKi9cbiAgYm93c2VyLmRldGVjdCA9IGRldGVjdDtcbiAgcmV0dXJuIGJvd3NlclxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3MsIGN1c3RvbURvY3VtZW50KSB7XG4gIHZhciBkb2MgPSBjdXN0b21Eb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgaWYgKGRvYy5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgdmFyIHNoZWV0ID0gZG9jLmNyZWF0ZVN0eWxlU2hlZXQoKVxuICAgIHNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgcmV0dXJuIHNoZWV0Lm93bmVyTm9kZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaGVhZCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBzdHlsZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgfVxuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ieVVybCA9IGZ1bmN0aW9uKHVybCkge1xuICBpZiAoZG9jdW1lbnQuY3JlYXRlU3R5bGVTaGVldCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KHVybCkub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblxuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9IHVybDtcblxuICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgcmV0dXJuIGxpbms7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2Nzc2lmeScpOyIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcbnZhciBMaWdodEJveCA9IHJlcXVpcmUoJy4vbGlnaHRib3gnKTtcbnZhciBDaGlsZFdpbmRvdyA9IHJlcXVpcmUoJy4vY2hpbGR3aW5kb3cnKTtcbnZhciBEZXZpY2UgPSByZXF1aXJlKCcuL2RldmljZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gcmVhZHkoZm4pIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJyl7XG4gICAgICAgICAgZm4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gQXBwKCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfQ09ORklHKTtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XG4gICAgICAgIHRoaXMuaXNJbml0aWF0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBudWxsO1xuICAgIH1cblxuICAgIEFwcC5ldmVudFR5cGVzID0ge1xuICAgICAgICBJTklUOiAnaW5pdCcsXG4gICAgICAgIE9QRU46ICdvcGVuJyxcbiAgICAgICAgT1BFTl9XSU5ET1c6ICdvcGVuLXdpbmRvdycsXG4gICAgICAgIE9QRU5fTElHSFRCT1g6ICdvcGVuLWxpZ2h0Ym94JyxcbiAgICAgICAgTE9BRDogJ2xvYWQnLFxuICAgICAgICBDTE9TRTogJ2Nsb3NlJyxcbiAgICAgICAgQ0xPU0VfV0lORE9XOiAnY2xvc2Utd2luZG93JyxcbiAgICAgICAgQ0xPU0VfTElHSFRCT1g6ICdjbG9zZS1saWdodGJveCcsXG4gICAgICAgIFNUQVRVUzogJ3N0YXR1cycsXG4gICAgICAgIFNUQVRVU19JTlZPSUNFOiAnc3RhdHVzLWludm9pY2UnLFxuICAgICAgICBTVEFUVVNfREVMSVZFUklORzogJ3N0YXR1cy1kZWxpdmVyaW5nJyxcbiAgICAgICAgU1RBVFVTX1RST1VCTEVEOiAnc3RhdHVzLXRyb3VibGVkJyxcbiAgICAgICAgU1RBVFVTX0RPTkU6ICdzdGF0dXMtZG9uZScsXG4gICAgICAgIFVTRVJfQ09VTlRSWTogJ3VzZXItY291bnRyeScsXG4gICAgICAgIEZDUDogJ2ZjcCcsXG4gICAgICAgIEVSUk9SOiAnZXJyb3InXG4gICAgfTtcblxuICAgIHZhciBERUZBVUxUX0NPTkZJRyA9IHtcbiAgICAgICAgYWNjZXNzX3Rva2VuOiBudWxsLFxuICAgICAgICBhY2Nlc3NfZGF0YTogbnVsbCxcbiAgICAgICAgc2FuZGJveDogZmFsc2UsXG4gICAgICAgIGxpZ2h0Ym94OiB7fSxcbiAgICAgICAgY2hpbGRXaW5kb3c6IHt9LFxuICAgICAgICBob3N0OiAnc2VjdXJlLnhzb2xsYS5jb20nLFxuICAgICAgICBpZnJhbWVPbmx5OiBmYWxzZSxcbiAgICAgICAgY29uc2VudElkOiBudWxsXG4gICAgfTtcbiAgICB2YXIgU0FOREJPWF9QQVlTVEFUSU9OX1VSTCA9ICdodHRwczovL3NhbmRib3gtc2VjdXJlLnhzb2xsYS5jb20vcGF5c3RhdGlvbjIvPyc7XG4gICAgdmFyIEVWRU5UX05BTUVTUEFDRSA9ICcueHBheXN0YXRpb24td2lkZ2V0JztcbiAgICB2YXIgQVRUUl9QUkVGSVggPSAnZGF0YS14cGF5c3RhdGlvbi13aWRnZXQtb3Blbic7XG5cbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xuICAgIEFwcC5wcm90b3R5cGUuY29uZmlnID0ge307XG4gICAgQXBwLnByb3RvdHlwZS5pc0luaXRpYXRlZCA9IGZhbHNlO1xuICAgIEFwcC5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMpO1xuXG4gICAgQXBwLnByb3RvdHlwZS5nZXRQYXltZW50VXJsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcucGF5bWVudF91cmwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5wYXltZW50X3VybDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5jb25maWcucXVlcnlQYXJhbXMgfHwge307XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHF1ZXJ5LmFjY2Vzc190b2tlbiA9IHRoaXMuY29uZmlnLmFjY2Vzc190b2tlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5LmFjY2Vzc19kYXRhID0gSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXJsV2l0aG91dFF1ZXJ5UGFyYW1zID0gdGhpcy5jb25maWcuc2FuZGJveCA/XG4gICAgICAgICAgICBTQU5EQk9YX1BBWVNUQVRJT05fVVJMIDpcbiAgICAgICAgICAgICdodHRwczovLycgKyB0aGlzLmNvbmZpZy5ob3N0ICsgJy9wYXlzdGF0aW9uMi8/JztcblxuICAgICAgICBjb25zdCBwYXltZW50VXJsID0gdXJsV2l0aG91dFF1ZXJ5UGFyYW1zICsgSGVscGVycy5wYXJhbShxdWVyeSk7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmNvbnNlbnRJZCkge1xuICAgICAgICAgICAgcmV0dXJuIEhlbHBlcnMuZ2V0UGF5bWVudFVybFdpdGhDb25zZW50SWQocGF5bWVudFVybCwgdGhpcy5jb25maWcuY29uc2VudElkKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBheW1lbnRVcmw7XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUuY2hlY2tDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX3Rva2VuKSAmJiBIZWxwZXJzLmlzRW1wdHkodGhpcy5jb25maWcuYWNjZXNzX2RhdGEpICYmIEhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5wYXltZW50X3VybCkpIHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignTm8gYWNjZXNzIHRva2VuIG9yIGFjY2VzcyBkYXRhIG9yIHBheW1lbnQgVVJMIGdpdmVuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIUhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5hY2Nlc3NfZGF0YSkgJiYgdHlwZW9mIHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdJbnZhbGlkIGFjY2VzcyBkYXRhIGZvcm1hdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5ob3N0KSkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdJbnZhbGlkIGhvc3QnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLmNoZWNrQXBwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5pc0luaXRpYXRlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0luaXRpYWxpemUgd2lkZ2V0IGJlZm9yZSBvcGVuaW5nJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXBwLnByb3RvdHlwZS50aHJvd0Vycm9yID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihtZXNzYWdlKTtcbiAgICB9O1xuXG4gICAgQXBwLnByb3RvdHlwZS50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJyk7XG4gICAgICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50T2JqZWN0LnRyaWdnZXIoZXZlbnROYW1lLCBkYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLnRyaWdnZXJDdXN0b21FdmVudCA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHtkZXRhaWw6IGRhdGF9KTsgLy8gTm90IHdvcmtpbmcgaW4gSUVcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudE5hbWUsIHRydWUsIHRydWUsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpZGdldCB3aXRoIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZShvcHRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLmlzSW5pdGlhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9DT05GSUcsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgIHZhciBjbGlja0V2ZW50TmFtZSA9ICdjbGljaycgKyBFVkVOVF9OQU1FU1BBQ0U7XG5cbiAgICAgICAgICAgIHZhciBoYW5kbGVDbGlja0V2ZW50ID0gKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbJyArIEFUVFJfUFJFRklYICsgJ10nKTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlRXZlbnQudGFyZ2V0ID09PSB0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Blbi5jYWxsKHRoaXMsIHRhcmdldEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoY2xpY2tFdmVudE5hbWUsIGhhbmRsZUNsaWNrRXZlbnQpO1xuXG4gICAgICAgICAgICB2YXIgY2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoY2xpY2tFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBjbGlja0V2ZW50LnNvdXJjZUV2ZW50ID0gZXZlbnQ7XG4gICAgICAgICAgICAgICAgYm9keUVsZW1lbnQuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIGZhbHNlKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5JTklUKTtcbiAgICAgICAgfVxuICAgICAgICByZWFkeShpbml0aWFsaXplLmJpbmQodGhpcywgb3B0aW9ucykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9wZW4gcGF5bWVudCBpbnRlcmZhY2UgKFBheVN0YXRpb24pXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNoZWNrQ29uZmlnKCk7XG4gICAgICAgIHRoaXMuY2hlY2tBcHAoKTtcblxuICAgICAgICB2YXIgdHJpZ2dlclNwbGl0U3RhdHVzID0gKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKCgoZGF0YSB8fCB7fSkucGF5bWVudEluZm8gfHwge30pLnN0YXR1cykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ludm9pY2UnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfSU5WT0lDRSwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RlbGl2ZXJpbmcnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfREVMSVZFUklORywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3Ryb3VibGVkJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX1RST1VCTEVELCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9uZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19ET05FLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdmFyIHVybCA9IHRoaXMuZ2V0UGF5bWVudFVybCgpO1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlU3RhdHVzKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgc3RhdHVzRGF0YSA9IGV2ZW50LmRldGFpbDtcbiAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVUywgc3RhdHVzRGF0YSk7XG4gICAgICAgICAgICB0cmlnZ2VyU3BsaXRTdGF0dXMoc3RhdHVzRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVVc2VyTG9jYWxlKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdXNlckNvdW50cnkgPSB7XG4gICAgICAgICAgICAgICAgdXNlcl9jb3VudHJ5OiBldmVudC5kZXRhaWwudXNlcl9jb3VudHJ5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhhdC50cmlnZ2VyQ3VzdG9tRXZlbnQoQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCB1c2VyQ291bnRyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVGY3AoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoYXQudHJpZ2dlckN1c3RvbUV2ZW50KEFwcC5ldmVudFR5cGVzLkZDUCwgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGF0LnRyaWdnZXJDdXN0b21FdmVudChBcHAuZXZlbnRUeXBlcy5FUlJPUiwgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9zdE1lc3NhZ2UgPSBudWxsO1xuICAgICAgICBpZiAoKG5ldyBEZXZpY2UpLmlzTW9iaWxlKCkgJiYgIXRoaXMuY29uZmlnLmlmcmFtZU9ubHkpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZFdpbmRvdyA9IG5ldyBDaGlsZFdpbmRvdztcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdvcGVuJywgZnVuY3Rpb24gaGFuZGxlT3BlbigpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnBvc3RNZXNzYWdlID0gY2hpbGRXaW5kb3cuZ2V0UG9zdE1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOKTtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOX1dJTkRPVyk7XG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdvcGVuJywgaGFuZGxlT3Blbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKCdsb2FkJywgZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0UpO1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkNMT1NFX1dJTkRPVyk7XG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZihBcHAuZXZlbnRUeXBlcy5VU0VSX0NPVU5UUlksIGhhbmRsZVVzZXJMb2NhbGUpO1xuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZihBcHAuZXZlbnRUeXBlcy5GQ1AsIGhhbmRsZUZjcCk7XG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKEFwcC5ldmVudFR5cGVzLkVSUk9SLCBoYW5kbGVFcnJvcik7XG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKCdjbG9zZScsIGhhbmRsZUNsb3NlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ3N0YXR1cycsIGhhbmRsZVN0YXR1cyk7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbihBcHAuZXZlbnRUeXBlcy5VU0VSX0NPVU5UUlksIGhhbmRsZVVzZXJMb2NhbGUpO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oQXBwLmV2ZW50VHlwZXMuRkNQLCBoYW5kbGVGY3ApO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oQXBwLmV2ZW50VHlwZXMuRVJST1IsIGhhbmRsZUVycm9yKTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9wZW4odXJsLCB0aGlzLmNvbmZpZy5jaGlsZFdpbmRvdyk7XG4gICAgICAgICAgICB0aGF0LmNoaWxkV2luZG93ID0gY2hpbGRXaW5kb3c7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbGlnaHRCb3ggPSBuZXcgTGlnaHRCb3goKG5ldyBEZXZpY2UpLmlzTW9iaWxlKCkgJiYgdGhpcy5jb25maWcuaWZyYW1lT25seSk7XG4gICAgICAgICAgICBsaWdodEJveC5vbignb3BlbicsIGZ1bmN0aW9uIGhhbmRsZU9wZW4oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5wb3N0TWVzc2FnZSA9IGxpZ2h0Qm94LmdldFBvc3RNZXNzYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTik7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuT1BFTl9MSUdIVEJPWCk7XG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKCdvcGVuJywgaGFuZGxlT3Blbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdsb2FkJywgZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5MT0FEKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGlnaHRCb3gub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0UpO1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkNMT1NFX0xJR0hUQk9YKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ3N0YXR1cycsIGhhbmRsZVN0YXR1cyk7XG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XG4gICAgICAgICAgICAgICAgbGlnaHRCb3gub2ZmKEFwcC5ldmVudFR5cGVzLkZDUCwgaGFuZGxlRmNwKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoQXBwLmV2ZW50VHlwZXMuRVJST1IsIGhhbmRsZUVycm9yKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaWdodEJveC5vbignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XG4gICAgICAgICAgICBsaWdodEJveC5vbihBcHAuZXZlbnRUeXBlcy5GQ1AsIGhhbmRsZUZjcCk7XG4gICAgICAgICAgICBsaWdodEJveC5vbihBcHAuZXZlbnRUeXBlcy5FUlJPUiwgaGFuZGxlRXJyb3IpO1xuICAgICAgICAgICAgbGlnaHRCb3gub3BlbkZyYW1lKHVybCwgdGhpcy5jb25maWcubGlnaHRib3gpO1xuICAgICAgICAgICAgdGhhdC5jaGlsZFdpbmRvdyA9IGxpZ2h0Qm94O1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgcGF5bWVudCBpbnRlcmZhY2UgKFBheVN0YXRpb24pXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5jbG9zZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbiBmb3Igb25lIG9yIG1vcmUgZXZlbnRzIHRvIHRoZSB3aWRnZXRcbiAgICAgKiBAcGFyYW0gZXZlbnQgT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzIChpbml0LCBvcGVuLCBsb2FkLCBjbG9zZSwgc3RhdHVzLCBzdGF0dXMtaW52b2ljZSwgc3RhdHVzLWRlbGl2ZXJpbmcsIHN0YXR1cy10cm91YmxlZCwgc3RhdHVzLWRvbmUpXG4gICAgICogQHBhcmFtIGhhbmRsZXIgQSBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZFxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0gZXZlbnQgT25lIG9yIG1vcmUgc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzXG4gICAgICogQHBhcmFtIGhhbmRsZXIgQSBoYW5kbGVyIGZ1bmN0aW9uIHByZXZpb3VzbHkgYXR0YWNoZWQgZm9yIHRoZSBldmVudChzKVxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgZGlyZWN0bHkgdG8gUGF5U3RhdGlvblxuICAgICAqIEBwYXJhbSBjb21tYW5kXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKGNvbW1hbmQsIGRhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMucG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uuc2VuZC5hcHBseSh0aGlzLnBvc3RNZXNzYWdlLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBtZXNzYWdlIGV2ZW50IGZyb20gUGF5U3RhdGlvblxuICAgICAqIEBwYXJhbSBjb21tYW5kXG4gICAgICogQHBhcmFtIGhhbmRsZXJcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLm9uTWVzc2FnZSA9IGZ1bmN0aW9uIChjb21tYW5kLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmICh0aGlzLnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnBvc3RNZXNzYWdlLm9uLmFwcGx5KHRoaXMucG9zdE1lc3NhZ2UsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIEFwcDtcbn0pKCk7XG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpO1xudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENoaWxkV2luZG93KCkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzLCB3cmFwRXZlbnRJbk5hbWVzcGFjZSk7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBDaGlsZFdpbmRvdy5fTkFNRVNQQUNFICsgJ18nICsgZXZlbnROYW1lO1xuICAgIH1cblxuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgICAgIHRhcmdldDogJ19ibGFuaydcbiAgICB9O1xuXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBudWxsO1xuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jaGlsZFdpbmRvdyA9IG51bGw7XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudCwgZGF0YSk7XG4gICAgfTtcblxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cgJiYgIXRoaXMuY2hpbGRXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBhZGRIYW5kbGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlQ2hpbGRXaW5kb3coKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vZmYoJ2Nsb3NlJywgY2xvc2VDaGlsZFdpbmRvdylcblxuICAgICAgICAgICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQuY2hpbGRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jaGlsZFdpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5vbignY2xvc2UnLCBjbG9zZUNoaWxkV2luZG93KTtcblxuICAgICAgICAgICAgLy8gQ3Jvc3Mtd2luZG93IGNvbW11bmljYXRpb25cbiAgICAgICAgICAgIHRoYXQubWVzc2FnZSA9IG5ldyBQb3N0TWVzc2FnZSh0aGF0LmNoaWxkV2luZG93KTtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignZGltZW5zaW9ucyB3aWRnZXQtZGV0ZWN0aW9uJywgZnVuY3Rpb24gaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCdsb2FkJyk7XG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZignZGltZW5zaW9ucyB3aWRnZXQtZGV0ZWN0aW9uJywgaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCd3aWRnZXQtZGV0ZWN0aW9uJywgZnVuY3Rpb24gaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoYXQubWVzc2FnZS5zZW5kKCd3aWRnZXQtZGV0ZWN0ZWQnLCB7dmVyc2lvbjogdmVyc2lvbiwgY2hpbGRXaW5kb3dPcHRpb25zOiBvcHRpb25zfSk7XG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZignd2lkZ2V0LWRldGVjdGlvbicsIGhhbmRsZVdpZGdldERldGVjdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignc3RhdHVzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ3N0YXR1cycsIGV2ZW50LmRldGFpbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcbiAgICAgICAgICAgICAgICBjbG9zZUNoaWxkV2luZG93KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbigndXNlci1jb3VudHJ5JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ3VzZXItY291bnRyeScsIGV2ZW50LmRldGFpbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignZmNwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ2ZjcCcsIGV2ZW50LmRldGFpbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vbignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudCgnZXJyb3InLCBldmVudC5kZXRhaWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoIChvcHRpb25zLnRhcmdldCkge1xuICAgICAgICAgICAgY2FzZSAnX3NlbGYnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cgPSBnbG9iYWwud2luZG93O1xuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnX3BhcmVudCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdyA9IGdsb2JhbC53aW5kb3cucGFyZW50O1xuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnX2JsYW5rJzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdyA9IGdsb2JhbC53aW5kb3cub3Blbih1cmwpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBhZGRIYW5kbGVycygpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrV2luZG93ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoaWxkV2luZG93LmNsb3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdjbG9zZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lciA9IGdsb2JhbC5zZXRUaW1lb3V0KGNoZWNrV2luZG93LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB2YXIgdGltZXIgPSBnbG9iYWwuc2V0VGltZW91dChjaGVja1dpbmRvdywgMTAwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Nsb3NlJyk7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmdldFBvc3RNZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuICAgIH07XG5cbiAgICBDaGlsZFdpbmRvdy5fTkFNRVNQQUNFID0gJ0NISUxEX1dJTkRPVyc7XG5cbiAgICByZXR1cm4gQ2hpbGRXaW5kb3c7XG59KSgpO1xuIiwidmFyIGJvd3NlciA9IHJlcXVpcmUoJ2Jvd3NlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRGV2aWNlKCkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vYmlsZSBkZXZpY2VzXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgRGV2aWNlLnByb3RvdHlwZS5pc01vYmlsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYm93c2VyLm1vYmlsZSB8fCBib3dzZXIudGFibGV0O1xuICAgIH07XG5cbiAgICByZXR1cm4gRGV2aWNlO1xufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMubmFtZSA9IFwiWHNvbGxhUGF5U3RhdGlvbldpZGdldEV4Y2VwdGlvblwiO1xuICAgIHRoaXMudG9TdHJpbmcgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgJzogJyArIHRoaXMubWVzc2FnZTtcbiAgICB9KS5iaW5kKHRoaXMpO1xufTtcbiIsImZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gdW5pcShsaXN0KSB7XG4gICAgcmV0dXJuIGxpc3QuZmlsdGVyKGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgIHJldHVybiBhLmluZGV4T2YoeCkgPT0gaVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB6aXBPYmplY3QocHJvcHMsIHZhbHVlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBwcm9wcyA/IHByb3BzLmxlbmd0aCA6IDAsXG4gICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgaWYgKGxlbmd0aCAmJiAhdmFsdWVzICYmICFBcnJheS5pc0FycmF5KHByb3BzWzBdKSkge1xuICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICB9XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZXNbaW5kZXhdO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSkge1xuICAgICAgICAgICAgcmVzdWx0W2tleVswXV0gPSBrZXlbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcGFyYW0oYSkge1xuICAgIHZhciBzID0gW107XG5cbiAgICB2YXIgYWRkID0gZnVuY3Rpb24gKGssIHYpIHtcbiAgICAgICAgdiA9IHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nID8gdigpIDogdjtcbiAgICAgICAgdiA9IHYgPT09IG51bGwgPyAnJyA6IHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdjtcbiAgICAgICAgc1tzLmxlbmd0aF0gPSBlbmNvZGVVUklDb21wb25lbnQoaykgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodik7XG4gICAgfTtcblxuICAgIHZhciBidWlsZFBhcmFtcyA9IGZ1bmN0aW9uIChwcmVmaXgsIG9iaikge1xuICAgICAgICB2YXIgaSwgbGVuLCBrZXk7XG5cbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArICdbJyArICh0eXBlb2Ygb2JqW2ldID09PSAnb2JqZWN0JyAmJiBvYmpbaV0gPyBpIDogJycpICsgJ10nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW2ldXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChTdHJpbmcob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRQYXJhbXMocHJlZml4ICsgJ1snICsga2V5ICsgJ10nLCBvYmpba2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGQocHJlZml4LCBvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYWRkKG9ialtpXS5uYW1lLCBvYmpbaV0udmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgYnVpbGRQYXJhbXMoa2V5LCBvYmpba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfTtcblxuICAgIHJldHVybiBidWlsZFBhcmFtcygnJywgYSkuam9pbignJicpO1xufTtcblxuXG5mdW5jdGlvbiBvbmNlKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBmKGFyZ3VtZW50cyk7XG4gICAgICAgIGYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhZGRFdmVudE9iamVjdChjb250ZXh0LCB3cmFwRXZlbnRJbk5hbWVzcGFjZSkge1xuICAgIHZhciBkdW1teVdyYXBwZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50XG4gICAgfTtcbiAgICB2YXIgd3JhcEV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZSB8fCBkdW1teVdyYXBwZXI7XG4gICAgdmFyIGV2ZW50c0xpc3QgPSBbXTtcbiAgICB2YXIgaGFuZGxlcnMgPSBuZXcgV2Vha01hcCgpO1xuXG4gICAgZnVuY3Rpb24gaXNTdHJpbmdDb250YWluZWRTcGFjZShzdHIpIHtcbiAgICAgICAgcmV0dXJuIC8gLy50ZXN0KHN0cilcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0cmlnZ2VyOiAoZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnRJbk5hbWVzcGFjZSwge2RldGFpbDogZGF0YX0pOyAvLyBOb3Qgd29ya2luZyBpbiBJRVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudEluTmFtZXNwYWNlLCB0cnVlLCB0cnVlLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9KS5iaW5kKGNvbnRleHQpLFxuICAgICAgICBvbjogKGZ1bmN0aW9uIChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgZnVuY3Rpb24gYWRkRXZlbnQoZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyRGVjb3JhdG9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZShldmVudCwgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBoYW5kbGVycy5zZXQoaGFuZGxlLCBoYW5kbGVyRGVjb3JhdG9yKTtcblxuICAgICAgICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZXJEZWNvcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGV2ZW50c0xpc3QucHVzaCh7bmFtZTogZXZlbnRJbk5hbWVzcGFjZSwgaGFuZGxlOiBoYW5kbGVyRGVjb3JhdG9yLCBvcHRpb25zOiBvcHRpb25zfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRzID0gZXZlbnROYW1lLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnNlZEV2ZW50TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRFdmVudChwYXJzZWRFdmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRFdmVudChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuYmluZChjb250ZXh0KSxcblxuICAgICAgICBvZmY6IChmdW5jdGlvbiAoZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZkFsbEV2ZW50cyA9ICFldmVudE5hbWUgJiYgIWhhbmRsZSAmJiAhb3B0aW9ucztcblxuICAgICAgICAgICAgaWYgKG9mZkFsbEV2ZW50cykge1xuICAgICAgICAgICAgICAgIGV2ZW50c0xpc3QuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudC5uYW1lLCBldmVudC5oYW5kbGUsIGV2ZW50Lm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmVtb3ZlRXZlbnQoZXZlbnROYW1lLCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyRGVjb3JhdG9yID0gaGFuZGxlcnMuZ2V0KGhhbmRsZSk7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50SW5OYW1lc3BhY2UsIGhhbmRsZXJEZWNvcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGV2ZW50c0xpc3QgPSBldmVudHNMaXN0LmZpbHRlcihmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50Lm5hbWUgIT09IGV2ZW50SW5OYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRzID0gZXZlbnROYW1lLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnNlZEV2ZW50TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVFdmVudChwYXJzZWRFdmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuYmluZChjb250ZXh0KVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldFBheW1lbnRVcmxXaXRoQ29uc2VudElkKHVybCwgY29uc2VudElkKSB7XG4gICAgbGV0IHBheW1lbnRVcmwgPSBuZXcgVVJMKHVybCk7XG5cbiAgICBwYXltZW50VXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ2NvbnNlbnRJZCcsIGNvbnNlbnRJZCk7XG5cbiAgICByZXR1cm4gcGF5bWVudFVybC50b1N0cmluZygpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGFkZEV2ZW50T2JqZWN0OiBhZGRFdmVudE9iamVjdCxcbiAgICBpc0VtcHR5OiBpc0VtcHR5LFxuICAgIHVuaXE6IHVuaXEsXG4gICAgemlwT2JqZWN0OiB6aXBPYmplY3QsXG4gICAgcGFyYW06IHBhcmFtLFxuICAgIG9uY2U6IG9uY2UsXG4gICAgZ2V0UGF5bWVudFVybFdpdGhDb25zZW50SWQ6IGdldFBheW1lbnRVcmxXaXRoQ29uc2VudElkXG59XG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoJy4vdmVyc2lvbicpO1xudmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBQb3N0TWVzc2FnZSA9IHJlcXVpcmUoJy4vcG9zdG1lc3NhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExpZ2h0Qm94KGlzTW9iaWxlKSB7XG4gICAgICAgIHJlcXVpcmUoJy4vc3R5bGVzL2xpZ2h0Ym94LnNjc3MnKTtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcywgd3JhcEV2ZW50SW5OYW1lc3BhY2UpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBpc01vYmlsZSA/IERFRkFVTFRfT1BUSU9OU19NT0JJTEUgOiBERUZBVUxUX09QVElPTlM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIENMQVNTX1BSRUZJWCA9ICd4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xuICAgIHZhciBDT01NT05fT1BUSU9OUyA9IHtcbiAgICAgICAgekluZGV4OiAxMDAwLFxuICAgICAgICBvdmVybGF5T3BhY2l0eTogJy42JyxcbiAgICAgICAgb3ZlcmxheUJhY2tncm91bmQ6ICcjMDAwMDAwJyxcbiAgICAgICAgY29udGVudEJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgICAgICAgY2xvc2VCeUtleWJvYXJkOiB0cnVlLFxuICAgICAgICBjbG9zZUJ5Q2xpY2s6IHRydWUsXG4gICAgICAgIG1vZGFsOiBmYWxzZSxcbiAgICAgICAgc3Bpbm5lcjogJ3hzb2xsYScsXG4gICAgICAgIHNwaW5uZXJDb2xvcjogbnVsbCxcbiAgICAgICAgc3Bpbm5lclVybDogbnVsbCxcbiAgICAgICAgc3Bpbm5lclJvdGF0aW9uUGVyaW9kOiAwXG4gICAgfTtcbiAgICB2YXIgREVGQVVMVF9PUFRJT05TID0gT2JqZWN0LmFzc2lnbih7fSwgQ09NTU9OX09QVElPTlMsIHtcbiAgICAgICAgd2lkdGg6IG51bGwsXG4gICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICBjb250ZW50TWFyZ2luOiAnMTBweCdcbiAgICB9KTtcbiAgICB2YXIgREVGQVVMVF9PUFRJT05TX01PQklMRSA9IE9iamVjdC5hc3NpZ24oe30sIENPTU1PTl9PUFRJT05TLCB7XG4gICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICBjb250ZW50TWFyZ2luOiAnMHB4J1xuICAgIH0pO1xuXG4gICAgdmFyIFNQSU5ORVJTID0ge1xuICAgICAgICB4c29sbGE6IHJlcXVpcmUoJy4vc3Bpbm5lcnMveHNvbGxhLnN2ZycpLFxuICAgICAgICByb3VuZDogcmVxdWlyZSgnLi9zcGlubmVycy9yb3VuZC5zdmcnKSxcbiAgICAgICAgbm9uZTogJyAnXG4gICAgfTtcblxuICAgIHZhciBNSU5fUFNfRElNRU5TSU9OUyA9IHtcbiAgICAgICAgaGVpZ2h0OiA1MDAsXG4gICAgICAgIHdpZHRoOiA2MDBcbiAgICB9O1xuXG4gICAgdmFyIGhhbmRsZUtleXVwRXZlbnROYW1lID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoJ2tleXVwJyk7XG4gICAgdmFyIGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKCdyZXNpemUnKTtcblxuICAgIHZhciBoYW5kbGVHbG9iYWxLZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgY2xpY2tFdmVudC5zb3VyY2VFdmVudCA9IGV2ZW50O1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlU3BlY2lmaWNLZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5zb3VyY2VFdmVudC53aGljaCA9PSAyNykge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlR2xvYmFsUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXNpemVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICByZXNpemVFdmVudC5pbml0RXZlbnQoaGFuZGxlUmVzaXplRXZlbnROYW1lLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQocmVzaXplRXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gTGlnaHRCb3guX05BTUVTUEFDRSArICdfJyArIGV2ZW50TmFtZTtcbiAgICB9XG5cbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xuICAgIExpZ2h0Qm94LnByb3RvdHlwZS50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlci5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUubWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoOiBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9kZXRlY3Qtc2Nyb2xsYmFyLXdpZHRoXG4gICAgICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JvbGxEaXYuY2xhc3NMaXN0LmFkZChcInNjcm9sbGJhci1tZWFzdXJlXCIpO1xuICAgICAgICBzY3JvbGxEaXYuc2V0QXR0cmlidXRlKFwic3R5bGVcIixcbiAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICtcbiAgICAgICAgICAgIFwidG9wOiAtOTk5OXB4XCIgK1xuICAgICAgICAgICAgXCJ3aWR0aDogNTBweFwiICtcbiAgICAgICAgICAgIFwiaGVpZ2h0OiA1MHB4XCIgK1xuICAgICAgICAgICAgXCJvdmVyZmxvdzogc2Nyb2xsXCJcbiAgICAgICAgKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XG5cbiAgICAgICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcm9sbERpdik7XG5cbiAgICAgICAgcmV0dXJuIHNjcm9sbGJhcldpZHRoO1xuICAgIH07XG5cbiAgICAvKiogUHVibGljIE1lbWJlcnMgKiovXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9wZW5GcmFtZSA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgdmFyIEhhbmRsZUJvdW5kU3BlY2lmaWNLZXl1cCA9IGhhbmRsZVNwZWNpZmljS2V5dXAuYmluZCh0aGlzKTtcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICB2YXIgc3Bpbm5lciA9IG9wdGlvbnMuc3Bpbm5lciA9PT0gJ2N1c3RvbScgJiYgISFvcHRpb25zLnNwaW5uZXJVcmwgP1xuICAgICAgICAgICAgJzxpbWcgY2xhc3M9XCJzcGlubmVyLWN1c3RvbVwiIHNyYz1cIicgKyBlbmNvZGVVUkkob3B0aW9ucy5zcGlubmVyVXJsKSArICdcIiAvPicgOiBTUElOTkVSU1tvcHRpb25zLnNwaW5uZXJdIHx8IE9iamVjdC52YWx1ZXMoU1BJTk5FUlMpWzBdO1xuXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgICAgICAgICAgdmFyIGhvc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhvc3QuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4O1xuXG4gICAgICAgICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgb3ZlcmxheS5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLW92ZXJsYXknO1xuXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnQnICsgJyAnICsgc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50X19oaWRkZW4nO1xuXG4gICAgICAgICAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgICAgICBpZnJhbWUuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50LWlmcmFtZSc7XG4gICAgICAgICAgICBpZnJhbWUuc3JjID0gc2V0dGluZ3MudXJsO1xuICAgICAgICAgICAgaWZyYW1lLmZyYW1lQm9yZGVyID0gJzAnO1xuICAgICAgICAgICAgaWZyYW1lLmFsbG93RnVsbHNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBpZnJhbWUuYWxsb3cgPSAncGF5bWVudCc7XG5cbiAgICAgICAgICAgIHZhciBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBzcGlubmVyLmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctc3Bpbm5lcic7XG4gICAgICAgICAgICBzcGlubmVyLmlubmVySFRNTCA9IHNldHRpbmdzLnNwaW5uZXI7XG5cbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblxuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChvdmVybGF5KTtcbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKHNwaW5uZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gaG9zdDtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94RWxlbWVudCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgIHByZWZpeDogQ0xBU1NfUFJFRklYLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBzcGlubmVyOiBzcGlubmVyXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGlnaHRCb3hPdmVybGF5RWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctb3ZlcmxheScpO1xuICAgICAgICB2YXIgbGlnaHRCb3hDb250ZW50RWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctY29udGVudCcpO1xuICAgICAgICB2YXIgbGlnaHRCb3hJZnJhbWVFbGVtZW50ID0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctY29udGVudC1pZnJhbWUnKTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLXNwaW5uZXInKTtcblxuICAgICAgICB2YXIgcHNEaW1lbnNpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpdGhEZWZhdWx0UFhVbml0KE1JTl9QU19ESU1FTlNJT05TLndpZHRoKSxcbiAgICAgICAgICAgIGhlaWdodDogd2l0aERlZmF1bHRQWFVuaXQoTUlOX1BTX0RJTUVOU0lPTlMuaGVpZ2h0KVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHdpdGhEZWZhdWx0UFhVbml0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgaXNTdHJpbmdXaXRob3V0VW5pdCA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgU3RyaW5nKHBhcnNlRmxvYXQodmFsdWUpKS5sZW5ndGggPT09IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ1dpdGhvdXRVbml0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJ3B4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgKyAncHgnIDogdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIGxpZ2h0Qm94RWxlbWVudC5zdHlsZS56SW5kZXggPSBvcHRpb25zLnpJbmRleDtcblxuICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBvcHRpb25zLm92ZXJsYXlPcGFjaXR5O1xuICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMub3ZlcmxheUJhY2tncm91bmQ7XG5cbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLmNvbnRlbnRCYWNrZ3JvdW5kO1xuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLm1hcmdpbiA9IHdpdGhEZWZhdWx0UFhVbml0KG9wdGlvbnMuY29udGVudE1hcmdpbik7XG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSBvcHRpb25zLndpZHRoID8gd2l0aERlZmF1bHRQWFVuaXQob3B0aW9ucy53aWR0aCkgOiAnYXV0byc7XG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyB3aXRoRGVmYXVsdFBYVW5pdChvcHRpb25zLmhlaWdodCkgOiAnYXV0byc7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc3Bpbm5lckNvbG9yKSB7XG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BhdGgnKS5zdHlsZS5maWxsID0gb3B0aW9ucy5zcGlubmVyQ29sb3I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5zcGlubmVyID09PSAnY3VzdG9tJykge1xuICAgICAgICAgICAgdmFyIHNwaW5uZXJDdXN0b20gPSBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyLWN1c3RvbScpO1xuICAgICAgICAgICAgc3Bpbm5lckN1c3RvbS5zdHlsZVsnLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb24nXSA9IG9wdGlvbnMuc3Bpbm5lclJvdGF0aW9uUGVyaW9kICsgJ3M7JztcbiAgICAgICAgICAgIHNwaW5uZXJDdXN0b20uc3R5bGVbJ2FuaW1hdGlvbi1kdXJhdGlvbiddID0gb3B0aW9ucy5zcGlubmVyUm90YXRpb25QZXJpb2QgKyAnczsnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUNsaWNrKSB7XG4gICAgICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQobGlnaHRCb3hFbGVtZW50KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5jbG9zZUJ5S2V5Ym9hcmQpIHtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgSGFuZGxlQm91bmRTcGVjaWZpY0tleXVwKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVHbG9iYWxLZXl1cCwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNob3dDb250ZW50ID0gSGVscGVycy5vbmNlKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBoaWRlU3Bpbm5lcihvcHRpb25zKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19QUkVGSVggKyAnLWNvbnRlbnRfX2hpZGRlbicpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2xvYWQnKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cblx0XHR2YXIgZGV0ZWN0T1MgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBwbGF0Zm9ybSA9IG5hdmlnYXRvci5wbGF0Zm9ybS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0Y29uc3QgdXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHRpZiAoL3dpbmRvd3MgcGhvbmUvLnRlc3QodXNlckFnZW50KSkgcmV0dXJuIFwiV2luZG93cyBQaG9uZVwiO1xuXHRcdFx0aWYgKC93aW4vLnRlc3QocGxhdGZvcm0pKSByZXR1cm4gXCJXaW5kb3dzXCI7XG5cdFx0XHRpZiAoL21hYy8udGVzdChwbGF0Zm9ybSkpIHJldHVybiBcIm1hY09TXCI7XG5cdFx0XHRpZiAoL2xpbnV4Ly50ZXN0KHBsYXRmb3JtKSkgcmV0dXJuIFwiTGludXhcIjtcblx0XHRcdGlmICgvaXBob25lfGlwYWR8aXBvZC8udGVzdCh1c2VyQWdlbnQpKSByZXR1cm4gXCJpT1NcIjtcblx0XHRcdGlmICgvYW5kcm9pZC8udGVzdCh1c2VyQWdlbnQpKSByZXR1cm4gXCJBbmRyb2lkXCI7XG5cblx0XHRcdHJldHVybiBcIlVua25vd24gT1NcIjtcblx0XHR9O1xuXG5cdFx0dmFyIGxpZ2h0Qm94UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCA/IG9wdGlvbnMud2lkdGggOiBwc0RpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyBvcHRpb25zLmhlaWdodCA6IHBzRGltZW5zaW9ucy5oZWlnaHQ7XG5cbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzhweCc7XG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gd2l0aERlZmF1bHRQWFVuaXQod2lkdGgpO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSB3aXRoRGVmYXVsdFBYVW5pdChoZWlnaHQpO1xuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGggPSBsaWdodEJveEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gbGlnaHRCb3hFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IG91dGVyV2lkdGgobGlnaHRCb3hDb250ZW50RWxlbWVudCksXG4gICAgICAgICAgICAgICAgY29udGVudEhlaWdodCA9IG91dGVySGVpZ2h0KGxpZ2h0Qm94Q29udGVudEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB2YXIgaG9yTWFyZ2luID0gY29udGVudFdpZHRoIC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgICB2ZXJ0TWFyZ2luID0gY29udGVudEhlaWdodCAtIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgd2lkdGhBZnRlclJlc2l6ZSA9IGNvbnRhaW5lcldpZHRoIC0gaG9yTWFyZ2luO1xuXG4gICAgICAgICAgICBpZiAod2lkdGhBZnRlclJlc2l6ZSA+IGNvbnRlbnRXaWR0aCkge1xuICAgICAgICAgICAgICAgIHdpZHRoQWZ0ZXJSZXNpemUgPSBjb250ZW50V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3aWR0aEFmdGVyUmVzaXplID4gY29udGFpbmVyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICB3aWR0aEFmdGVyUmVzaXplID0gY29udGFpbmVyV2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBoZWlnaHRBZnRlclJlc2l6ZSA9IGNvbnRhaW5lckhlaWdodCAtIHZlcnRNYXJnaW47XG5cbiAgICAgICAgICAgIGlmIChoZWlnaHRBZnRlclJlc2l6ZSA+IGNvbnRlbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRBZnRlclJlc2l6ZSA9IGNvbnRlbnRIZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoZWlnaHRBZnRlclJlc2l6ZSA+IGNvbnRhaW5lckhlaWdodCkge1xuICAgICAgICAgICAgICAgIGhlaWdodEFmdGVyUmVzaXplID0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG5cdFx0XHR2YXIgaXNJb3MgPSBkZXRlY3RPUygpID09PSBcImlPU1wiO1xuXG5cdFx0XHR2YXIgaXNCcm93c2VyV2l0aFJlc2l6ZUlzc3VlID0gL2Z4aW9zfGNyaW9zfG9wdC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICAgICAgICB2YXIgaXNGaXJlZm94T3JPcGVyYVdpdGhSZXNpemVJc3N1ZSA9IC9meGlvc3xvcHQvaS50ZXN0KFxuICAgICAgICAgICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAgICAgICAgICk7XG5cblx0XHRcdGlmIChpc0lvcyAmJiBpc0Jyb3dzZXJXaXRoUmVzaXplSXNzdWUpIHtcblx0XHRcdFx0bGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS53aWR0aCA9IFwiMTAwdndcIjtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICogQnJvd3NlcnMgbGlrZSBGaXJlZm94IGFuZCBPcGVyYSBkaXNwbGF5IFBheSBTdGF0aW9uIGNvcnJlY3RseSB3aGVuIHRoZSBoZWlnaHQgaXMgc2V0IHRvIDEwMHZoLlxuICAgICAgICAgICAgICAgICogSG93ZXZlciwgR29vZ2xlIENocm9tZSByZXN0cmljdHMgdmVydGljYWwgc2Nyb2xsaW5nIG9mIFBheSBTdGF0aW9uIGF0IHRoYXQgaGVpZ2h0LlxuICAgICAgICAgICAgICAgICogVGhyb3VnaCBleHBlcmltZW50YXRpb24sIGEgdmFsdWUgb2YgOTB2aCB3YXMgZm91bmQgdG8gd29yayBiZXR0ZXIgZm9yIENocm9tZS5cbiAgICAgICAgICAgICAgICAqICovXG5cdFx0XHRcdGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaXNGaXJlZm94T3JPcGVyYVdpdGhSZXNpemVJc3N1ZVxuXHRcdFx0XHRcdD8gXCIxMDB2aFwiXG5cdFx0XHRcdFx0OiBcIjkwdmhcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPVxuXHRcdFx0XHRcdHdpdGhEZWZhdWx0UFhVbml0KHdpZHRoQWZ0ZXJSZXNpemUpO1xuXHRcdFx0XHRsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9XG5cdFx0XHRcdFx0d2l0aERlZmF1bHRQWFVuaXQoaGVpZ2h0QWZ0ZXJSZXNpemUpO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICB2YXIgbGVmdE9mZnNldCA9ICgod2luZG93LmlubmVyV2lkdGggLSB3aWR0aEFmdGVyUmVzaXplKSAvIDIpIC0gKGhvck1hcmdpbiAvIDIpO1xuICAgICAgICAgICAgdmFyIHRvcE9mZnNldCA9ICgod2luZG93LmlubmVySGVpZ2h0IC0gaGVpZ2h0QWZ0ZXJSZXNpemUpIC8gMikgIC0gKHZlcnRNYXJnaW4gLyAyKTtcblxuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5sZWZ0ID0gd2l0aERlZmF1bHRQWFVuaXQoTWF0aC5tYXgobGVmdE9mZnNldCwgMCkpO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS50b3AgPSB3aXRoRGVmYXVsdFBYVW5pdChNYXRoLm1heCh0b3BPZmZzZXQsIDApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBvdXRlcldpZHRoKGVsKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG4gICAgICAgICAgICB3aWR0aCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0KSArIHBhcnNlSW50KHN0eWxlLm1hcmdpblJpZ2h0KTtcbiAgICAgICAgICAgIHJldHVybiB3aWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG91dGVySGVpZ2h0KGVsKSB7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG5cbiAgICAgICAgICAgIGhlaWdodCArPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3ApICsgcGFyc2VJbnQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYm9keVN0eWxlcztcbiAgICAgICAgdmFyIGhpZGVTY3JvbGxiYXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYm9keVN0eWxlcyA9IEhlbHBlcnMuemlwT2JqZWN0KFsnb3ZlcmZsb3cnLCAncGFkZGluZ1JpZ2h0J10ubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2tleSwgZ2V0Q29tcHV0ZWRTdHlsZShib2R5RWxlbWVudClba2V5XV07XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKGdldENvbXB1dGVkU3R5bGUoYm9keUVsZW1lbnQpWydwYWRkaW5nUmlnaHQnXSB8fCAwKSwgMTApO1xuICAgICAgICAgICAgYm9keUVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IHdpdGhEZWZhdWx0UFhVbml0KGJvZHlQYWQgKyB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKSk7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdmFyIHJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhib2R5U3R5bGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZVtrZXldID0gYm9keVN0eWxlc1trZXldO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNob3dTcGlubmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaGlkZVNwaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxvYWRUaW1lcjtcbiAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdGltZW91dCA9ICEob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkgPyAob3B0aW9ucy5yZXNpemVUaW1lb3V0IHx8IDMwMDAwKSA6IDEwMDA7IC8vIDMwMDAwIGlmIHBzRGltZW5zaW9ucyB3aWxsIG5vdCBhcnJpdmUgYW5kIGN1c3RvbSB0aW1lb3V0IGlzIG5vdCBwcm92aWRlZFxuICAgICAgICAgICAgbG9hZFRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XG4gICAgICAgICAgICAgICAgc2hvd0NvbnRlbnQoKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICAgICAgbGlnaHRCb3hJZnJhbWVFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBoYW5kbGVMb2FkKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgaWZyYW1lV2luZG93ID0gbGlnaHRCb3hJZnJhbWVFbGVtZW50LmNvbnRlbnRXaW5kb3cgfHwgbGlnaHRCb3hJZnJhbWVFbGVtZW50O1xuXG4gICAgICAgIC8vIENyb3NzLXdpbmRvdyBjb21tdW5pY2F0aW9uXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG5ldyBQb3N0TWVzc2FnZShpZnJhbWVXaW5kb3cpO1xuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveFJlc2l6ZSgpO1xuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2RpbWVuc2lvbnMnLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBldmVudC5kZXRhaWw7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZGltZW5zaW9ucykge1xuICAgICAgICAgICAgICAgICAgICBwc0RpbWVuc2lvbnMgPSBIZWxwZXJzLnppcE9iamVjdChbJ3dpZHRoJywgJ2hlaWdodCddLm1hcChmdW5jdGlvbiAoZGltKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2RpbSwgTWF0aC5tYXgoTUlOX1BTX0RJTUVOU0lPTlNbZGltXSB8fCAwLCBkYXRhLmRpbWVuc2lvbnNbZGltXSB8fCAwKSArICdweCddO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hvd0NvbnRlbnQoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3dpZGdldC1kZXRlY3Rpb24nLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBsaWdodEJveE9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignd2lkZ2V0LWNsb3NlJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdjbG9zZScsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignc3RhdHVzJywgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ3N0YXR1cycsIGV2ZW50LmRldGFpbCk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3VzZXItY291bnRyeScsIChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCd1c2VyLWNvdW50cnknLCBldmVudC5kZXRhaWwpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdmY3AnLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnZmNwJywgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignZXJyb3InLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnZXJyb3InLCBldmVudC5kZXRhaWwpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBSZXNpemVcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoaGFuZGxlUmVzaXplRXZlbnROYW1lLCBsaWdodEJveFJlc2l6ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVHbG9iYWxSZXNpemUpO1xuXG4gICAgICAgIC8vIENsZWFuIHVwIGFmdGVyIGNsb3NlXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZShldmVudCkge1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9mZigpO1xuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgSGFuZGxlQm91bmRTcGVjaWZpY0tleXVwKVxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVHbG9iYWxLZXl1cCk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVHbG9iYWxSZXNpemUpXG5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSwgbGlnaHRCb3hSZXNpemUpO1xuICAgICAgICAgICAgbGlnaHRCb3hFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobGlnaHRCb3hFbGVtZW50KTtcbiAgICAgICAgICAgIHJlc2V0U2Nyb2xsYmFyKCk7XG4gICAgICAgICAgICB0aGF0Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNob3dTcGlubmVyKCk7XG4gICAgICAgIGhpZGVTY3JvbGxiYXIoKTtcbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ29wZW4nKTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLmNsb3NlRnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm1vZGFsKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VGcmFtZSgpO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24uYXBwbHkodGhpcy5ldmVudE9iamVjdCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYuYXBwbHkodGhpcy5ldmVudE9iamVjdCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLmdldFBvc3RNZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5fTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gnO1xuXG4gICAgcmV0dXJuIExpZ2h0Qm94O1xufSkoKTtcbiIsImZ1bmN0aW9uIG9iamVjdEFzc2lnbigpIHtcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnbiBQb2x5ZmlsbFxuICBPYmplY3QuYXNzaWdufHxPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LFwiYXNzaWduXCIse2VudW1lcmFibGU6ITEsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOmZ1bmN0aW9uKGUscil7XCJ1c2Ugc3RyaWN0XCI7aWYobnVsbD09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0XCIpO2Zvcih2YXIgdD1PYmplY3QoZSksbj0xO248YXJndW1lbnRzLmxlbmd0aDtuKyspe3ZhciBvPWFyZ3VtZW50c1tuXTtpZihudWxsIT1vKWZvcih2YXIgYT1PYmplY3Qua2V5cyhPYmplY3QobykpLGM9MCxiPWEubGVuZ3RoO2M8YjtjKyspe3ZhciBpPWFbY10sbD1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8saSk7dm9pZCAwIT09bCYmbC5lbnVtZXJhYmxlJiYodFtpXT1vW2ldKX19cmV0dXJuIHR9fSk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Rm9yRWFjaCgpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2h8fChBcnJheS5wcm90b3R5cGUuZm9yRWFjaD1mdW5jdGlvbihyLG8pe3ZhciB0LG47aWYobnVsbD09dGhpcyl0aHJvdyBuZXcgVHlwZUVycm9yKFwiIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZFwiKTt2YXIgZT1PYmplY3QodGhpcyksaT1lLmxlbmd0aD4+PjA7aWYoXCJmdW5jdGlvblwiIT10eXBlb2Ygcil0aHJvdyBuZXcgVHlwZUVycm9yKHIrXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7Zm9yKGFyZ3VtZW50cy5sZW5ndGg+MSYmKHQ9byksbj0wO248aTspe3ZhciBmO24gaW4gZSYmKGY9ZVtuXSxyLmNhbGwodCxmLG4sZSkpLG4rK319KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlQb2x5ZmlsbHMoKSB7XG4gIG9iamVjdEFzc2lnbigpO1xuICBhcnJheUZvckVhY2goKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFwcGx5UG9seWZpbGxzOiBhcHBseVBvbHlmaWxsc1xufVxuIiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gUG9zdE1lc3NhZ2UuX05BTUVTUEFDRSArICdfJyArIGV2ZW50TmFtZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBQb3N0TWVzc2FnZSh3aW5kb3cpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcywgd3JhcEV2ZW50SW5OYW1lc3BhY2UpO1xuICAgICAgICB0aGlzLmxpbmtlZFdpbmRvdyA9IHdpbmRvdztcblxuICAgICAgICBnbG9iYWwud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgZ2xvYmFsLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlICE9PSB0aGlzLmxpbmtlZFdpbmRvdykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnQuZGF0YSA9PT0gJ3N0cmluZycgJiYgZ2xvYmFsLkpTT04gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBnbG9iYWwuSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyKG1lc3NhZ2UuY29tbWFuZCwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqIFByaXZhdGUgTWVtYmVycyAqKi9cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUuZXZlbnRPYmplY3QgPSBudWxsO1xuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5saW5rZWRXaW5kb3cgPSBudWxsO1xuXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xuICAgIFBvc3RNZXNzYWdlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oY29tbWFuZCwgZGF0YSwgdGFyZ2V0T3JpZ2luKSB7XG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRPcmlnaW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGFyZ2V0T3JpZ2luID0gJyonO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmxpbmtlZFdpbmRvdyB8fCB0aGlzLmxpbmtlZFdpbmRvdy5wb3N0TWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IGdsb2JhbC53aW5kb3cuSlNPTiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5saW5rZWRXaW5kb3cucG9zdE1lc3NhZ2UoZ2xvYmFsLkpTT04uc3RyaW5naWZ5KHtkYXRhOiBkYXRhLCBjb21tYW5kOiBjb21tYW5kfSksIHRhcmdldE9yaWdpbik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZSwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIFBvc3RNZXNzYWdlLl9OQU1FU1BBQ0UgPSAnUE9TVF9NRVNTQUdFJztcblxuXG4gICAgcmV0dXJuIFBvc3RNZXNzYWdlO1xufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIHdpZHRoPVxcXCI0N3B4XFxcIiBoZWlnaHQ9XFxcIjQ3cHhcXFwiIGNsYXNzPVxcXCJzcGlubmVyLXJvdW5kXFxcIj48cGF0aCBkPVxcXCJNNC43ODUyNzI4LDEwLjQyMTA4NzUgQzIuOTQxMTE2NjQsMTMuMDU1MjE5NyAxLjYzNzc3MTA5LDE2LjA5NDYxMDYgMS4wMzc1Mzk1NiwxOS4zNzY4NTU2IEw1LjE2NjM4OTcxLDE5LjM3Njg1NTYgQzUuNjQyOTYxNSwxNy4xODc1NTQgNi41MDEyNTI0MywxNS4xMzkxNjQgNy42Njc2ODg5OSwxMy4zMDUzMDUgTDUuOTU1NzI0MjgsMTEuNTkyMjcwNSBMNC43ODUyNzI4LDEwLjQyMTA4NzUgTDQuNzg1MjcyOCwxMC40MjEwODc1IFogTTEwLjQ2OTMwNDgsNC43NDU2NTYxNSBDMTMuMTI3NDg3MywyLjg5MDgwNjEgMTYuMTk2NTk3NiwxLjU4Njc0NjQ4IDE5LjUxMDAxNjEsMSBMMTkuNTEwMDE2MSw0Ljk5NTIzOTM0IEMxNy4yNzEwOTIzLDUuNDg3OTc3ODIgMTUuMTgwMzE5Myw2LjM4MDg1MjkgMTMuMzE2NjkwNyw3LjU5NDgyMTUzIEwxMS42MzM3MzM5LDUuOTEwODEyOTMgTDEwLjQ2OTMwNDgsNC43NDU2NTYxNSBMMTAuNDY5MzA0OCw0Ljc0NTY1NjE1IFogTTQyLjI0MjYzMDksMzYuNTM4ODM4NiBDNDQuMTExMjc4MiwzMy44NTc1MDE2IDQ1LjQyMDY0NjEsMzAuNzU4MTUwNCA0NiwyNy40MTE3MjY5IEw0MS45NDQxMjExLDI3LjQxMTcyNjkgQzQxLjQ1Mjc5NDUsMjkuNjYxODkyNiA0MC41NTgzNjkyLDMxLjc2MjkxMSAzOS4zNDA0NDEyLDMzLjYzNDkzNTYgTDQxLjAzMzIzNDcsMzUuMzI4Nzg2OSBMNDIuMjQyNTMwNiwzNi41Mzg4Mzg2IEw0Mi4yNDI2MzA5LDM2LjUzODgzODYgWiBNMzYuNTcwNzQ0MSw0Mi4yMjY0MjI3IEMzMy45MTY3NzczLDQ0LjA4Njc5NjcgMzAuODUwOTc5Myw0NS4zOTcyODQyIDI3LjUzOTg2OTMsNDUuOTkxMTYxNiBMMjcuNTM5ODY5Myw0MS43OTYwNTQ5IEMyOS43Mzc2NDAyLDQxLjMyMDI5MDEgMzEuNzkzNjg0MSw0MC40NTkzNTM2IDMzLjYzMzYyNDYsMzkuMjg3NTY4IEwzNS4zNTU0MjU4LDQxLjAxMDQ0NTMgTDM2LjU3MDc0NDEsNDIuMjI2NTIzMSBMMzYuNTcwNzQ0MSw0Mi4yMjY0MjI3IFogTTQuNzExNzk5NjUsMzYuNDczMTUzNSBDMi44Njc0NDI3NCwzMy44MDY5ODIzIDEuNTc0NjM2MzcsMzAuNzMwOTMyMiAxLDI3LjQxMTgyNzMgTDUuMTY4ODk5MDQsMjcuNDExODI3MyBDNS42NDgyODEyOCwyOS42MDczNTU5IDYuNTExNTkwODcsMzEuNjYxMDY5IDcuNjg0NjUyMDUsMzMuNDk4NDQzMiBMNS45NTU3MjQyOCwzNS4yMjg0NTE1IEw0LjcxMTc5OTY1LDM2LjQ3MzE1MzUgTDQuNzExNzk5NjUsMzYuNDczMTUzNSBaIE0xMC4zNjQwMTMzLDQyLjE4MDQyMyBDMTMuMDQ2Mjg1NCw0NC4wNzQ1NDM1IDE2LjE1MjczNDUsNDUuNDA1NTIgMTkuNTEwMTE2NSw0NiBMMTkuNTEwMTE2NSw0MS43ODIxOTQ3IEMxNy4yODE3MzE5LDQxLjI5MTY2NTggMTUuMjAwMDkyOCw0MC40MDQ4MTY5IDEzLjM0MzA4ODksMzkuMTk5NTg2MiBMMTEuNjMzNzMzOSw0MC45MTAwMDk0IEwxMC4zNjQwMTMzLDQyLjE4MDUyMzUgTDEwLjM2NDAxMzMsNDIuMTgwNDIzIFogTTQyLjE2ODg1NjcsMTAuMzU1NzAzOCBDNDQuMDM3MzAzMSwxMy4wMDQ4MDA4IDQ1LjM1NzQxMSwxNi4wNjc0OTI5IDQ1Ljk2MjY2MTIsMTkuMzc2ODU1NiBMNDEuOTQ2OTMxNiwxOS4zNzY4NTU2IEM0MS40NTg1MTU4LDE3LjEzMjgxNjQgNDAuNTY5MjA5NSwxNS4wMzY5MjAyIDM5LjM1ODAwNjUsMTMuMTY4NDEwOSBMNDEuMDMzNTM1OCwxMS40OTE4MzQ2IEw0Mi4xNjg5NTcsMTAuMzU1NzAzOCBMNDIuMTY4ODU2NywxMC4zNTU3MDM4IFogTTM2LjQ2NTE1MTYsNC42OTk5NTc4MiBDMzMuODM1NTc1NCwyLjg3ODY1MzM2IDMwLjgwNzExNjIsMS41OTQ4ODE3OSAyNy41NDAwNzAxLDEuMDA4ODM4MzYgTDI3LjU0MDA3MDEsNC45ODExNzgzMSBDMjkuNzQ4NDgwNSw1LjQ1OTE1MjcyIDMxLjgxMzc1ODcsNi4zMjYwMTQ5IDMzLjY2MDQyNDIsNy41MDY0Mzc5NCBMMzUuMzU1NTI2Miw1LjgxMDI3NjYgTDM2LjQ2NTE1MTYsNC42OTk5NTc4MiBMMzYuNDY1MTUxNiw0LjY5OTk1NzgyIFpcXFwiIGZpbGw9XFxcIiNDQ0NDQ0NcXFwiPjwvcGF0aD48L3N2Zz5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c3ZnIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYVxcXCIgd2lkdGg9XFxcIjU2XFxcIiBoZWlnaHQ9XFxcIjU1XFxcIj48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEteFxcXCIgZD1cXFwiTTIxLjAzIDUuMDQybC0yLjExMi0yLjE1Ni0zLjY1NyAzLjY5NS0zLjY1Ny0zLjY5NS0yLjExMiAyLjE1NiAzLjY1OSAzLjY3My0zLjY1OSAzLjY5NiAyLjExMiAyLjE1NyAzLjY1Ny0zLjY5NyAzLjY1NyAzLjY5NyAyLjExMi0yLjE1Ny0zLjY0OC0zLjY5NiAzLjY0OC0zLjY3M3pcXFwiIGZpbGw9XFxcIiNGMjU0MkRcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtc1xcXCIgZD1cXFwiTTQxLjIzMiA2Ljg5NmwyLjk0MS0yLjk3NC0yLjEzNC0yLjEzMi0yLjkyIDIuOTczLS4wMDUtLjAwOC0yLjEzNCAyLjEzNS4wMDUuMDA4LS4wMDUuMDA1IDMuNzkyIDMuODItMi45MTUgMi45NDcgMi4xMTIgMi4xNTYgNS4wNi01LjExMS0zLjc5OC0zLjgxNi4wMDEtLjAwMXpcXFwiIGZpbGw9XFxcIiNGQ0NBMjBcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtb1xcXCIgZD1cXFwiTTQ4LjA2NiAyOS4xNTljLTEuNTM2IDAtMi43NjEgMS4yNjMtMi43NjEgMi43OSAwIDEuNTI0IDEuMjI2IDIuNzY1IDIuNzYxIDIuNzY1IDEuNTA5IDAgMi43MzYtMS4yNDIgMi43MzYtMi43NjUgMC0xLjUyNi0xLjIyNy0yLjc5LTIuNzM2LTIuNzltMCA4LjU5M2MtMy4xNzkgMC01Ljc3MS0yLjU5NC01Ljc3MS01LjgwNCAwLTMuMjEzIDIuNTkyLTUuODA4IDUuNzcxLTUuODA4IDMuMTU1IDAgNS43NDUgMi41OTQgNS43NDUgNS44MDggMCAzLjIxLTIuNTg5IDUuODA0LTUuNzQ1IDUuODA0XFxcIiBmaWxsPVxcXCIjOEMzRUE0XFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLWxcXFwiIGQ9XFxcIk0yNC4zODkgNDIuMzIzaDIuOTl2MTAuNDM3aC0yLjk5di0xMC40Mzd6bTQuMzM0IDBoMi45ODl2MTAuNDM3aC0yLjk4OXYtMTAuNDM3elxcXCIgZmlsbD1cXFwiI0I1REMyMFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1hXFxcIiBkPVxcXCJNNy43OTYgMzEuODk4bDEuNDA0IDIuNDU3aC0yLjgzNWwxLjQzMS0yLjQ1N2gtLjAwMXptLS4wMDEtNS43NTdsLTYuMzYzIDExLjEwMmgxMi43MDNsLTYuMzQxLTExLjEwMnpcXFwiIGZpbGw9XFxcIiM2NkNDREFcXFwiPjwvcGF0aD48L3N2Zz5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnc2Fzc2lmeScpKCcueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94e3Bvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbiAwLjE1czthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbiAwLjE1c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LW92ZXJsYXl7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2JvdHRvbTowO3JpZ2h0OjA7ei1pbmRleDoxfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudHtwb3NpdGlvbjpyZWxhdGl2ZTt0b3A6MDtsZWZ0OjA7ei1pbmRleDozfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudF9faGlkZGVue3Zpc2liaWxpdHk6aGlkZGVuO3otaW5kZXg6LTF9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1jb250ZW50LWlmcmFtZXt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnR9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVye3Bvc2l0aW9uOmFic29sdXRlO3RvcDo1MCU7bGVmdDo1MCU7ZGlzcGxheTpub25lO3otaW5kZXg6Mjtwb2ludGVyLWV2ZW50czpub25lfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGF7d2lkdGg6NTZweDtoZWlnaHQ6NTVweDttYXJnaW4tdG9wOi0yOHB4O21hcmdpbi1sZWZ0Oi0yNnB4fS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXgsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtcywueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1vLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWwsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtYXstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXkgMXMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7LXdlYmtpdC1hbmltYXRpb24tZmlsbC1tb2RlOmJvdGg7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheSAxcyBpbmZpbml0ZSBlYXNlLWluLW91dDthbmltYXRpb24tZmlsbC1tb2RlOmJvdGh9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEteHstd2Via2l0LWFuaW1hdGlvbi1kZWxheTowczthbmltYXRpb24tZGVsYXk6MHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtc3std2Via2l0LWFuaW1hdGlvbi1kZWxheTouMnM7YW5pbWF0aW9uLWRlbGF5Oi4yc30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1vey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi40czthbmltYXRpb24tZGVsYXk6LjRzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWx7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjZzO2FuaW1hdGlvbi1kZWxheTouNnN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtYXstd2Via2l0LWFuaW1hdGlvbi1kZWxheTouOHM7YW5pbWF0aW9uLWRlbGF5Oi44c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXItcm91bmR7bWFyZ2luLXRvcDotMjNweDttYXJnaW4tbGVmdDotMjNweDstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXI7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIDNzIGluZmluaXRlIGxpbmVhcn0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXItY3VzdG9tey13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIGluZmluaXRlIGxpbmVhcjthbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gaW5maW5pdGUgbGluZWFyfUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXl7MCUsODAlLDEwMCV7b3BhY2l0eTowfTQwJXtvcGFjaXR5OjF9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5ezAlLDgwJSwxMDAle29wYWNpdHk6MH00MCV7b3BhY2l0eToxfX1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbntmcm9te29wYWNpdHk6MH10b3tvcGFjaXR5OjF9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWZhZGVpbntmcm9te29wYWNpdHk6MH10b3tvcGFjaXR5OjF9fUAtd2Via2l0LWtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbntmcm9tey13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgwZGVnKX10b3std2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19QGtleWZyYW1lcyB4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbntmcm9te3RyYW5zZm9ybTpyb3RhdGUoMGRlZyl9dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX0gIC8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXdvSkluWmxjbk5wYjI0aU9pQXpMQW9KSW1acGJHVWlPaUFpYkdsbmFIUmliM2d1YzJOemN5SXNDZ2tpYzI5MWNtTmxjeUk2SUZzS0NRa2liR2xuYUhSaWIzZ3VjMk56Y3lJS0NWMHNDZ2tpYzI5MWNtTmxjME52Ym5SbGJuUWlPaUJiQ2drSklpUnNhV2RvZEdKdmVDMXdjbVZtYVhnNklDZDRjR0Y1YzNSaGRHbHZiaTEzYVdSblpYUXRiR2xuYUhSaWIzZ25PMXh1Skd4cFoyaDBZbTk0TFdOc1lYTnpPaUFuTGljZ0t5QWtiR2xuYUhSaWIzZ3RjSEpsWm1sNE8xeHVYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzBnZTF4dUlDQndiM05wZEdsdmJqb2dabWw0WldRN1hHNGdJSFJ2Y0RvZ01EdGNiaUFnYkdWbWREb2dNRHRjYmlBZ1ltOTBkRzl0T2lBd08xeHVJQ0J5YVdkb2REb2dNRHRjYmlBZ2QybGtkR2c2SURFd01DVTdYRzRnSUdobGFXZG9kRG9nTVRBd0pUdGNiaUFnTFhkbFltdHBkQzFoYm1sdFlYUnBiMjQ2SUNON0pHeHBaMmgwWW05NExYQnlaV1pwZUgwdFptRmtaV2x1SUM0eE5YTTdYRzRnSUdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMW1ZV1JsYVc0Z0xqRTFjenRjYm4xY2JseHVJM3NrYkdsbmFIUmliM2d0WTJ4aGMzTjlMVzkyWlhKc1lYa2dlMXh1SUNCd2IzTnBkR2x2YmpvZ1lXSnpiMngxZEdVN1hHNGdJSFJ2Y0Rvd08xeHVJQ0JzWldaME9pQXdPMXh1SUNCaWIzUjBiMjA2SURBN1hHNGdJSEpwWjJoME9pQXdPMXh1SUNCNkxXbHVaR1Y0T2lBeE8xeHVmVnh1WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwdFkyOXVkR1Z1ZENCN1hHNGdJSEJ2YzJsMGFXOXVPaUJ5Wld4aGRHbDJaVHRjYmlBZ2RHOXdPaUF3TzF4dUlDQnNaV1owT2lBd08xeHVJQ0I2TFdsdVpHVjRPaUF6TzF4dWZWeHVYRzRqZXlSc2FXZG9kR0p2ZUMxamJHRnpjMzB0WTI5dWRHVnVkRjlmYUdsa1pHVnVJSHRjYmlBZ2RtbHphV0pwYkdsMGVUb2dhR2xrWkdWdU8xeHVJQ0I2TFdsdVpHVjRPaUF0TVR0Y2JuMWNibHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFdOdmJuUmxiblF0YVdaeVlXMWxJSHRjYmlBZ2QybGtkR2c2SURFd01DVTdYRzRnSUdobGFXZG9kRG9nTVRBd0pUdGNiaUFnWW05eVpHVnlPaUF3TzF4dUlDQmlZV05yWjNKdmRXNWtPaUIwY21GdWMzQmhjbVZ1ZER0Y2JuMWNibHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFhOd2FXNXVaWElnZTF4dUlDQndiM05wZEdsdmJqb2dZV0p6YjJ4MWRHVTdYRzRnSUhSdmNEb2dOVEFsTzF4dUlDQnNaV1owT2lBMU1DVTdYRzRnSUdScGMzQnNZWGs2SUc1dmJtVTdYRzRnSUhvdGFXNWtaWGc2SURJN1hHNGdJSEJ2YVc1MFpYSXRaWFpsYm5Sek9pQnViMjVsTzF4dVhHNGdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTQjdYRzRnSUNBZ2QybGtkR2c2SURVMmNIZzdYRzRnSUNBZ2FHVnBaMmgwT2lBMU5YQjRPMXh1SUNBZ0lHMWhjbWRwYmpvZ2UxeHVJQ0FnSUNBZ2RHOXdPaUF0TWpod2VEdGNiaUFnSUNBZ0lHeGxablE2SUMweU5uQjRPMXh1SUNBZ0lIMWNibHh1SUNBZ0lDNXpjR2x1Ym1WeUxYaHpiMnhzWVMxNExDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGN5d2dMbk53YVc1dVpYSXRlSE52Ykd4aExXOHNJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMXNMQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRZU0I3WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQXhjeUJwYm1acGJtbDBaU0JsWVhObExXbHVMVzkxZER0Y2JpQWdJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1TFdacGJHd3RiVzlrWlRvZ1ltOTBhRHRjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQXhjeUJwYm1acGJtbDBaU0JsWVhObExXbHVMVzkxZER0Y2JpQWdJQ0FnSUdGdWFXMWhkR2x2YmkxbWFXeHNMVzF2WkdVNklHSnZkR2c3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExYZ2dlMXh1SUNBZ0lDQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNHRaR1ZzWVhrNklEQnpPMXh1SUNBZ0lDQWdZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXdjenRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXVjM0JwYm01bGNpMTRjMjlzYkdFdGN5QjdYRzRnSUNBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJpMWtaV3hoZVRvZ0xqSnpPMXh1SUNBZ0lDQWdZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVNbk03WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMbk53YVc1dVpYSXRlSE52Ykd4aExXOGdlMXh1SUNBZ0lDQWdMWGRsWW10cGRDMWhibWx0WVhScGIyNHRaR1ZzWVhrNklDNDBjenRjYmlBZ0lDQWdJR0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMalJ6TzF4dUlDQWdJSDFjYmx4dUlDQWdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMXNJSHRjYmlBZ0lDQWdJQzEzWldKcmFYUXRZVzVwYldGMGFXOXVMV1JsYkdGNU9pQXVObk03WEc0Z0lDQWdJQ0JoYm1sdFlYUnBiMjR0WkdWc1lYazZJQzQyY3p0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRZU0I3WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMamh6TzF4dUlDQWdJQ0FnWVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF1T0hNN1hHNGdJQ0FnZlZ4dUlDQjlYRzVjYmlBZ0xuTndhVzV1WlhJdGNtOTFibVFnZTF4dUlDQWdJRzFoY21kcGJqb2dlMXh1SUNBZ0lDQWdkRzl3T2lBdE1qTndlRHRjYmlBZ0lDQWdJR3hsWm5RNklDMHlNM0I0TzF4dUlDQWdJSDFjYmlBZ0lDQXRkMlZpYTJsMExXRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzF6Y0dsdUlETnpJR2x1Wm1sdWFYUmxJR3hwYm1WaGNqdGNiaUFnSUNCaGJtbHRZWFJwYjI0NklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRjM0JwYmlBemN5QnBibVpwYm1sMFpTQnNhVzVsWVhJN1hHNGdJSDFjYmx4dUlDQXVjM0JwYm01bGNpMWpkWE4wYjIwZ2UxeHVJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1T2lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxYTndhVzRnYVc1bWFXNXBkR1VnYkdsdVpXRnlPMXh1SUNBZ0lHRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzF6Y0dsdUlHbHVabWx1YVhSbElHeHBibVZoY2p0Y2JpQWdmVnh1ZlZ4dVhHNUFMWGRsWW10cGRDMXJaWGxtY21GdFpYTWdJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFpYjNWdVkyVmtaV3hoZVNCN1hHNGdJREFsTENBNE1DVXNJREV3TUNVZ2V5QnZjR0ZqYVhSNU9pQXdPeUI5WEc0Z0lEUXdKU0I3SUc5d1lXTnBkSGs2SURFZ2ZWeHVmVnh1WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRZbTkxYm1ObFpHVnNZWGtnZTF4dUlDQXdKU3dnT0RBbExDQXhNREFsSUhzZ2IzQmhZMmwwZVRvZ01Ec2dmVnh1SUNBME1DVWdleUJ2Y0dGamFYUjVPaUF4T3lCOVhHNTlYRzVjYmtBdGQyVmlhMmwwTFd0bGVXWnlZVzFsY3lBamV5UnNhV2RvZEdKdmVDMXdjbVZtYVhoOUxXWmhaR1ZwYmlCN1hHNGdJR1p5YjIwZ2V5QnZjR0ZqYVhSNU9pQXdPeUI5WEc0Z0lIUnZJSHNnYjNCaFkybDBlVG9nTVRzZ2ZWeHVmVnh1WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRabUZrWldsdUlIdGNiaUFnWm5KdmJTQjdJRzl3WVdOcGRIazZJREE3SUgxY2JpQWdkRzhnZXlCdmNHRmphWFI1T2lBeE95QjlYRzU5WEc1Y2JrQXRkMlZpYTJsMExXdGxlV1p5WVcxbGN5QWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z2UxeHVJQ0JtY205dElIc2dMWGRsWW10cGRDMTBjbUZ1YzJadmNtMDZJSEp2ZEdGMFpTZ3daR1ZuS1RzZ2ZWeHVJQ0IwYnlCN0lDMTNaV0pyYVhRdGRISmhibk5tYjNKdE9pQnliM1JoZEdVb016WXdaR1ZuS1RzZ2ZWeHVmVnh1WEc1QWEyVjVabkpoYldWeklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRjM0JwYmlCN1hHNGdJR1p5YjIwZ2V5QjBjbUZ1YzJadmNtMDZJSEp2ZEdGMFpTZ3daR1ZuS1RzZ2ZWeHVJQ0IwYnlCN0lIUnlZVzV6Wm05eWJUb2djbTkwWVhSbEtETTJNR1JsWnlrN0lIMWNibjFjYmlJS0NWMHNDZ2tpYldGd2NHbHVaM01pT2lBaVFVRkhRU3hCUVVGQkxEUkNRVUUwUWl4QlFVRTFRaXhEUVVORkxGRkJRVkVzUTBGQlJTeExRVUZOTEVOQlEyaENMRWRCUVVjc1EwRkJSU3hEUVVGRkxFTkJRMUFzU1VGQlNTeERRVUZGTEVOQlFVVXNRMEZEVWl4TlFVRk5MRU5CUVVVc1EwRkJSU3hEUVVOV0xFdEJRVXNzUTBGQlJTeERRVUZGTEVOQlExUXNTMEZCU3l4RFFVRkZMRWxCUVVzc1EwRkRXaXhOUVVGTkxFTkJRVVVzU1VGQlN5eERRVU5pTEdsQ1FVRnBRaXhEUVVGRkxHdERRVUV3UWl4RFFVRlJMRXRCUVVrc1EwRkRla1FzVTBGQlV5eERRVUZGTEd0RFFVRXdRaXhEUVVGUkxFdEJRVWtzUTBGRGJFUXNRVUZGUkN4QlFVRkJMRzlEUVVGdlF5eEJRVUZ3UXl4RFFVTkZMRkZCUVZFc1EwRkJSU3hSUVVGVExFTkJRMjVDTEVkQlFVY3NRMEZCUXl4RFFVRkZMRU5CUTA0c1NVRkJTU3hEUVVGRkxFTkJRVVVzUTBGRFVpeE5RVUZOTEVOQlFVVXNRMEZCUlN4RFFVTldMRXRCUVVzc1EwRkJSU3hEUVVGRkxFTkJRMVFzVDBGQlR5eERRVUZGTEVOQlFVVXNRMEZEV2l4QlFVVkVMRUZCUVVFc2IwTkJRVzlETEVGQlFYQkRMRU5CUTBVc1VVRkJVU3hEUVVGRkxGRkJRVk1zUTBGRGJrSXNSMEZCUnl4RFFVRkZMRU5CUVVVc1EwRkRVQ3hKUVVGSkxFTkJRVVVzUTBGQlJTeERRVU5TTEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUTFvc1FVRkZSQ3hCUVVGQkxEUkRRVUUwUXl4QlFVRTFReXhEUVVORkxGVkJRVlVzUTBGQlJTeE5RVUZQTEVOQlEyNUNMRTlCUVU4c1EwRkJSU3hGUVVGSExFTkJRMklzUVVGRlJDeEJRVUZCTERKRFFVRXlReXhCUVVFelF5eERRVU5GTEV0QlFVc3NRMEZCUlN4SlFVRkxMRU5CUTFvc1RVRkJUU3hEUVVGRkxFbEJRVXNzUTBGRFlpeE5RVUZOTEVOQlFVVXNRMEZCUlN4RFFVTldMRlZCUVZVc1EwRkJSU3hYUVVGWkxFTkJRM3BDTEVGQlJVUXNRVUZCUVN4dlEwRkJiME1zUVVGQmNFTXNRMEZEUlN4UlFVRlJMRU5CUVVVc1VVRkJVeXhEUVVOdVFpeEhRVUZITEVOQlFVVXNSMEZCU1N4RFFVTlVMRWxCUVVrc1EwRkJSU3hIUVVGSkxFTkJRMVlzVDBGQlR5eERRVUZGTEVsQlFVc3NRMEZEWkN4UFFVRlBMRU5CUVVVc1EwRkJSU3hEUVVOWUxHTkJRV01zUTBGQlJTeEpRVUZMTEVOQmQwUjBRaXhCUVRsRVJDeEJRVkZGTEc5RFFWSnJReXhEUVZGc1F5eGxRVUZsTEVGQlFVTXNRMEZEWkN4TFFVRkxMRU5CUVVVc1NVRkJTeXhEUVVOYUxFMUJRVTBzUTBGQlJTeEpRVUZMTEVOQlEySXNUVUZCVFN4QlFVRkRMRU5CUVVNc1FVRkRUaXhIUVVGSExFTkJRVVVzUzBGQlRTeERRVVJpTEUxQlFVMHNRVUZCUXl4RFFVRkRMRUZCUlU0c1NVRkJTU3hEUVVGRkxFdEJRVTBzUTBGclEyWXNRVUV2UTBnc1FVRm5Ra2tzYjBOQmFFSm5ReXhEUVZGc1F5eGxRVUZsTEVOQlVXSXNhVUpCUVdsQ0xFTkJhRUp5UWl4QlFXZENkVUlzYjBOQmFFSmhMRU5CVVd4RExHVkJRV1VzUTBGUlRTeHBRa0ZCYVVJc1EwRm9RbmhETEVGQlowSXdReXh2UTBGb1FrNHNRMEZSYkVNc1pVRkJaU3hEUVZGNVFpeHBRa0ZCYVVJc1EwRm9Rak5FTEVGQlowSTJSQ3h2UTBGb1FucENMRU5CVVd4RExHVkJRV1VzUTBGUk5FTXNhVUpCUVdsQ0xFTkJhRUk1UlN4QlFXZENaMFlzYjBOQmFFSTFReXhEUVZGc1F5eGxRVUZsTEVOQlVTdEVMR2xDUVVGcFFpeEJRVUZETEVOQlF6VkdMR2xDUVVGcFFpeERRVUZGTEhWRFFVRXJRaXhEUVVGaExFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVTjBSaXd5UWtGQk1rSXNRMEZCUlN4SlFVRkxMRU5CUTJ4RExGTkJRVk1zUTBGQlJTeDFRMEZCSzBJc1EwRkJZU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEZkQlFWY3NRMEZET1VVc2JVSkJRVzFDTEVOQlFVVXNTVUZCU3l4RFFVTXpRaXhCUVhKQ1RDeEJRWFZDU1N4dlEwRjJRbWRETEVOQlVXeERMR1ZCUVdVc1EwRmxZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4RlFVRkhMRU5CUXpWQ0xHVkJRV1VzUTBGQlJTeEZRVUZITEVOQlEzSkNMRUZCTVVKTUxFRkJORUpKTEc5RFFUVkNaME1zUTBGUmJFTXNaVUZCWlN4RFFXOUNZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCTDBKTUxFRkJhVU5KTEc5RFFXcERaME1zUTBGUmJFTXNaVUZCWlN4RFFYbENZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCY0VOTUxFRkJjME5KTEc5RFFYUkRaME1zUTBGUmJFTXNaVUZCWlN4RFFUaENZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCZWtOTUxFRkJNa05KTEc5RFFUTkRaME1zUTBGUmJFTXNaVUZCWlN4RFFXMURZaXhwUWtGQmFVSXNRVUZCUXl4RFFVTm9RaXgxUWtGQmRVSXNRMEZCUlN4SFFVRkpMRU5CUXpkQ0xHVkJRV1VzUTBGQlJTeEhRVUZKTEVOQlEzUkNMRUZCT1VOTUxFRkJhVVJGTEc5RFFXcEVhME1zUTBGcFJHeERMR05CUVdNc1FVRkJReXhEUVVOaUxFMUJRVTBzUVVGQlF5eERRVUZETEVGQlEwNHNSMEZCUnl4RFFVRkZMRXRCUVUwc1EwRkVZaXhOUVVGTkxFRkJRVU1zUTBGQlF5eEJRVVZPTEVsQlFVa3NRMEZCUlN4TFFVRk5MRU5CUldRc2FVSkJRV2xDTEVOQlFVVXNaME5CUVhkQ0xFTkJRVTBzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUTI1RkxGTkJRVk1zUTBGQlJTeG5RMEZCZDBJc1EwRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZETlVRc1FVRjRSRWdzUVVFd1JFVXNiME5CTVVSclF5eERRVEJFYkVNc1pVRkJaU3hCUVVGRExFTkJRMlFzYVVKQlFXbENMRU5CUVVVc1owTkJRWGRDTEVOQlFVMHNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkRhRVVzVTBGQlV5eERRVUZGTEdkRFFVRjNRaXhEUVVGTkxGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlEzcEVMRUZCUjBnc2EwSkJRV3RDTEVOQlFXeENMSFZEUVVGclFpeERRVU5vUWl4QlFVRkJMRVZCUVVVc1EwRkJSU3hCUVVGQkxFZEJRVWNzUTBGQlJTeEJRVUZCTEVsQlFVa3NRMEZCUnl4UFFVRlBMRU5CUVVVc1EwRkJSU3hEUVVNelFpeEJRVUZCTEVkQlFVY3NRMEZCUnl4UFFVRlBMRU5CUVVVc1EwRkJSeXhGUVVkd1FpeFZRVUZWTEVOQlFWWXNkVU5CUVZVc1EwRkRVaXhCUVVGQkxFVkJRVVVzUTBGQlJTeEJRVUZCTEVkQlFVY3NRMEZCUlN4QlFVRkJMRWxCUVVrc1EwRkJSeXhQUVVGUExFTkJRVVVzUTBGQlJTeERRVU16UWl4QlFVRkJMRWRCUVVjc1EwRkJSeXhQUVVGUExFTkJRVVVzUTBGQlJTeEZRVWR1UWl4clFrRkJhMElzUTBGQmJFSXNhME5CUVd0Q0xFTkJRMmhDTEVGQlFVRXNTVUZCU1N4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFTkJRMnhDTEVGQlFVRXNSVUZCUlN4RFFVRkhMRTlCUVU4c1EwRkJSU3hEUVVGRkxFVkJSMnhDTEZWQlFWVXNRMEZCVml4clEwRkJWU3hEUVVOU0xFRkJRVUVzU1VGQlNTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUTJ4Q0xFRkJRVUVzUlVGQlJTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRVZCUjJ4Q0xHdENRVUZyUWl4RFFVRnNRaXhuUTBGQmEwSXNRMEZEYUVJc1FVRkJRU3hKUVVGSkxFTkJRVWNzYVVKQlFXbENMRU5CUVVVc1dVRkJUU3hEUVVOb1F5eEJRVUZCTEVWQlFVVXNRMEZCUnl4cFFrRkJhVUlzUTBGQlJTeGpRVUZOTEVWQlIyaERMRlZCUVZVc1EwRkJWaXhuUTBGQlZTeERRVU5TTEVGQlFVRXNTVUZCU1N4RFFVRkhMRk5CUVZNc1EwRkJSU3haUVVGTkxFTkJRM2hDTEVGQlFVRXNSVUZCUlN4RFFVRkhMRk5CUVZNc1EwRkJSU3hqUVVGTklpd0tDU0p1WVcxbGN5STZJRnRkQ24wPSAqLycpOzsiLCJtb2R1bGUuZXhwb3J0cyA9ICcxLjIuMTInO1xuIiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG52YXIgcG9seWZpbGxzID0gcmVxdWlyZSgnLi9wb2x5ZmlsbHMnKTtcblxucG9seWZpbGxzLmFwcGx5UG9seWZpbGxzKCk7XG5cbnZhciBpbnN0YW5jZTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZXRJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH07XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihIZWxwZXJzLnppcE9iamVjdChbJ2luaXQnLCAnb3BlbicsICdjbG9zZScsICdvbicsICdvZmYnLCAnc2VuZE1lc3NhZ2UnLCAnb25NZXNzYWdlJ10ubWFwKGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAgICAgIHZhciBhcHAgPSBnZXRJbnN0YW5jZSgpO1xuICAgICAgICByZXR1cm4gW21ldGhvZE5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhcHBbbWV0aG9kTmFtZV0uYXBwbHkoYXBwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XTtcbiAgICB9KSksIHtcbiAgICAgICAgZXZlbnRUeXBlczogQXBwLmV2ZW50VHlwZXMsXG4gICAgfSk7XG59KSgpO1xuIl19
