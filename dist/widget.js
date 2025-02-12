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

            lightBoxContentElement.style.width = withDefaultPXUnit(widthAfterResize);
            lightBoxContentElement.style.height = withDefaultPXUnit(heightAfterResize);

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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYm93c2VyL3NyYy9ib3dzZXIuanMiLCJub2RlX21vZHVsZXMvY3NzaWZ5L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc2Fzc2lmeS9saWIvc2Fzc2lmeS1icm93c2VyLmpzIiwic3JjL2FwcC5qcyIsInNyYy9jaGlsZHdpbmRvdy5qcyIsInNyYy9kZXZpY2UuanMiLCJzcmMvZXhjZXB0aW9uLmpzIiwic3JjL2hlbHBlcnMuanMiLCJzcmMvbGlnaHRib3guanMiLCJzcmMvcG9seWZpbGxzLmpzIiwic3JjL3Bvc3RtZXNzYWdlLmpzIiwic3JjL3NwaW5uZXJzL3JvdW5kLnN2ZyIsInNyYy9zcGlubmVycy94c29sbGEuc3ZnIiwic3JjL3N0eWxlcy9saWdodGJveC5zY3NzIiwic3JjL3ZlcnNpb24uanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyRUE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBOztBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEJvd3NlciAtIGEgYnJvd3NlciBkZXRlY3RvclxuICogaHR0cHM6Ly9naXRodWIuY29tL2RlZC9ib3dzZXJcbiAqIE1JVCBMaWNlbnNlIHwgKGMpIER1c3RpbiBEaWF6IDIwMTVcbiAqL1xuXG4hZnVuY3Rpb24gKHJvb3QsIG5hbWUsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUobmFtZSwgZGVmaW5pdGlvbilcbiAgZWxzZSByb290W25hbWVdID0gZGVmaW5pdGlvbigpXG59KHRoaXMsICdib3dzZXInLCBmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgICogU2VlIHVzZXJhZ2VudHMuanMgZm9yIGV4YW1wbGVzIG9mIG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAqL1xuXG4gIHZhciB0ID0gdHJ1ZVxuXG4gIGZ1bmN0aW9uIGRldGVjdCh1YSkge1xuXG4gICAgZnVuY3Rpb24gZ2V0Rmlyc3RNYXRjaChyZWdleCkge1xuICAgICAgdmFyIG1hdGNoID0gdWEubWF0Y2gocmVnZXgpO1xuICAgICAgcmV0dXJuIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoWzFdKSB8fCAnJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWNvbmRNYXRjaChyZWdleCkge1xuICAgICAgdmFyIG1hdGNoID0gdWEubWF0Y2gocmVnZXgpO1xuICAgICAgcmV0dXJuIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoWzJdKSB8fCAnJztcbiAgICB9XG5cbiAgICB2YXIgaW9zZGV2aWNlID0gZ2V0Rmlyc3RNYXRjaCgvKGlwb2R8aXBob25lfGlwYWQpL2kpLnRvTG93ZXJDYXNlKClcbiAgICAgICwgbGlrZUFuZHJvaWQgPSAvbGlrZSBhbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgYW5kcm9pZCA9ICFsaWtlQW5kcm9pZCAmJiAvYW5kcm9pZC9pLnRlc3QodWEpXG4gICAgICAsIG5leHVzTW9iaWxlID0gL25leHVzXFxzKlswLTZdXFxzKi9pLnRlc3QodWEpXG4gICAgICAsIG5leHVzVGFibGV0ID0gIW5leHVzTW9iaWxlICYmIC9uZXh1c1xccypbMC05XSsvaS50ZXN0KHVhKVxuICAgICAgLCBjaHJvbWVvcyA9IC9Dck9TLy50ZXN0KHVhKVxuICAgICAgLCBzaWxrID0gL3NpbGsvaS50ZXN0KHVhKVxuICAgICAgLCBzYWlsZmlzaCA9IC9zYWlsZmlzaC9pLnRlc3QodWEpXG4gICAgICAsIHRpemVuID0gL3RpemVuL2kudGVzdCh1YSlcbiAgICAgICwgd2Vib3MgPSAvKHdlYnxocHcpKG98MClzL2kudGVzdCh1YSlcbiAgICAgICwgd2luZG93c3Bob25lID0gL3dpbmRvd3MgcGhvbmUvaS50ZXN0KHVhKVxuICAgICAgLCBzYW1zdW5nQnJvd3NlciA9IC9TYW1zdW5nQnJvd3Nlci9pLnRlc3QodWEpXG4gICAgICAsIHdpbmRvd3MgPSAhd2luZG93c3Bob25lICYmIC93aW5kb3dzL2kudGVzdCh1YSlcbiAgICAgICwgbWFjID0gIWlvc2RldmljZSAmJiAhc2lsayAmJiAvbWFjaW50b3NoL2kudGVzdCh1YSlcbiAgICAgICwgbGludXggPSAhYW5kcm9pZCAmJiAhc2FpbGZpc2ggJiYgIXRpemVuICYmICF3ZWJvcyAmJiAvbGludXgvaS50ZXN0KHVhKVxuICAgICAgLCBlZGdlVmVyc2lvbiA9IGdldFNlY29uZE1hdGNoKC9lZGcoW2VhXXxpb3MpXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB2ZXJzaW9uSWRlbnRpZmllciA9IGdldEZpcnN0TWF0Y2goL3ZlcnNpb25cXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICAsIHRhYmxldCA9IC90YWJsZXQvaS50ZXN0KHVhKSAmJiAhL3RhYmxldCBwYy9pLnRlc3QodWEpXG4gICAgICAsIG1vYmlsZSA9ICF0YWJsZXQgJiYgL1teLV1tb2JpL2kudGVzdCh1YSlcbiAgICAgICwgeGJveCA9IC94Ym94L2kudGVzdCh1YSlcbiAgICAgICwgcmVzdWx0XG5cbiAgICBpZiAoL29wZXJhL2kudGVzdCh1YSkpIHtcbiAgICAgIC8vICBhbiBvbGQgT3BlcmFcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhJ1xuICAgICAgLCBvcGVyYTogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpvcGVyYXxvcHJ8b3Bpb3MpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgvb3ByXFwvfG9waW9zL2kudGVzdCh1YSkpIHtcbiAgICAgIC8vIGEgbmV3IE9wZXJhXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSdcbiAgICAgICAgLCBvcGVyYTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om9wcnxvcGlvcylbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL1NhbXN1bmdCcm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhbXN1bmcgSW50ZXJuZXQgZm9yIEFuZHJvaWQnXG4gICAgICAgICwgc2Ftc3VuZ0Jyb3dzZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpTYW1zdW5nQnJvd3NlcilbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL1doYWxlL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ05BVkVSIFdoYWxlIGJyb3dzZXInXG4gICAgICAgICwgd2hhbGU6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp3aGFsZSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvTVpCcm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ01aIEJyb3dzZXInXG4gICAgICAgICwgbXpicm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86TVpCcm93c2VyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jb2FzdC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdPcGVyYSBDb2FzdCdcbiAgICAgICAgLCBjb2FzdDogdFxuICAgICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OmNvYXN0KVtcXHNcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvZm9jdXMvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnRm9jdXMnXG4gICAgICAgICwgZm9jdXM6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpmb2N1cylbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgveWFicm93c2VyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1lhbmRleCBCcm93c2VyJ1xuICAgICAgLCB5YW5kZXhicm93c2VyOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goLyg/OnlhYnJvd3NlcilbXFxzXFwvXShcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3VjYnJvd3Nlci9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgbmFtZTogJ1VDIEJyb3dzZXInXG4gICAgICAgICwgdWNicm93c2VyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86dWNicm93c2VyKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9teGlvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNYXh0aG9uJ1xuICAgICAgICAsIG1heHRob246IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpteGlvcylbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvZXBpcGhhbnkvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnRXBpcGhhbnknXG4gICAgICAgICwgZXBpcGhhbnk6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzplcGlwaGFueSlbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvcHVmZmluL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1B1ZmZpbidcbiAgICAgICAgLCBwdWZmaW46IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpwdWZmaW4pW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NsZWlwbmlyL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NsZWlwbmlyJ1xuICAgICAgICAsIHNsZWlwbmlyOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86c2xlaXBuaXIpW1xcc1xcL10oXFxkKyg/OlxcLlxcZCspKykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2stbWVsZW9uL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0stTWVsZW9uJ1xuICAgICAgICAsIGtNZWxlb246IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzprLW1lbGVvbilbXFxzXFwvXShcXGQrKD86XFwuXFxkKykrKS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh3aW5kb3dzcGhvbmUpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1dpbmRvd3MgUGhvbmUnXG4gICAgICAsIG9zbmFtZTogJ1dpbmRvd3MgUGhvbmUnXG4gICAgICAsIHdpbmRvd3NwaG9uZTogdFxuICAgICAgfVxuICAgICAgaWYgKGVkZ2VWZXJzaW9uKSB7XG4gICAgICAgIHJlc3VsdC5tc2VkZ2UgPSB0XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gZWRnZVZlcnNpb25cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQubXNpZSA9IHRcbiAgICAgICAgcmVzdWx0LnZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9pZW1vYmlsZVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL21zaWV8dHJpZGVudC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdJbnRlcm5ldCBFeHBsb3JlcidcbiAgICAgICwgbXNpZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzptc2llIHxydjopKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2hyb21lb3MpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0Nocm9tZSdcbiAgICAgICwgb3NuYW1lOiAnQ2hyb21lIE9TJ1xuICAgICAgLCBjaHJvbWVvczogdFxuICAgICAgLCBjaHJvbWVCb29rOiB0XG4gICAgICAsIGNocm9tZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgvZWRnKFtlYV18aW9zKS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdNaWNyb3NvZnQgRWRnZSdcbiAgICAgICwgbXNlZGdlOiB0XG4gICAgICAsIHZlcnNpb246IGVkZ2VWZXJzaW9uXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC92aXZhbGRpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1ZpdmFsZGknXG4gICAgICAgICwgdml2YWxkaTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3ZpdmFsZGlcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNhaWxmaXNoKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTYWlsZmlzaCdcbiAgICAgICwgb3NuYW1lOiAnU2FpbGZpc2ggT1MnXG4gICAgICAsIHNhaWxmaXNoOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NhaWxmaXNoXFxzP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zZWFtb25rZXlcXC8vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2VhTW9ua2V5J1xuICAgICAgLCBzZWFtb25rZXk6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvc2VhbW9ua2V5XFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvZmlyZWZveHxpY2V3ZWFzZWx8Znhpb3MvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnRmlyZWZveCdcbiAgICAgICwgZmlyZWZveDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpmaXJlZm94fGljZXdlYXNlbHxmeGlvcylbIFxcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgICBpZiAoL1xcKChtb2JpbGV8dGFibGV0KTtbXlxcKV0qcnY6W1xcZFxcLl0rXFwpL2kudGVzdCh1YSkpIHtcbiAgICAgICAgcmVzdWx0LmZpcmVmb3hvcyA9IHRcbiAgICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdGaXJlZm94IE9TJ1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChzaWxrKSB7XG4gICAgICByZXN1bHQgPSAge1xuICAgICAgICBuYW1lOiAnQW1hem9uIFNpbGsnXG4gICAgICAsIHNpbGs6IHRcbiAgICAgICwgdmVyc2lvbiA6IGdldEZpcnN0TWF0Y2goL3NpbGtcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9waGFudG9tL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1BoYW50b21KUydcbiAgICAgICwgcGhhbnRvbTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9waGFudG9tanNcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zbGltZXJqcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdTbGltZXJKUydcbiAgICAgICAgLCBzbGltZXI6IHRcbiAgICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zbGltZXJqc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2JsYWNrYmVycnl8XFxiYmJcXGQrL2kudGVzdCh1YSkgfHwgL3JpbVxcc3RhYmxldC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCbGFja0JlcnJ5J1xuICAgICAgLCBvc25hbWU6ICdCbGFja0JlcnJ5IE9TJ1xuICAgICAgLCBibGFja2JlcnJ5OiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL2JsYWNrYmVycnlbXFxkXStcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHdlYm9zKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXZWJPUydcbiAgICAgICwgb3NuYW1lOiAnV2ViT1MnXG4gICAgICAsIHdlYm9zOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL3coPzplYik/b3Nicm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICAgIC90b3VjaHBhZFxcLy9pLnRlc3QodWEpICYmIChyZXN1bHQudG91Y2hwYWQgPSB0KVxuICAgIH1cbiAgICBlbHNlIGlmICgvYmFkYS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCYWRhJ1xuICAgICAgLCBvc25hbWU6ICdCYWRhJ1xuICAgICAgLCBiYWRhOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL2RvbGZpblxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRpemVuKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdUaXplbidcbiAgICAgICwgb3NuYW1lOiAnVGl6ZW4nXG4gICAgICAsIHRpemVuOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnRpemVuXFxzPyk/YnJvd3NlclxcLyhcXGQrKFxcLlxcZCspPykvaSkgfHwgdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKC9xdXB6aWxsYS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdRdXBaaWxsYSdcbiAgICAgICAgLCBxdXB6aWxsYTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OnF1cHppbGxhKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKSspL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWl1bS9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWl1bSdcbiAgICAgICAgLCBjaHJvbWl1bTogdFxuICAgICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/OmNocm9taXVtKVtcXHNcXC9dKFxcZCsoPzpcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWV8Y3Jpb3N8Y3Jtby9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAgICwgY2hyb21lOiB0XG4gICAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86Y2hyb21lfGNyaW9zfGNybW8pXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChhbmRyb2lkKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdBbmRyb2lkJ1xuICAgICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zYWZhcml8YXBwbGV3ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnU2FmYXJpJ1xuICAgICAgLCBzYWZhcmk6IHRcbiAgICAgIH1cbiAgICAgIGlmICh2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lIDogaW9zZGV2aWNlID09ICdpcGhvbmUnID8gJ2lQaG9uZScgOiBpb3NkZXZpY2UgPT0gJ2lwYWQnID8gJ2lQYWQnIDogJ2lQb2QnXG4gICAgICB9XG4gICAgICAvLyBXVEY6IHZlcnNpb24gaXMgbm90IHBhcnQgb2YgdXNlciBhZ2VudCBpbiB3ZWIgYXBwc1xuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZigvZ29vZ2xlYm90L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0dvb2dsZWJvdCdcbiAgICAgICwgZ29vZ2xlYm90OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL2dvb2dsZWJvdFxcLyhcXGQrKFxcLlxcZCspKS9pKSB8fCB2ZXJzaW9uSWRlbnRpZmllclxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogZ2V0Rmlyc3RNYXRjaCgvXiguKilcXC8oLiopIC8pLFxuICAgICAgICB2ZXJzaW9uOiBnZXRTZWNvbmRNYXRjaCgvXiguKilcXC8oLiopIC8pXG4gICAgIH07XG4gICB9XG5cbiAgICAvLyBzZXQgd2Via2l0IG9yIGdlY2tvIGZsYWcgZm9yIGJyb3dzZXJzIGJhc2VkIG9uIHRoZXNlIGVuZ2luZXNcbiAgICBpZiAoIXJlc3VsdC5tc2VkZ2UgJiYgLyhhcHBsZSk/d2Via2l0L2kudGVzdCh1YSkpIHtcbiAgICAgIGlmICgvKGFwcGxlKT93ZWJraXRcXC81MzdcXC4zNi9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5uYW1lID0gcmVzdWx0Lm5hbWUgfHwgXCJCbGlua1wiXG4gICAgICAgIHJlc3VsdC5ibGluayA9IHRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5uYW1lID0gcmVzdWx0Lm5hbWUgfHwgXCJXZWJraXRcIlxuICAgICAgICByZXN1bHQud2Via2l0ID0gdFxuICAgICAgfVxuICAgICAgaWYgKCFyZXN1bHQudmVyc2lvbiAmJiB2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0Lm9wZXJhICYmIC9nZWNrb1xcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiR2Vja29cIlxuICAgICAgcmVzdWx0LmdlY2tvID0gdFxuICAgICAgcmVzdWx0LnZlcnNpb24gPSByZXN1bHQudmVyc2lvbiB8fCBnZXRGaXJzdE1hdGNoKC9nZWNrb1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICB9XG5cbiAgICAvLyBzZXQgT1MgZmxhZ3MgZm9yIHBsYXRmb3JtcyB0aGF0IGhhdmUgbXVsdGlwbGUgYnJvd3NlcnNcbiAgICBpZiAoIXJlc3VsdC53aW5kb3dzcGhvbmUgJiYgKGFuZHJvaWQgfHwgcmVzdWx0LnNpbGspKSB7XG4gICAgICByZXN1bHQuYW5kcm9pZCA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnQW5kcm9pZCdcbiAgICB9IGVsc2UgaWYgKCFyZXN1bHQud2luZG93c3Bob25lICYmIGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0W2lvc2RldmljZV0gPSB0XG4gICAgICByZXN1bHQuaW9zID0gdFxuICAgICAgcmVzdWx0Lm9zbmFtZSA9ICdpT1MnXG4gICAgfSBlbHNlIGlmIChtYWMpIHtcbiAgICAgIHJlc3VsdC5tYWMgPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ21hY09TJ1xuICAgIH0gZWxzZSBpZiAoeGJveCkge1xuICAgICAgcmVzdWx0Lnhib3ggPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ1hib3gnXG4gICAgfSBlbHNlIGlmICh3aW5kb3dzKSB7XG4gICAgICByZXN1bHQud2luZG93cyA9IHRcbiAgICAgIHJlc3VsdC5vc25hbWUgPSAnV2luZG93cydcbiAgICB9IGVsc2UgaWYgKGxpbnV4KSB7XG4gICAgICByZXN1bHQubGludXggPSB0XG4gICAgICByZXN1bHQub3NuYW1lID0gJ0xpbnV4J1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFdpbmRvd3NWZXJzaW9uIChzKSB7XG4gICAgICBzd2l0Y2ggKHMpIHtcbiAgICAgICAgY2FzZSAnTlQnOiByZXR1cm4gJ05UJ1xuICAgICAgICBjYXNlICdYUCc6IHJldHVybiAnWFAnXG4gICAgICAgIGNhc2UgJ05UIDUuMCc6IHJldHVybiAnMjAwMCdcbiAgICAgICAgY2FzZSAnTlQgNS4xJzogcmV0dXJuICdYUCdcbiAgICAgICAgY2FzZSAnTlQgNS4yJzogcmV0dXJuICcyMDAzJ1xuICAgICAgICBjYXNlICdOVCA2LjAnOiByZXR1cm4gJ1Zpc3RhJ1xuICAgICAgICBjYXNlICdOVCA2LjEnOiByZXR1cm4gJzcnXG4gICAgICAgIGNhc2UgJ05UIDYuMic6IHJldHVybiAnOCdcbiAgICAgICAgY2FzZSAnTlQgNi4zJzogcmV0dXJuICc4LjEnXG4gICAgICAgIGNhc2UgJ05UIDEwLjAnOiByZXR1cm4gJzEwJ1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT1MgdmVyc2lvbiBleHRyYWN0aW9uXG4gICAgdmFyIG9zVmVyc2lvbiA9ICcnO1xuICAgIGlmIChyZXN1bHQud2luZG93cykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0V2luZG93c1ZlcnNpb24oZ2V0Rmlyc3RNYXRjaCgvV2luZG93cyAoKE5UfFhQKSggXFxkXFxkPy5cXGQpPykvaSkpXG4gICAgfSBlbHNlIGlmIChyZXN1bHQud2luZG93c3Bob25lKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC93aW5kb3dzIHBob25lICg/Om9zKT9cXHM/KFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5tYWMpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL01hYyBPUyBYIChcXGQrKFtfXFwuXFxzXVxcZCspKikvaSk7XG4gICAgICBvc1ZlcnNpb24gPSBvc1ZlcnNpb24ucmVwbGFjZSgvW19cXHNdL2csICcuJyk7XG4gICAgfSBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL29zIChcXGQrKFtfXFxzXVxcZCspKikgbGlrZSBtYWMgb3MgeC9pKTtcbiAgICAgIG9zVmVyc2lvbiA9IG9zVmVyc2lvbi5yZXBsYWNlKC9bX1xcc10vZywgJy4nKTtcbiAgICB9IGVsc2UgaWYgKGFuZHJvaWQpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2FuZHJvaWRbIFxcLy1dKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC53ZWJvcykge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvKD86d2VifGhwdylvc1xcLyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQuYmxhY2tiZXJyeSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvcmltXFxzdGFibGV0XFxzb3NcXHMoXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJhZGEpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL2JhZGFcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LnRpemVuKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC90aXplbltcXC9cXHNdKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9XG4gICAgaWYgKG9zVmVyc2lvbikge1xuICAgICAgcmVzdWx0Lm9zdmVyc2lvbiA9IG9zVmVyc2lvbjtcbiAgICB9XG5cbiAgICAvLyBkZXZpY2UgdHlwZSBleHRyYWN0aW9uXG4gICAgdmFyIG9zTWFqb3JWZXJzaW9uID0gIXJlc3VsdC53aW5kb3dzICYmIG9zVmVyc2lvbi5zcGxpdCgnLicpWzBdO1xuICAgIGlmIChcbiAgICAgICAgIHRhYmxldFxuICAgICAgfHwgbmV4dXNUYWJsZXRcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBhZCdcbiAgICAgIHx8IChhbmRyb2lkICYmIChvc01ham9yVmVyc2lvbiA9PSAzIHx8IChvc01ham9yVmVyc2lvbiA+PSA0ICYmICFtb2JpbGUpKSlcbiAgICAgIHx8IHJlc3VsdC5zaWxrXG4gICAgKSB7XG4gICAgICByZXN1bHQudGFibGV0ID0gdFxuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICBtb2JpbGVcbiAgICAgIHx8IGlvc2RldmljZSA9PSAnaXBob25lJ1xuICAgICAgfHwgaW9zZGV2aWNlID09ICdpcG9kJ1xuICAgICAgfHwgYW5kcm9pZFxuICAgICAgfHwgbmV4dXNNb2JpbGVcbiAgICAgIHx8IHJlc3VsdC5ibGFja2JlcnJ5XG4gICAgICB8fCByZXN1bHQud2Vib3NcbiAgICAgIHx8IHJlc3VsdC5iYWRhXG4gICAgKSB7XG4gICAgICByZXN1bHQubW9iaWxlID0gdFxuICAgIH1cblxuICAgIC8vIEdyYWRlZCBCcm93c2VyIFN1cHBvcnRcbiAgICAvLyBodHRwOi8vZGV2ZWxvcGVyLnlhaG9vLmNvbS95dWkvYXJ0aWNsZXMvZ2JzXG4gICAgaWYgKHJlc3VsdC5tc2VkZ2UgfHxcbiAgICAgICAgKHJlc3VsdC5tc2llICYmIHJlc3VsdC52ZXJzaW9uID49IDEwKSB8fFxuICAgICAgICAocmVzdWx0LnlhbmRleGJyb3dzZXIgJiYgcmVzdWx0LnZlcnNpb24gPj0gMTUpIHx8XG5cdFx0ICAgIChyZXN1bHQudml2YWxkaSAmJiByZXN1bHQudmVyc2lvbiA+PSAxLjApIHx8XG4gICAgICAgIChyZXN1bHQuY2hyb21lICYmIHJlc3VsdC52ZXJzaW9uID49IDIwKSB8fFxuICAgICAgICAocmVzdWx0LnNhbXN1bmdCcm93c2VyICYmIHJlc3VsdC52ZXJzaW9uID49IDQpIHx8XG4gICAgICAgIChyZXN1bHQud2hhbGUgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzEuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5temJyb3dzZXIgJiYgY29tcGFyZVZlcnNpb25zKFtyZXN1bHQudmVyc2lvbiwgJzYuMCddKSA9PT0gMSkgfHxcbiAgICAgICAgKHJlc3VsdC5mb2N1cyAmJiBjb21wYXJlVmVyc2lvbnMoW3Jlc3VsdC52ZXJzaW9uLCAnMS4wJ10pID09PSAxKSB8fFxuICAgICAgICAocmVzdWx0LmZpcmVmb3ggJiYgcmVzdWx0LnZlcnNpb24gPj0gMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5vcGVyYSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMC4wKSB8fFxuICAgICAgICAocmVzdWx0LmlvcyAmJiByZXN1bHQub3N2ZXJzaW9uICYmIHJlc3VsdC5vc3ZlcnNpb24uc3BsaXQoXCIuXCIpWzBdID49IDYpIHx8XG4gICAgICAgIChyZXN1bHQuYmxhY2tiZXJyeSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMC4xKVxuICAgICAgICB8fCAocmVzdWx0LmNocm9taXVtICYmIHJlc3VsdC52ZXJzaW9uID49IDIwKVxuICAgICAgICApIHtcbiAgICAgIHJlc3VsdC5hID0gdDtcbiAgICB9XG4gICAgZWxzZSBpZiAoKHJlc3VsdC5tc2llICYmIHJlc3VsdC52ZXJzaW9uIDwgMTApIHx8XG4gICAgICAgIChyZXN1bHQuY2hyb21lICYmIHJlc3VsdC52ZXJzaW9uIDwgMjApIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA8IDIwLjApIHx8XG4gICAgICAgIChyZXN1bHQuc2FmYXJpICYmIHJlc3VsdC52ZXJzaW9uIDwgNikgfHxcbiAgICAgICAgKHJlc3VsdC5vcGVyYSAmJiByZXN1bHQudmVyc2lvbiA8IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPCA2KVxuICAgICAgICB8fCAocmVzdWx0LmNocm9taXVtICYmIHJlc3VsdC52ZXJzaW9uIDwgMjApXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmMgPSB0XG4gICAgfSBlbHNlIHJlc3VsdC54ID0gdFxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgdmFyIGJvd3NlciA9IGRldGVjdCh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvci51c2VyQWdlbnQgfHwgJycgOiAnJylcblxuICBib3dzZXIudGVzdCA9IGZ1bmN0aW9uIChicm93c2VyTGlzdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnJvd3Nlckxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBicm93c2VySXRlbSA9IGJyb3dzZXJMaXN0W2ldO1xuICAgICAgaWYgKHR5cGVvZiBicm93c2VySXRlbT09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoYnJvd3Nlckl0ZW0gaW4gYm93c2VyKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB2ZXJzaW9uIHByZWNpc2lvbnMgY291bnRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBnZXRWZXJzaW9uUHJlY2lzaW9uKFwiMS4xMC4zXCIpIC8vIDNcbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSB2ZXJzaW9uXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGZ1bmN0aW9uIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbikge1xuICAgIHJldHVybiB2ZXJzaW9uLnNwbGl0KFwiLlwiKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogQXJyYXk6Om1hcCBwb2x5ZmlsbFxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheX0gYXJyXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBpdGVyYXRvclxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGZ1bmN0aW9uIG1hcChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdLCBpO1xuICAgIGlmIChBcnJheS5wcm90b3R5cGUubWFwKSB7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFyciwgaXRlcmF0b3IpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChpdGVyYXRvcihhcnJbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYnJvd3NlciB2ZXJzaW9uIHdlaWdodFxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjguMi4xLjkwJ10pICAgIC8vIDFcbiAgICogICBjb21wYXJlVmVyc2lvbnMoWycxLjAxMC4yLjEnLCAnMS4wOS4yLjEuOTAnXSk7ICAvLyAxXG4gICAqICAgY29tcGFyZVZlcnNpb25zKFsnMS4xMC4yLjEnLCAgJzEuMTAuMi4xJ10pOyAgICAgLy8gMFxuICAgKiAgIGNvbXBhcmVWZXJzaW9ucyhbJzEuMTAuMi4xJywgICcxLjA4MDAuMiddKTsgICAgIC8vIC0xXG4gICAqXG4gICAqIEBwYXJhbSAge0FycmF5PFN0cmluZz59IHZlcnNpb25zIHZlcnNpb25zIHRvIGNvbXBhcmVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjb21wYXJpc29uIHJlc3VsdFxuICAgKi9cbiAgZnVuY3Rpb24gY29tcGFyZVZlcnNpb25zKHZlcnNpb25zKSB7XG4gICAgLy8gMSkgZ2V0IGNvbW1vbiBwcmVjaXNpb24gZm9yIGJvdGggdmVyc2lvbnMsIGZvciBleGFtcGxlIGZvciBcIjEwLjBcIiBhbmQgXCI5XCIgaXQgc2hvdWxkIGJlIDJcbiAgICB2YXIgcHJlY2lzaW9uID0gTWF0aC5tYXgoZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uc1swXSksIGdldFZlcnNpb25QcmVjaXNpb24odmVyc2lvbnNbMV0pKTtcbiAgICB2YXIgY2h1bmtzID0gbWFwKHZlcnNpb25zLCBmdW5jdGlvbiAodmVyc2lvbikge1xuICAgICAgdmFyIGRlbHRhID0gcHJlY2lzaW9uIC0gZ2V0VmVyc2lvblByZWNpc2lvbih2ZXJzaW9uKTtcblxuICAgICAgLy8gMikgXCI5XCIgLT4gXCI5LjBcIiAoZm9yIHByZWNpc2lvbiA9IDIpXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbiArIG5ldyBBcnJheShkZWx0YSArIDEpLmpvaW4oXCIuMFwiKTtcblxuICAgICAgLy8gMykgXCI5LjBcIiAtPiBbXCIwMDAwMDAwMDBcIlwiLCBcIjAwMDAwMDAwOVwiXVxuICAgICAgcmV0dXJuIG1hcCh2ZXJzaW9uLnNwbGl0KFwiLlwiKSwgZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoMjAgLSBjaHVuay5sZW5ndGgpLmpvaW4oXCIwXCIpICsgY2h1bms7XG4gICAgICB9KS5yZXZlcnNlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBpdGVyYXRlIGluIHJldmVyc2Ugb3JkZXIgYnkgcmV2ZXJzZWQgY2h1bmtzIGFycmF5XG4gICAgd2hpbGUgKC0tcHJlY2lzaW9uID49IDApIHtcbiAgICAgIC8vIDQpIGNvbXBhcmU6IFwiMDAwMDAwMDA5XCIgPiBcIjAwMDAwMDAxMFwiID0gZmFsc2UgKGJ1dCBcIjlcIiA+IFwiMTBcIiA9IHRydWUpXG4gICAgICBpZiAoY2h1bmtzWzBdW3ByZWNpc2lvbl0gPiBjaHVua3NbMV1bcHJlY2lzaW9uXSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGNodW5rc1swXVtwcmVjaXNpb25dID09PSBjaHVua3NbMV1bcHJlY2lzaW9uXSkge1xuICAgICAgICBpZiAocHJlY2lzaW9uID09PSAwKSB7XG4gICAgICAgICAgLy8gYWxsIHZlcnNpb24gY2h1bmtzIGFyZSBzYW1lXG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGJyb3dzZXIgaXMgdW5zdXBwb3J0ZWRcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICBib3dzZXIuaXNVbnN1cHBvcnRlZEJyb3dzZXIoe1xuICAgKiAgICAgbXNpZTogXCIxMFwiLFxuICAgKiAgICAgZmlyZWZveDogXCIyM1wiLFxuICAgKiAgICAgY2hyb21lOiBcIjI5XCIsXG4gICAqICAgICBzYWZhcmk6IFwiNS4xXCIsXG4gICAqICAgICBvcGVyYTogXCIxNlwiLFxuICAgKiAgICAgcGhhbnRvbTogXCI1MzRcIlxuICAgKiAgIH0pO1xuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9ICBtaW5WZXJzaW9ucyBtYXAgb2YgbWluaW1hbCB2ZXJzaW9uIHRvIGJyb3dzZXJcbiAgICogQHBhcmFtICB7Qm9vbGVhbn0gW3N0cmljdE1vZGUgPSBmYWxzZV0gZmxhZyB0byByZXR1cm4gZmFsc2UgaWYgYnJvd3NlciB3YXNuJ3QgZm91bmQgaW4gbWFwXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIFt1YV0gdXNlciBhZ2VudCBzdHJpbmdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzVW5zdXBwb3J0ZWRCcm93c2VyKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSkge1xuICAgIHZhciBfYm93c2VyID0gYm93c2VyO1xuXG4gICAgLy8gbWFrZSBzdHJpY3RNb2RlIHBhcmFtIG9wdGlvbmFsIHdpdGggdWEgcGFyYW0gdXNhZ2VcbiAgICBpZiAodHlwZW9mIHN0cmljdE1vZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB1YSA9IHN0cmljdE1vZGU7XG4gICAgICBzdHJpY3RNb2RlID0gdm9pZCgwKTtcbiAgICB9XG5cbiAgICBpZiAoc3RyaWN0TW9kZSA9PT0gdm9pZCgwKSkge1xuICAgICAgc3RyaWN0TW9kZSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodWEpIHtcbiAgICAgIF9ib3dzZXIgPSBkZXRlY3QodWEpO1xuICAgIH1cblxuICAgIHZhciB2ZXJzaW9uID0gXCJcIiArIF9ib3dzZXIudmVyc2lvbjtcbiAgICBmb3IgKHZhciBicm93c2VyIGluIG1pblZlcnNpb25zKSB7XG4gICAgICBpZiAobWluVmVyc2lvbnMuaGFzT3duUHJvcGVydHkoYnJvd3NlcikpIHtcbiAgICAgICAgaWYgKF9ib3dzZXJbYnJvd3Nlcl0pIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG1pblZlcnNpb25zW2Jyb3dzZXJdICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyIHZlcnNpb24gaW4gdGhlIG1pblZlcnNpb24gbWFwIHNob3VsZCBiZSBhIHN0cmluZzogJyArIGJyb3dzZXIgKyAnOiAnICsgU3RyaW5nKG1pblZlcnNpb25zKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYnJvd3NlciB2ZXJzaW9uIGFuZCBtaW4gc3VwcG9ydGVkIHZlcnNpb24uXG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVWZXJzaW9ucyhbdmVyc2lvbiwgbWluVmVyc2lvbnNbYnJvd3Nlcl1dKSA8IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaWN0TW9kZTsgLy8gbm90IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYnJvd3NlciBpcyBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBtaW5WZXJzaW9ucyBtYXAgb2YgbWluaW1hbCB2ZXJzaW9uIHRvIGJyb3dzZXJcbiAgICogQHBhcmFtICB7Qm9vbGVhbn0gW3N0cmljdE1vZGUgPSBmYWxzZV0gZmxhZyB0byByZXR1cm4gZmFsc2UgaWYgYnJvd3NlciB3YXNuJ3QgZm91bmQgaW4gbWFwXG4gICAqIEBwYXJhbSAge1N0cmluZ30gIFt1YV0gdXNlciBhZ2VudCBzdHJpbmdcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGNoZWNrKG1pblZlcnNpb25zLCBzdHJpY3RNb2RlLCB1YSkge1xuICAgIHJldHVybiAhaXNVbnN1cHBvcnRlZEJyb3dzZXIobWluVmVyc2lvbnMsIHN0cmljdE1vZGUsIHVhKTtcbiAgfVxuXG4gIGJvd3Nlci5pc1Vuc3VwcG9ydGVkQnJvd3NlciA9IGlzVW5zdXBwb3J0ZWRCcm93c2VyO1xuICBib3dzZXIuY29tcGFyZVZlcnNpb25zID0gY29tcGFyZVZlcnNpb25zO1xuICBib3dzZXIuY2hlY2sgPSBjaGVjaztcblxuICAvKlxuICAgKiBTZXQgb3VyIGRldGVjdCBtZXRob2QgdG8gdGhlIG1haW4gYm93c2VyIG9iamVjdCBzbyB3ZSBjYW5cbiAgICogcmV1c2UgaXQgdG8gdGVzdCBvdGhlciB1c2VyIGFnZW50cy5cbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gaW1wbGVtZW50IGZ1dHVyZSB0ZXN0cy5cbiAgICovXG4gIGJvd3Nlci5fZGV0ZWN0ID0gZGV0ZWN0O1xuXG4gIC8qXG4gICAqIFNldCBvdXIgZGV0ZWN0IHB1YmxpYyBtZXRob2QgdG8gdGhlIG1haW4gYm93c2VyIG9iamVjdFxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBpbXBsZW1lbnQgYm93c2VyIGluIHNlcnZlciBzaWRlXG4gICAqL1xuICBib3dzZXIuZGV0ZWN0ID0gZGV0ZWN0O1xuICByZXR1cm4gYm93c2VyXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcywgY3VzdG9tRG9jdW1lbnQpIHtcbiAgdmFyIGRvYyA9IGN1c3RvbURvY3VtZW50IHx8IGRvY3VtZW50O1xuICBpZiAoZG9jLmNyZWF0ZVN0eWxlU2hlZXQpIHtcbiAgICB2YXIgc2hlZXQgPSBkb2MuY3JlYXRlU3R5bGVTaGVldCgpXG4gICAgc2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICByZXR1cm4gc2hlZXQub3duZXJOb2RlO1xuICB9IGVsc2Uge1xuICAgIHZhciBoZWFkID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0sXG4gICAgICAgIHN0eWxlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICB9XG5cbiAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmJ5VXJsID0gZnVuY3Rpb24odXJsKSB7XG4gIGlmIChkb2N1bWVudC5jcmVhdGVTdHlsZVNoZWV0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVN0eWxlU2hlZXQodXJsKS5vd25lck5vZGU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuXG4gICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgbGluay5ocmVmID0gdXJsO1xuXG4gICAgaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICByZXR1cm4gbGluaztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnY3NzaWZ5Jyk7IiwidmFyIEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xudmFyIExpZ2h0Qm94ID0gcmVxdWlyZSgnLi9saWdodGJveCcpO1xudmFyIENoaWxkV2luZG93ID0gcmVxdWlyZSgnLi9jaGlsZHdpbmRvdycpO1xudmFyIERldmljZSA9IHJlcXVpcmUoJy4vZGV2aWNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiByZWFkeShmbikge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcbiAgICAgICAgICBmbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBBcHAoKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9DT05GSUcpO1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc0luaXRpYXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBvc3RNZXNzYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5jaGlsZFdpbmRvdyA9IG51bGw7XG4gICAgfVxuXG4gICAgQXBwLmV2ZW50VHlwZXMgPSB7XG4gICAgICAgIElOSVQ6ICdpbml0JyxcbiAgICAgICAgT1BFTjogJ29wZW4nLFxuICAgICAgICBPUEVOX1dJTkRPVzogJ29wZW4td2luZG93JyxcbiAgICAgICAgT1BFTl9MSUdIVEJPWDogJ29wZW4tbGlnaHRib3gnLFxuICAgICAgICBMT0FEOiAnbG9hZCcsXG4gICAgICAgIENMT1NFOiAnY2xvc2UnLFxuICAgICAgICBDTE9TRV9XSU5ET1c6ICdjbG9zZS13aW5kb3cnLFxuICAgICAgICBDTE9TRV9MSUdIVEJPWDogJ2Nsb3NlLWxpZ2h0Ym94JyxcbiAgICAgICAgU1RBVFVTOiAnc3RhdHVzJyxcbiAgICAgICAgU1RBVFVTX0lOVk9JQ0U6ICdzdGF0dXMtaW52b2ljZScsXG4gICAgICAgIFNUQVRVU19ERUxJVkVSSU5HOiAnc3RhdHVzLWRlbGl2ZXJpbmcnLFxuICAgICAgICBTVEFUVVNfVFJPVUJMRUQ6ICdzdGF0dXMtdHJvdWJsZWQnLFxuICAgICAgICBTVEFUVVNfRE9ORTogJ3N0YXR1cy1kb25lJyxcbiAgICAgICAgVVNFUl9DT1VOVFJZOiAndXNlci1jb3VudHJ5JyxcbiAgICAgICAgRkNQOiAnZmNwJyxcbiAgICAgICAgRVJST1I6ICdlcnJvcidcbiAgICB9O1xuXG4gICAgdmFyIERFRkFVTFRfQ09ORklHID0ge1xuICAgICAgICBhY2Nlc3NfdG9rZW46IG51bGwsXG4gICAgICAgIGFjY2Vzc19kYXRhOiBudWxsLFxuICAgICAgICBzYW5kYm94OiBmYWxzZSxcbiAgICAgICAgbGlnaHRib3g6IHt9LFxuICAgICAgICBjaGlsZFdpbmRvdzoge30sXG4gICAgICAgIGhvc3Q6ICdzZWN1cmUueHNvbGxhLmNvbScsXG4gICAgICAgIGlmcmFtZU9ubHk6IGZhbHNlLFxuICAgICAgICBjb25zZW50SWQ6IG51bGxcbiAgICB9O1xuICAgIHZhciBTQU5EQk9YX1BBWVNUQVRJT05fVVJMID0gJ2h0dHBzOi8vc2FuZGJveC1zZWN1cmUueHNvbGxhLmNvbS9wYXlzdGF0aW9uMi8/JztcbiAgICB2YXIgRVZFTlRfTkFNRVNQQUNFID0gJy54cGF5c3RhdGlvbi13aWRnZXQnO1xuICAgIHZhciBBVFRSX1BSRUZJWCA9ICdkYXRhLXhwYXlzdGF0aW9uLXdpZGdldC1vcGVuJztcblxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXG4gICAgQXBwLnByb3RvdHlwZS5jb25maWcgPSB7fTtcbiAgICBBcHAucHJvdG90eXBlLmlzSW5pdGlhdGVkID0gZmFsc2U7XG4gICAgQXBwLnByb3RvdHlwZS5ldmVudE9iamVjdCA9IEhlbHBlcnMuYWRkRXZlbnRPYmplY3QodGhpcyk7XG5cbiAgICBBcHAucHJvdG90eXBlLmdldFBheW1lbnRVcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5wYXltZW50X3VybCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLnBheW1lbnRfdXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLmNvbmZpZy5xdWVyeVBhcmFtcyB8fCB7fTtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgcXVlcnkuYWNjZXNzX3Rva2VuID0gdGhpcy5jb25maWcuYWNjZXNzX3Rva2VuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcXVlcnkuYWNjZXNzX2RhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmNvbmZpZy5hY2Nlc3NfZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1cmxXaXRob3V0UXVlcnlQYXJhbXMgPSB0aGlzLmNvbmZpZy5zYW5kYm94ID9cbiAgICAgICAgICAgIFNBTkRCT1hfUEFZU1RBVElPTl9VUkwgOlxuICAgICAgICAgICAgJ2h0dHBzOi8vJyArIHRoaXMuY29uZmlnLmhvc3QgKyAnL3BheXN0YXRpb24yLz8nO1xuXG4gICAgICAgIGNvbnN0IHBheW1lbnRVcmwgPSB1cmxXaXRob3V0UXVlcnlQYXJhbXMgKyBIZWxwZXJzLnBhcmFtKHF1ZXJ5KTtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuY29uc2VudElkKSB7XG4gICAgICAgICAgICByZXR1cm4gSGVscGVycy5nZXRQYXltZW50VXJsV2l0aENvbnNlbnRJZChwYXltZW50VXJsLCB0aGlzLmNvbmZpZy5jb25zZW50SWQpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF5bWVudFVybDtcbiAgICB9O1xuXG4gICAgQXBwLnByb3RvdHlwZS5jaGVja0NvbmZpZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKEhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5hY2Nlc3NfdG9rZW4pICYmIEhlbHBlcnMuaXNFbXB0eSh0aGlzLmNvbmZpZy5hY2Nlc3NfZGF0YSkgJiYgSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLnBheW1lbnRfdXJsKSkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKCdObyBhY2Nlc3MgdG9rZW4gb3IgYWNjZXNzIGRhdGEgb3IgcGF5bWVudCBVUkwgZ2l2ZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmFjY2Vzc19kYXRhKSAmJiB0eXBlb2YgdGhpcy5jb25maWcuYWNjZXNzX2RhdGEgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0ludmFsaWQgYWNjZXNzIGRhdGEgZm9ybWF0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoSGVscGVycy5pc0VtcHR5KHRoaXMuY29uZmlnLmhvc3QpKSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ0ludmFsaWQgaG9zdCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUuY2hlY2tBcHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzSW5pdGlhdGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignSW5pdGlhbGl6ZSB3aWRnZXQgYmVmb3JlIG9wZW5pbmcnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLnRocm93RXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKG1lc3NhZ2UpO1xuICAgIH07XG5cbiAgICBBcHAucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChhcmd1bWVudHMsIChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcbiAgICAgICAgICAgICAgICBldmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihldmVudE5hbWUsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEFwcC5wcm90b3R5cGUudHJpZ2dlckN1c3RvbUV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge2RldGFpbDogZGF0YX0pOyAvLyBOb3Qgd29ya2luZyBpbiBJRVxuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgICAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2lkZ2V0IHdpdGggb3B0aW9uc1xuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBmdW5jdGlvbiBpbml0aWFsaXplKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbml0aWF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX0NPTkZJRywgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHZhciBib2R5RWxlbWVudCA9IGdsb2JhbC5kb2N1bWVudC5ib2R5O1xuICAgICAgICAgICAgdmFyIGNsaWNrRXZlbnROYW1lID0gJ2NsaWNrJyArIEVWRU5UX05BTUVTUEFDRTtcblxuICAgICAgICAgICAgdmFyIGhhbmRsZUNsaWNrRXZlbnQgPSAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1snICsgQVRUUl9QUkVGSVggKyAnXScpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2VFdmVudC50YXJnZXQgPT09IHRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuLmNhbGwodGhpcywgdGFyZ2V0RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50TmFtZSwgaGFuZGxlQ2xpY2tFdmVudCk7XG5cbiAgICAgICAgICAgIHZhciBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgICAgICBjbGlja0V2ZW50LmluaXRFdmVudChjbGlja0V2ZW50TmFtZSwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGNsaWNrRXZlbnQuc291cmNlRXZlbnQgPSBldmVudDtcbiAgICAgICAgICAgICAgICBib2R5RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpO1xuXG4gICAgICAgICAgICBib2R5RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGNsaWNrRXZlbnROYW1lLCBoYW5kbGVDbGlja0V2ZW50KTtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLklOSVQpO1xuICAgICAgICB9XG4gICAgICAgIHJlYWR5KGluaXRpYWxpemUuYmluZCh0aGlzLCBvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3BlbiBwYXltZW50IGludGVyZmFjZSAoUGF5U3RhdGlvbilcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tDb25maWcoKTtcbiAgICAgICAgdGhpcy5jaGVja0FwcCgpO1xuXG4gICAgICAgIHZhciB0cmlnZ2VyU3BsaXRTdGF0dXMgPSAoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoKChkYXRhIHx8IHt9KS5wYXltZW50SW5mbyB8fCB7fSkuc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW52b2ljZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19JTlZPSUNFLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsaXZlcmluZyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLlNUQVRVU19ERUxJVkVSSU5HLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndHJvdWJsZWQnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5TVEFUVVNfVFJPVUJMRUQsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkb25lJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTX0RPTkUsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKTtcblxuICAgICAgICB2YXIgdXJsID0gdGhpcy5nZXRQYXltZW50VXJsKCk7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVTdGF0dXMoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0dXNEYXRhID0gZXZlbnQuZGV0YWlsO1xuICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuU1RBVFVTLCBzdGF0dXNEYXRhKTtcbiAgICAgICAgICAgIHRyaWdnZXJTcGxpdFN0YXR1cyhzdGF0dXNEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVVzZXJMb2NhbGUoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB1c2VyQ291bnRyeSA9IHtcbiAgICAgICAgICAgICAgICB1c2VyX2NvdW50cnk6IGV2ZW50LmRldGFpbC51c2VyX2NvdW50cnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGF0LnRyaWdnZXJDdXN0b21FdmVudChBcHAuZXZlbnRUeXBlcy5VU0VSX0NPVU5UUlksIHVzZXJDb3VudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUZjcChldmVudCkge1xuICAgICAgICAgICAgdGhhdC50cmlnZ2VyQ3VzdG9tRXZlbnQoQXBwLmV2ZW50VHlwZXMuRkNQLCBldmVudC5kZXRhaWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoYXQudHJpZ2dlckN1c3RvbUV2ZW50KEFwcC5ldmVudFR5cGVzLkVSUk9SLCBldmVudC5kZXRhaWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wb3N0TWVzc2FnZSA9IG51bGw7XG4gICAgICAgIGlmICgobmV3IERldmljZSkuaXNNb2JpbGUoKSAmJiAhdGhpcy5jb25maWcuaWZyYW1lT25seSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkV2luZG93ID0gbmV3IENoaWxkV2luZG93O1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ29wZW4nLCBmdW5jdGlvbiBoYW5kbGVPcGVuKCkge1xuICAgICAgICAgICAgICAgIHRoYXQucG9zdE1lc3NhZ2UgPSBjaGlsZFdpbmRvdy5nZXRQb3N0TWVzc2FnZSgpO1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU4pO1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLk9QRU5fV0lORE9XKTtcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ29wZW4nLCBoYW5kbGVPcGVuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub24oJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkxPQUQpO1xuICAgICAgICAgICAgICAgIGNoaWxkV2luZG93Lm9mZignbG9hZCcsIGhhbmRsZUxvYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0VfV0lORE9XKTtcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ3N0YXR1cycsIGhhbmRsZVN0YXR1cyk7XG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XG4gICAgICAgICAgICAgICAgY2hpbGRXaW5kb3cub2ZmKEFwcC5ldmVudFR5cGVzLkZDUCwgaGFuZGxlRmNwKTtcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoQXBwLmV2ZW50VHlwZXMuRVJST1IsIGhhbmRsZUVycm9yKTtcbiAgICAgICAgICAgICAgICBjaGlsZFdpbmRvdy5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcbiAgICAgICAgICAgIGNoaWxkV2luZG93Lm9uKEFwcC5ldmVudFR5cGVzLlVTRVJfQ09VTlRSWSwgaGFuZGxlVXNlckxvY2FsZSk7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbihBcHAuZXZlbnRUeXBlcy5GQ1AsIGhhbmRsZUZjcCk7XG4gICAgICAgICAgICBjaGlsZFdpbmRvdy5vbihBcHAuZXZlbnRUeXBlcy5FUlJPUiwgaGFuZGxlRXJyb3IpO1xuICAgICAgICAgICAgY2hpbGRXaW5kb3cub3Blbih1cmwsIHRoaXMuY29uZmlnLmNoaWxkV2luZG93KTtcbiAgICAgICAgICAgIHRoYXQuY2hpbGRXaW5kb3cgPSBjaGlsZFdpbmRvdztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsaWdodEJveCA9IG5ldyBMaWdodEJveCgobmV3IERldmljZSkuaXNNb2JpbGUoKSAmJiB0aGlzLmNvbmZpZy5pZnJhbWVPbmx5KTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdvcGVuJywgZnVuY3Rpb24gaGFuZGxlT3BlbigpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnBvc3RNZXNzYWdlID0gbGlnaHRCb3guZ2V0UG9zdE1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOKTtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5PUEVOX0xJR0hUQk9YKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoJ29wZW4nLCBoYW5kbGVPcGVuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGlnaHRCb3gub24oJ2xvYWQnLCBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KEFwcC5ldmVudFR5cGVzLkxPQUQpO1xuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignbG9hZCcsIGhhbmRsZUxvYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaWdodEJveC5vbignY2xvc2UnLCBmdW5jdGlvbiBoYW5kbGVDbG9zZSgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudChBcHAuZXZlbnRUeXBlcy5DTE9TRSk7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoQXBwLmV2ZW50VHlwZXMuQ0xPU0VfTElHSFRCT1gpO1xuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignc3RhdHVzJywgaGFuZGxlU3RhdHVzKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCBoYW5kbGVVc2VyTG9jYWxlKTtcbiAgICAgICAgICAgICAgICBsaWdodEJveC5vZmYoQXBwLmV2ZW50VHlwZXMuRkNQLCBoYW5kbGVGY3ApO1xuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZihBcHAuZXZlbnRUeXBlcy5FUlJPUiwgaGFuZGxlRXJyb3IpO1xuICAgICAgICAgICAgICAgIGxpZ2h0Qm94Lm9mZignY2xvc2UnLCBoYW5kbGVDbG9zZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKCdzdGF0dXMnLCBoYW5kbGVTdGF0dXMpO1xuICAgICAgICAgICAgbGlnaHRCb3gub24oQXBwLmV2ZW50VHlwZXMuVVNFUl9DT1VOVFJZLCBoYW5kbGVVc2VyTG9jYWxlKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKEFwcC5ldmVudFR5cGVzLkZDUCwgaGFuZGxlRmNwKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Lm9uKEFwcC5ldmVudFR5cGVzLkVSUk9SLCBoYW5kbGVFcnJvcik7XG4gICAgICAgICAgICBsaWdodEJveC5vcGVuRnJhbWUodXJsLCB0aGlzLmNvbmZpZy5saWdodGJveCk7XG4gICAgICAgICAgICB0aGF0LmNoaWxkV2luZG93ID0gbGlnaHRCb3g7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBwYXltZW50IGludGVyZmFjZSAoUGF5U3RhdGlvbilcbiAgICAgKi9cbiAgICBBcHAucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNoaWxkV2luZG93LmNsb3NlKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIGZvciBvbmUgb3IgbW9yZSBldmVudHMgdG8gdGhlIHdpZGdldFxuICAgICAqIEBwYXJhbSBldmVudCBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXMgKGluaXQsIG9wZW4sIGxvYWQsIGNsb3NlLCBzdGF0dXMsIHN0YXR1cy1pbnZvaWNlLCBzdGF0dXMtZGVsaXZlcmluZywgc3RhdHVzLXRyb3VibGVkLCBzdGF0dXMtZG9uZSlcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBBIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub24oZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYW4gZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSBldmVudCBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXNcbiAgICAgKiBAcGFyYW0gaGFuZGxlciBBIGhhbmRsZXIgZnVuY3Rpb24gcHJldmlvdXNseSBhdHRhY2hlZCBmb3IgdGhlIGV2ZW50KHMpXG4gICAgICovXG4gICAgQXBwLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSBkaXJlY3RseSB0byBQYXlTdGF0aW9uXG4gICAgICogQHBhcmFtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbiAoY29tbWFuZCwgZGF0YSkge1xuICAgICAgICBpZiAodGhpcy5wb3N0TWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5wb3N0TWVzc2FnZS5zZW5kLmFwcGx5KHRoaXMucG9zdE1lc3NhZ2UsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gZm9yIG1lc3NhZ2UgZXZlbnQgZnJvbSBQYXlTdGF0aW9uXG4gICAgICogQHBhcmFtIGNvbW1hbmRcbiAgICAgKiBAcGFyYW0gaGFuZGxlclxuICAgICAqL1xuICAgIEFwcC5wcm90b3R5cGUub25NZXNzYWdlID0gZnVuY3Rpb24gKGNvbW1hbmQsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucG9zdE1lc3NhZ2Uub24uYXBwbHkodGhpcy5wb3N0TWVzc2FnZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gQXBwO1xufSkoKTtcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJyk7XG52YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xudmFyIFBvc3RNZXNzYWdlID0gcmVxdWlyZSgnLi9wb3N0bWVzc2FnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2hpbGRXaW5kb3coKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIENoaWxkV2luZG93Ll9OQU1FU1BBQ0UgKyAnXycgKyBldmVudE5hbWU7XG4gICAgfVxuXG4gICAgdmFyIERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJ1xuICAgIH07XG5cbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5ldmVudE9iamVjdCA9IG51bGw7XG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmNoaWxkV2luZG93ID0gbnVsbDtcblxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC50cmlnZ2VyKGV2ZW50LCBkYXRhKTtcbiAgICB9O1xuXG4gICAgLyoqIFB1YmxpYyBNZW1iZXJzICoqL1xuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdyAmJiAhdGhpcy5jaGlsZFdpbmRvdy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRXaW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIGFkZEhhbmRsZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gY2xvc2VDaGlsZFdpbmRvdygpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9mZignY2xvc2UnLCBjbG9zZUNoaWxkV2luZG93KVxuXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5jbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhhdC5jaGlsZFdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmNoaWxkV2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0Lm9uKCdjbG9zZScsIGNsb3NlQ2hpbGRXaW5kb3cpO1xuXG4gICAgICAgICAgICAvLyBDcm9zcy13aW5kb3cgY29tbXVuaWNhdGlvblxuICAgICAgICAgICAgdGhhdC5tZXNzYWdlID0gbmV3IFBvc3RNZXNzYWdlKHRoYXQuY2hpbGRXaW5kb3cpO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdkaW1lbnNpb25zIHdpZGdldC1kZXRlY3Rpb24nLCBmdW5jdGlvbiBoYW5kbGVXaWRnZXREZXRlY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyRXZlbnQoJ2xvYWQnKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub2ZmKCdkaW1lbnNpb25zIHdpZGdldC1kZXRlY3Rpb24nLCBoYW5kbGVXaWRnZXREZXRlY3Rpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub24oJ3dpZGdldC1kZXRlY3Rpb24nLCBmdW5jdGlvbiBoYW5kbGVXaWRnZXREZXRlY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5tZXNzYWdlLnNlbmQoJ3dpZGdldC1kZXRlY3RlZCcsIHt2ZXJzaW9uOiB2ZXJzaW9uLCBjaGlsZFdpbmRvd09wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub2ZmKCd3aWRnZXQtZGV0ZWN0aW9uJywgaGFuZGxlV2lkZ2V0RGV0ZWN0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdzdGF0dXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudCgnc3RhdHVzJywgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdjbG9zZScsIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xuICAgICAgICAgICAgICAgIGNsb3NlQ2hpbGRXaW5kb3coKTtcbiAgICAgICAgICAgICAgICB0aGF0Lm1lc3NhZ2Uub2ZmKCdjbG9zZScsIGhhbmRsZUNsb3NlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCd1c2VyLWNvdW50cnknLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudCgndXNlci1jb3VudHJ5JywgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdmY3AnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnRyaWdnZXJFdmVudCgnZmNwJywgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhhdC5tZXNzYWdlLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlckV2ZW50KCdlcnJvcicsIGV2ZW50LmRldGFpbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgICAgICBjYXNlICdfc2VsZic6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdyA9IGdsb2JhbC53aW5kb3c7XG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdfcGFyZW50JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgYWRkSGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdfYmxhbmsnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkV2luZG93ID0gZ2xvYmFsLndpbmRvdy5vcGVuKHVybCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFdpbmRvdy5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXJzKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tXaW5kb3cgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGlsZFdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hpbGRXaW5kb3cuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyID0gZ2xvYmFsLnNldFRpbWVvdXQoY2hlY2tXaW5kb3csIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciB0aW1lciA9IGdsb2JhbC5zZXRUaW1lb3V0KGNoZWNrV2luZG93LCAxMDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ29wZW4nKTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xvc2UnKTtcbiAgICB9O1xuXG4gICAgQ2hpbGRXaW5kb3cucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vZmYoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBDaGlsZFdpbmRvdy5wcm90b3R5cGUuZ2V0UG9zdE1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfTtcblxuICAgIENoaWxkV2luZG93Ll9OQU1FU1BBQ0UgPSAnQ0hJTERfV0lORE9XJztcblxuICAgIHJldHVybiBDaGlsZFdpbmRvdztcbn0pKCk7XG4iLCJ2YXIgYm93c2VyID0gcmVxdWlyZSgnYm93c2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBEZXZpY2UoKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW9iaWxlIGRldmljZXNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBEZXZpY2UucHJvdG90eXBlLmlzTW9iaWxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBib3dzZXIubW9iaWxlIHx8IGJvd3Nlci50YWJsZXQ7XG4gICAgfTtcblxuICAgIHJldHVybiBEZXZpY2U7XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdGhpcy5uYW1lID0gXCJYc29sbGFQYXlTdGF0aW9uV2lkZ2V0RXhjZXB0aW9uXCI7XG4gICAgdGhpcy50b1N0cmluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyAnOiAnICsgdGhpcy5tZXNzYWdlO1xuICAgIH0pLmJpbmQodGhpcyk7XG59O1xuIiwiZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB1bmlxKGxpc3QpIHtcbiAgICByZXR1cm4gbGlzdC5maWx0ZXIoZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgcmV0dXJuIGEuaW5kZXhPZih4KSA9PSBpXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHppcE9iamVjdChwcm9wcywgdmFsdWVzKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IHByb3BzID8gcHJvcHMubGVuZ3RoIDogMCxcbiAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICBpZiAobGVuZ3RoICYmICF2YWx1ZXMgJiYgIUFycmF5LmlzQXJyYXkocHJvcHNbMF0pKSB7XG4gICAgICAgIHZhbHVlcyA9IFtdO1xuICAgIH1cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlc1tpbmRleF07XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5KSB7XG4gICAgICAgICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwYXJhbShhKSB7XG4gICAgdmFyIHMgPSBbXTtcblxuICAgIHZhciBhZGQgPSBmdW5jdGlvbiAoaywgdikge1xuICAgICAgICB2ID0gdHlwZW9mIHYgPT09ICdmdW5jdGlvbicgPyB2KCkgOiB2O1xuICAgICAgICB2ID0gdiA9PT0gbnVsbCA/ICcnIDogdiA9PT0gdW5kZWZpbmVkID8gJycgOiB2O1xuICAgICAgICBzW3MubGVuZ3RoXSA9IGVuY29kZVVSSUNvbXBvbmVudChrKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2KTtcbiAgICB9O1xuXG4gICAgdmFyIGJ1aWxkUGFyYW1zID0gZnVuY3Rpb24gKHByZWZpeCwgb2JqKSB7XG4gICAgICAgIHZhciBpLCBsZW4sIGtleTtcblxuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMCwgbGVuID0gb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFyYW1zKFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ICsgJ1snICsgKHR5cGVvZiBvYmpbaV0gPT09ICdvYmplY3QnICYmIG9ialtpXSA/IGkgOiAnJykgKyAnXScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbaV1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFN0cmluZyhvYmopID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhwcmVmaXggKyAnWycgKyBrZXkgKyAnXScsIG9ialtrZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZChwcmVmaXgsIG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBvYmoubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhZGQob2JqW2ldLm5hbWUsIG9ialtpXS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBidWlsZFBhcmFtcyhrZXksIG9ialtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIGJ1aWxkUGFyYW1zKCcnLCBhKS5qb2luKCcmJyk7XG59O1xuXG5cbmZ1bmN0aW9uIG9uY2UoZikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGYoYXJndW1lbnRzKTtcbiAgICAgICAgZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50T2JqZWN0KGNvbnRleHQsIHdyYXBFdmVudEluTmFtZXNwYWNlKSB7XG4gICAgdmFyIGR1bW15V3JhcHBlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnRcbiAgICB9O1xuICAgIHZhciB3cmFwRXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlIHx8IGR1bW15V3JhcHBlcjtcbiAgICB2YXIgZXZlbnRzTGlzdCA9IFtdO1xuICAgIHZhciBoYW5kbGVycyA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICBmdW5jdGlvbiBpc1N0cmluZ0NvbnRhaW5lZFNwYWNlKHN0cikge1xuICAgICAgICByZXR1cm4gLyAvLnRlc3Qoc3RyKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRyaWdnZXI6IChmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRJbk5hbWVzcGFjZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudEluTmFtZXNwYWNlLCB7ZGV0YWlsOiBkYXRhfSk7IC8vIE5vdCB3b3JraW5nIGluIElFXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgICAgICAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50SW5OYW1lc3BhY2UsIHRydWUsIHRydWUsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH0pLmJpbmQoY29udGV4dCksXG4gICAgICAgIG9uOiAoZnVuY3Rpb24gKGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRFdmVudChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJEZWNvcmF0b3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlKGV2ZW50LCBldmVudC5kZXRhaWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNldChoYW5kbGUsIGhhbmRsZXJEZWNvcmF0b3IpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50SW5OYW1lc3BhY2UgPSB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRJbk5hbWVzcGFjZSwgaGFuZGxlckRlY29yYXRvciwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgZXZlbnRzTGlzdC5wdXNoKHtuYW1lOiBldmVudEluTmFtZXNwYWNlLCBoYW5kbGU6IGhhbmRsZXJEZWNvcmF0b3IsIG9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nQ29udGFpbmVkU3BhY2UoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAocGFyc2VkRXZlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZEV2ZW50KHBhcnNlZEV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KS5iaW5kKGNvbnRleHQpLFxuXG4gICAgICAgIG9mZjogKGZ1bmN0aW9uIChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3Qgb2ZmQWxsRXZlbnRzID0gIWV2ZW50TmFtZSAmJiAhaGFuZGxlICYmICFvcHRpb25zO1xuXG4gICAgICAgICAgICBpZiAob2ZmQWxsRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50Lm5hbWUsIGV2ZW50LmhhbmRsZSwgZXZlbnQub3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZW1vdmVFdmVudChldmVudE5hbWUsIGhhbmRsZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHZhciBldmVudEluTmFtZXNwYWNlID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoZXZlbnROYW1lKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXJEZWNvcmF0b3IgPSBoYW5kbGVycy5nZXQoaGFuZGxlKTtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRJbk5hbWVzcGFjZSwgaGFuZGxlckRlY29yYXRvciwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgZXZlbnRzTGlzdCA9IGV2ZW50c0xpc3QuZmlsdGVyKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnQubmFtZSAhPT0gZXZlbnRJbk5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzU3RyaW5nQ29udGFpbmVkU3BhY2UoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAocGFyc2VkRXZlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50KHBhcnNlZEV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50KGV2ZW50TmFtZSwgaGFuZGxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KS5iaW5kKGNvbnRleHQpXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UGF5bWVudFVybFdpdGhDb25zZW50SWQodXJsLCBjb25zZW50SWQpIHtcbiAgICBsZXQgcGF5bWVudFVybCA9IG5ldyBVUkwodXJsKTtcblxuICAgIHBheW1lbnRVcmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnY29uc2VudElkJywgY29uc2VudElkKTtcblxuICAgIHJldHVybiBwYXltZW50VXJsLnRvU3RyaW5nKCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgYWRkRXZlbnRPYmplY3Q6IGFkZEV2ZW50T2JqZWN0LFxuICAgIGlzRW1wdHk6IGlzRW1wdHksXG4gICAgdW5pcTogdW5pcSxcbiAgICB6aXBPYmplY3Q6IHppcE9iamVjdCxcbiAgICBwYXJhbTogcGFyYW0sXG4gICAgb25jZTogb25jZSxcbiAgICBnZXRQYXltZW50VXJsV2l0aENvbnNlbnRJZDogZ2V0UGF5bWVudFVybFdpdGhDb25zZW50SWRcbn1cbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJyk7XG52YXIgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xudmFyIFBvc3RNZXNzYWdlID0gcmVxdWlyZSgnLi9wb3N0bWVzc2FnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTGlnaHRCb3goaXNNb2JpbGUpIHtcbiAgICAgICAgcmVxdWlyZSgnLi9zdHlsZXMvbGlnaHRib3guc2NzcycpO1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0ID0gSGVscGVycy5hZGRFdmVudE9iamVjdCh0aGlzLCB3cmFwRXZlbnRJbk5hbWVzcGFjZSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IGlzTW9iaWxlID8gREVGQVVMVF9PUFRJT05TX01PQklMRSA6IERFRkFVTFRfT1BUSU9OUztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgQ0xBU1NfUFJFRklYID0gJ3hwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveCc7XG4gICAgdmFyIENPTU1PTl9PUFRJT05TID0ge1xuICAgICAgICB6SW5kZXg6IDEwMDAsXG4gICAgICAgIG92ZXJsYXlPcGFjaXR5OiAnLjYnLFxuICAgICAgICBvdmVybGF5QmFja2dyb3VuZDogJyMwMDAwMDAnLFxuICAgICAgICBjb250ZW50QmFja2dyb3VuZDogJyNmZmZmZmYnLFxuICAgICAgICBjbG9zZUJ5S2V5Ym9hcmQ6IHRydWUsXG4gICAgICAgIGNsb3NlQnlDbGljazogdHJ1ZSxcbiAgICAgICAgbW9kYWw6IGZhbHNlLFxuICAgICAgICBzcGlubmVyOiAneHNvbGxhJyxcbiAgICAgICAgc3Bpbm5lckNvbG9yOiBudWxsLFxuICAgICAgICBzcGlubmVyVXJsOiBudWxsLFxuICAgICAgICBzcGlubmVyUm90YXRpb25QZXJpb2Q6IDBcbiAgICB9O1xuICAgIHZhciBERUZBVUxUX09QVElPTlMgPSBPYmplY3QuYXNzaWduKHt9LCBDT01NT05fT1BUSU9OUywge1xuICAgICAgICB3aWR0aDogbnVsbCxcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgIGNvbnRlbnRNYXJnaW46ICcxMHB4J1xuICAgIH0pO1xuICAgIHZhciBERUZBVUxUX09QVElPTlNfTU9CSUxFID0gT2JqZWN0LmFzc2lnbih7fSwgQ09NTU9OX09QVElPTlMsIHtcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgaGVpZ2h0OiAnMTAwJScsIFxuICAgICAgICBjb250ZW50TWFyZ2luOiAnMHB4J1xuICAgIH0pO1xuXG4gICAgdmFyIFNQSU5ORVJTID0ge1xuICAgICAgICB4c29sbGE6IHJlcXVpcmUoJy4vc3Bpbm5lcnMveHNvbGxhLnN2ZycpLFxuICAgICAgICByb3VuZDogcmVxdWlyZSgnLi9zcGlubmVycy9yb3VuZC5zdmcnKSxcbiAgICAgICAgbm9uZTogJyAnXG4gICAgfTtcblxuICAgIHZhciBNSU5fUFNfRElNRU5TSU9OUyA9IHtcbiAgICAgICAgaGVpZ2h0OiA1MDAsXG4gICAgICAgIHdpZHRoOiA2MDBcbiAgICB9O1xuXG4gICAgdmFyIGhhbmRsZUtleXVwRXZlbnROYW1lID0gd3JhcEV2ZW50SW5OYW1lc3BhY2UoJ2tleXVwJyk7XG4gICAgdmFyIGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSA9IHdyYXBFdmVudEluTmFtZXNwYWNlKCdyZXNpemUnKTtcblxuICAgIHZhciBoYW5kbGVHbG9iYWxLZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgY2xpY2tFdmVudC5pbml0RXZlbnQoaGFuZGxlS2V5dXBFdmVudE5hbWUsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgY2xpY2tFdmVudC5zb3VyY2VFdmVudCA9IGV2ZW50O1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlU3BlY2lmaWNLZXl1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5zb3VyY2VFdmVudC53aGljaCA9PSAyNykge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlR2xvYmFsUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXNpemVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICByZXNpemVFdmVudC5pbml0RXZlbnQoaGFuZGxlUmVzaXplRXZlbnROYW1lLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQocmVzaXplRXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXBFdmVudEluTmFtZXNwYWNlKGV2ZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gTGlnaHRCb3guX05BTUVTUEFDRSArICdfJyArIGV2ZW50TmFtZTtcbiAgICB9XG5cbiAgICAvKiogUHJpdmF0ZSBNZW1iZXJzICoqL1xuICAgIExpZ2h0Qm94LnByb3RvdHlwZS50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlci5hcHBseSh0aGlzLmV2ZW50T2JqZWN0LCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaWdodEJveC5wcm90b3R5cGUubWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoOiBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9kZXRlY3Qtc2Nyb2xsYmFyLXdpZHRoXG4gICAgICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JvbGxEaXYuY2xhc3NMaXN0LmFkZChcInNjcm9sbGJhci1tZWFzdXJlXCIpO1xuICAgICAgICBzY3JvbGxEaXYuc2V0QXR0cmlidXRlKFwic3R5bGVcIixcbiAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICtcbiAgICAgICAgICAgIFwidG9wOiAtOTk5OXB4XCIgK1xuICAgICAgICAgICAgXCJ3aWR0aDogNTBweFwiICtcbiAgICAgICAgICAgIFwiaGVpZ2h0OiA1MHB4XCIgK1xuICAgICAgICAgICAgXCJvdmVyZmxvdzogc2Nyb2xsXCJcbiAgICAgICAgKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XG5cbiAgICAgICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcm9sbERpdik7XG5cbiAgICAgICAgcmV0dXJuIHNjcm9sbGJhcldpZHRoO1xuICAgIH07XG5cbiAgICAvKiogUHVibGljIE1lbWJlcnMgKiovXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9wZW5GcmFtZSA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgdmFyIEhhbmRsZUJvdW5kU3BlY2lmaWNLZXl1cCA9IGhhbmRsZVNwZWNpZmljS2V5dXAuYmluZCh0aGlzKTtcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICB2YXIgc3Bpbm5lciA9IG9wdGlvbnMuc3Bpbm5lciA9PT0gJ2N1c3RvbScgJiYgISFvcHRpb25zLnNwaW5uZXJVcmwgP1xuICAgICAgICAgICAgJzxpbWcgY2xhc3M9XCJzcGlubmVyLWN1c3RvbVwiIHNyYz1cIicgKyBlbmNvZGVVUkkob3B0aW9ucy5zcGlubmVyVXJsKSArICdcIiAvPicgOiBTUElOTkVSU1tvcHRpb25zLnNwaW5uZXJdIHx8IE9iamVjdC52YWx1ZXMoU1BJTk5FUlMpWzBdO1xuXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgICAgICAgICAgdmFyIGhvc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhvc3QuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4O1xuXG4gICAgICAgICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgb3ZlcmxheS5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLW92ZXJsYXknO1xuXG4gICAgICAgICAgICB2YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgY29udGVudC5jbGFzc05hbWUgPSBzZXR0aW5ncy5wcmVmaXggKyAnLWNvbnRlbnQnICsgJyAnICsgc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50X19oaWRkZW4nO1xuXG4gICAgICAgICAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgICAgICBpZnJhbWUuY2xhc3NOYW1lID0gc2V0dGluZ3MucHJlZml4ICsgJy1jb250ZW50LWlmcmFtZSc7XG4gICAgICAgICAgICBpZnJhbWUuc3JjID0gc2V0dGluZ3MudXJsO1xuICAgICAgICAgICAgaWZyYW1lLmZyYW1lQm9yZGVyID0gJzAnO1xuICAgICAgICAgICAgaWZyYW1lLmFsbG93RnVsbHNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBpZnJhbWUuYWxsb3cgPSAncGF5bWVudCc7XG5cbiAgICAgICAgICAgIHZhciBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBzcGlubmVyLmNsYXNzTmFtZSA9IHNldHRpbmdzLnByZWZpeCArICctc3Bpbm5lcic7XG4gICAgICAgICAgICBzcGlubmVyLmlubmVySFRNTCA9IHNldHRpbmdzLnNwaW5uZXI7XG5cbiAgICAgICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblxuICAgICAgICAgICAgaG9zdC5hcHBlbmRDaGlsZChvdmVybGF5KTtcbiAgICAgICAgICAgIGhvc3QuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgICAgICAgICBob3N0LmFwcGVuZENoaWxkKHNwaW5uZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gaG9zdDtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYm9keUVsZW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQuYm9keTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94RWxlbWVudCA9IHRlbXBsYXRlKHtcbiAgICAgICAgICAgIHByZWZpeDogQ0xBU1NfUFJFRklYLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBzcGlubmVyOiBzcGlubmVyXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGlnaHRCb3hPdmVybGF5RWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctb3ZlcmxheScpO1xuICAgICAgICB2YXIgbGlnaHRCb3hDb250ZW50RWxlbWVudCA9IGxpZ2h0Qm94RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctY29udGVudCcpO1xuICAgICAgICB2YXIgbGlnaHRCb3hJZnJhbWVFbGVtZW50ID0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTX1BSRUZJWCArICctY29udGVudC1pZnJhbWUnKTtcbiAgICAgICAgdmFyIGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQgPSBsaWdodEJveEVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU19QUkVGSVggKyAnLXNwaW5uZXInKTtcblxuICAgICAgICB2YXIgcHNEaW1lbnNpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpdGhEZWZhdWx0UFhVbml0KE1JTl9QU19ESU1FTlNJT05TLndpZHRoKSxcbiAgICAgICAgICAgIGhlaWdodDogd2l0aERlZmF1bHRQWFVuaXQoTUlOX1BTX0RJTUVOU0lPTlMuaGVpZ2h0KVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHdpdGhEZWZhdWx0UFhVbml0KHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgaXNTdHJpbmdXaXRob3V0VW5pdCA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgU3RyaW5nKHBhcnNlRmxvYXQodmFsdWUpKS5sZW5ndGggPT09IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChpc1N0cmluZ1dpdGhvdXRVbml0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgJ3B4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgKyAncHgnIDogdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIGxpZ2h0Qm94RWxlbWVudC5zdHlsZS56SW5kZXggPSBvcHRpb25zLnpJbmRleDtcblxuICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBvcHRpb25zLm92ZXJsYXlPcGFjaXR5O1xuICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMub3ZlcmxheUJhY2tncm91bmQ7XG5cbiAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBvcHRpb25zLmNvbnRlbnRCYWNrZ3JvdW5kO1xuICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLm1hcmdpbiA9IHdpdGhEZWZhdWx0UFhVbml0KG9wdGlvbnMuY29udGVudE1hcmdpbik7XG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUud2lkdGggPSBvcHRpb25zLndpZHRoID8gd2l0aERlZmF1bHRQWFVuaXQob3B0aW9ucy53aWR0aCkgOiAnYXV0byc7XG4gICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyB3aXRoRGVmYXVsdFBYVW5pdChvcHRpb25zLmhlaWdodCkgOiAnYXV0byc7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc3Bpbm5lckNvbG9yKSB7XG4gICAgICAgICAgICBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BhdGgnKS5zdHlsZS5maWxsID0gb3B0aW9ucy5zcGlubmVyQ29sb3I7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5zcGlubmVyID09PSAnY3VzdG9tJykge1xuICAgICAgICAgICAgdmFyIHNwaW5uZXJDdXN0b20gPSBsaWdodEJveFNwaW5uZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyLWN1c3RvbScpO1xuICAgICAgICAgICAgc3Bpbm5lckN1c3RvbS5zdHlsZVsnLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb24nXSA9IG9wdGlvbnMuc3Bpbm5lclJvdGF0aW9uUGVyaW9kICsgJ3M7JztcbiAgICAgICAgICAgIHNwaW5uZXJDdXN0b20uc3R5bGVbJ2FuaW1hdGlvbi1kdXJhdGlvbiddID0gb3B0aW9ucy5zcGlubmVyUm90YXRpb25QZXJpb2QgKyAnczsnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VCeUNsaWNrKSB7XG4gICAgICAgICAgICBsaWdodEJveE92ZXJsYXlFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keUVsZW1lbnQuYXBwZW5kQ2hpbGQobGlnaHRCb3hFbGVtZW50KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5jbG9zZUJ5S2V5Ym9hcmQpIHtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihoYW5kbGVLZXl1cEV2ZW50TmFtZSwgSGFuZGxlQm91bmRTcGVjaWZpY0tleXVwKTtcblxuICAgICAgICAgICAgYm9keUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVHbG9iYWxLZXl1cCwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNob3dDb250ZW50ID0gSGVscGVycy5vbmNlKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBoaWRlU3Bpbm5lcihvcHRpb25zKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19QUkVGSVggKyAnLWNvbnRlbnRfX2hpZGRlbicpO1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2xvYWQnKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdmFyIGxpZ2h0Qm94UmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCA/IG9wdGlvbnMud2lkdGggOiBwc0RpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgPyBvcHRpb25zLmhlaWdodCA6IHBzRGltZW5zaW9ucy5oZWlnaHQ7XG5cbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUuYm9yZGVyUmFkaXVzID0gJzhweCc7XG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gd2l0aERlZmF1bHRQWFVuaXQod2lkdGgpO1xuICAgICAgICAgICAgbGlnaHRCb3hDb250ZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSB3aXRoRGVmYXVsdFBYVW5pdChoZWlnaHQpO1xuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGggPSBsaWdodEJveEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gbGlnaHRCb3hFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICAgICAgdmFyIGNvbnRlbnRXaWR0aCA9IG91dGVyV2lkdGgobGlnaHRCb3hDb250ZW50RWxlbWVudCksXG4gICAgICAgICAgICAgICAgY29udGVudEhlaWdodCA9IG91dGVySGVpZ2h0KGxpZ2h0Qm94Q29udGVudEVsZW1lbnQpO1xuXG4gICAgICAgICAgICB2YXIgaG9yTWFyZ2luID0gY29udGVudFdpZHRoIC0gbGlnaHRCb3hDb250ZW50RWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgICB2ZXJ0TWFyZ2luID0gY29udGVudEhlaWdodCAtIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgd2lkdGhBZnRlclJlc2l6ZSA9IGNvbnRhaW5lcldpZHRoIC0gaG9yTWFyZ2luO1xuXG4gICAgICAgICAgICBpZiAod2lkdGhBZnRlclJlc2l6ZSA+IGNvbnRlbnRXaWR0aCkge1xuICAgICAgICAgICAgICAgIHdpZHRoQWZ0ZXJSZXNpemUgPSBjb250ZW50V2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3aWR0aEFmdGVyUmVzaXplID4gY29udGFpbmVyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICB3aWR0aEFmdGVyUmVzaXplID0gY29udGFpbmVyV2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBoZWlnaHRBZnRlclJlc2l6ZSA9IGNvbnRhaW5lckhlaWdodCAtIHZlcnRNYXJnaW47XG5cbiAgICAgICAgICAgIGlmIChoZWlnaHRBZnRlclJlc2l6ZSA+IGNvbnRlbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRBZnRlclJlc2l6ZSA9IGNvbnRlbnRIZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoZWlnaHRBZnRlclJlc2l6ZSA+IGNvbnRhaW5lckhlaWdodCkge1xuICAgICAgICAgICAgICAgIGhlaWdodEFmdGVyUmVzaXplID0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLndpZHRoID0gd2l0aERlZmF1bHRQWFVuaXQod2lkdGhBZnRlclJlc2l6ZSk7XG4gICAgICAgICAgICBsaWdodEJveENvbnRlbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IHdpdGhEZWZhdWx0UFhVbml0KGhlaWdodEFmdGVyUmVzaXplKTtcblxuICAgICAgICAgICAgdmFyIGxlZnRPZmZzZXQgPSAoKHdpbmRvdy5pbm5lcldpZHRoIC0gd2lkdGhBZnRlclJlc2l6ZSkgLyAyKSAtIChob3JNYXJnaW4gLyAyKTtcbiAgICAgICAgICAgIHZhciB0b3BPZmZzZXQgPSAoKHdpbmRvdy5pbm5lckhlaWdodCAtIGhlaWdodEFmdGVyUmVzaXplKSAvIDIpICAtICh2ZXJ0TWFyZ2luIC8gMik7XG5cbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUubGVmdCA9IHdpdGhEZWZhdWx0UFhVbml0KE1hdGgubWF4KGxlZnRPZmZzZXQsIDApKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94Q29udGVudEVsZW1lbnQuc3R5bGUudG9wID0gd2l0aERlZmF1bHRQWFVuaXQoTWF0aC5tYXgodG9wT2Zmc2V0LCAwKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gb3V0ZXJXaWR0aChlbCkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luTGVmdCkgKyBwYXJzZUludChzdHlsZS5tYXJnaW5SaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvdXRlckhlaWdodChlbCkge1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG4gICAgICAgICAgICBoZWlnaHQgKz0gcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSk7XG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJvZHlTdHlsZXM7XG4gICAgICAgIHZhciBoaWRlU2Nyb2xsYmFyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJvZHlTdHlsZXMgPSBIZWxwZXJzLnppcE9iamVjdChbJ292ZXJmbG93JywgJ3BhZGRpbmdSaWdodCddLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIGdldENvbXB1dGVkU3R5bGUoYm9keUVsZW1lbnQpW2tleV1dO1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICB2YXIgYm9keVBhZCA9IHBhcnNlSW50KChnZXRDb21wdXRlZFN0eWxlKGJvZHlFbGVtZW50KVsncGFkZGluZ1JpZ2h0J10gfHwgMCksIDEwKTtcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBib2R5RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSB3aXRoRGVmYXVsdFBYVW5pdChib2R5UGFkICsgdGhpcy5tZWFzdXJlU2Nyb2xsYmFyKCkpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHZhciByZXNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGVzKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoYm9keVN0eWxlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keUVsZW1lbnQuc3R5bGVba2V5XSA9IGJvZHlTdHlsZXNba2V5XTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzaG93U3Bpbm5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxpZ2h0Qm94U3Bpbm5lckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGhpZGVTcGlubmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlnaHRCb3hTcGlubmVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsb2FkVGltZXI7XG4gICAgICAgIGxpZ2h0Qm94SWZyYW1lRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gaGFuZGxlTG9hZChldmVudCkge1xuICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSAhKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpID8gKG9wdGlvbnMucmVzaXplVGltZW91dCB8fCAzMDAwMCkgOiAxMDAwOyAvLyAzMDAwMCBpZiBwc0RpbWVuc2lvbnMgd2lsbCBub3QgYXJyaXZlIGFuZCBjdXN0b20gdGltZW91dCBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgICAgIGxvYWRUaW1lciA9IGdsb2JhbC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsaWdodEJveFJlc2l6ZSgpO1xuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIGxpZ2h0Qm94SWZyYW1lRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgaGFuZGxlTG9hZCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGlmcmFtZVdpbmRvdyA9IGxpZ2h0Qm94SWZyYW1lRWxlbWVudC5jb250ZW50V2luZG93IHx8IGxpZ2h0Qm94SWZyYW1lRWxlbWVudDtcblxuICAgICAgICAvLyBDcm9zcy13aW5kb3cgY29tbXVuaWNhdGlvblxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBuZXcgUG9zdE1lc3NhZ2UoaWZyYW1lV2luZG93KTtcbiAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5vbignZGltZW5zaW9ucycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGlnaHRCb3hSZXNpemUoKTtcbiAgICAgICAgICAgICAgICBzaG93Q29udGVudCgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCdkaW1lbnNpb25zJywgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZXZlbnQuZGV0YWlsO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmRpbWVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHNEaW1lbnNpb25zID0gSGVscGVycy56aXBPYmplY3QoWyd3aWR0aCcsICdoZWlnaHQnXS5tYXAoZnVuY3Rpb24gKGRpbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtkaW0sIE1hdGgubWF4KE1JTl9QU19ESU1FTlNJT05TW2RpbV0gfHwgMCwgZGF0YS5kaW1lbnNpb25zW2RpbV0gfHwgMCkgKyAncHgnXTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxpZ2h0Qm94UmVzaXplKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNob3dDb250ZW50KCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCd3aWRnZXQtZGV0ZWN0aW9uJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5zZW5kKCd3aWRnZXQtZGV0ZWN0ZWQnLCB7dmVyc2lvbjogdmVyc2lvbiwgbGlnaHRCb3hPcHRpb25zOiBvcHRpb25zfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3dpZGdldC1jbG9zZScsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignY2xvc2UnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUZyYW1lKCk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ3N0YXR1cycsIChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdzdGF0dXMnLCBldmVudC5kZXRhaWwpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlLm9uKCd1c2VyLWNvdW50cnknLCAoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgndXNlci1jb3VudHJ5JywgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMubWVzc2FnZS5vbignZmNwJywgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2ZjcCcsIGV2ZW50LmRldGFpbCk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lc3NhZ2Uub24oJ2Vycm9yJywgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Vycm9yJywgZXZlbnQuZGV0YWlsKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy8gUmVzaXplXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGhhbmRsZVJlc2l6ZUV2ZW50TmFtZSwgbGlnaHRCb3hSZXNpemUpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlR2xvYmFsUmVzaXplKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCBhZnRlciBjbG9zZVxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgZnVuY3Rpb24gaGFuZGxlQ2xvc2UoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoYXQubWVzc2FnZS5vZmYoKTtcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaGFuZGxlS2V5dXBFdmVudE5hbWUsIEhhbmRsZUJvdW5kU3BlY2lmaWNLZXl1cClcbiAgICAgICAgICAgIGJvZHlFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgaGFuZGxlR2xvYmFsS2V5dXApO1xuXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlR2xvYmFsUmVzaXplKVxuXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihoYW5kbGVSZXNpemVFdmVudE5hbWUsIGxpZ2h0Qm94UmVzaXplKTtcbiAgICAgICAgICAgIGxpZ2h0Qm94RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGxpZ2h0Qm94RWxlbWVudCk7XG4gICAgICAgICAgICByZXNldFNjcm9sbGJhcigpO1xuICAgICAgICAgICAgdGhhdC5vZmYoJ2Nsb3NlJywgaGFuZGxlQ2xvc2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzaG93U3Bpbm5lcigpO1xuICAgICAgICBoaWRlU2Nyb2xsYmFyKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlckV2ZW50KCdvcGVuJyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5jbG9zZUZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5tb2RhbCkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ2Nsb3NlJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNsb3NlRnJhbWUoKTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3gucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmV2ZW50T2JqZWN0Lm9uLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmLmFwcGx5KHRoaXMuZXZlbnRPYmplY3QsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIExpZ2h0Qm94LnByb3RvdHlwZS5nZXRQb3N0TWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcbiAgICB9O1xuXG4gICAgTGlnaHRCb3guX05BTUVTUEFDRSA9ICcueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94JztcblxuICAgIHJldHVybiBMaWdodEJveDtcbn0pKCk7XG4iLCJmdW5jdGlvbiBvYmplY3RBc3NpZ24oKSB7XG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24gUG9seWZpbGxcbiAgT2JqZWN0LmFzc2lnbnx8T2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdCxcImFzc2lnblwiLHtlbnVtZXJhYmxlOiExLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTpmdW5jdGlvbihlLHIpe1widXNlIHN0cmljdFwiO2lmKG51bGw9PWUpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdFwiKTtmb3IodmFyIHQ9T2JqZWN0KGUpLG49MTtuPGFyZ3VtZW50cy5sZW5ndGg7bisrKXt2YXIgbz1hcmd1bWVudHNbbl07aWYobnVsbCE9bylmb3IodmFyIGE9T2JqZWN0LmtleXMoT2JqZWN0KG8pKSxjPTAsYj1hLmxlbmd0aDtjPGI7YysrKXt2YXIgaT1hW2NdLGw9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLGkpO3ZvaWQgMCE9PWwmJmwuZW51bWVyYWJsZSYmKHRbaV09b1tpXSl9fXJldHVybiB0fX0pO1xufVxuXG5mdW5jdGlvbiBhcnJheUZvckVhY2goKSB7XG4gIEFycmF5LnByb3RvdHlwZS5mb3JFYWNofHwoQXJyYXkucHJvdG90eXBlLmZvckVhY2g9ZnVuY3Rpb24ocixvKXt2YXIgdCxuO2lmKG51bGw9PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcihcIiB0aGlzIGlzIG51bGwgb3Igbm90IGRlZmluZWRcIik7dmFyIGU9T2JqZWN0KHRoaXMpLGk9ZS5sZW5ndGg+Pj4wO2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHIpdGhyb3cgbmV3IFR5cGVFcnJvcihyK1wiIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO2Zvcihhcmd1bWVudHMubGVuZ3RoPjEmJih0PW8pLG49MDtuPGk7KXt2YXIgZjtuIGluIGUmJihmPWVbbl0sci5jYWxsKHQsZixuLGUpKSxuKyt9fSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5UG9seWZpbGxzKCkge1xuICBvYmplY3RBc3NpZ24oKTtcbiAgYXJyYXlGb3JFYWNoKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhcHBseVBvbHlmaWxsczogYXBwbHlQb2x5ZmlsbHNcbn1cbiIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiB3cmFwRXZlbnRJbk5hbWVzcGFjZShldmVudE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIFBvc3RNZXNzYWdlLl9OQU1FU1BBQ0UgKyAnXycgKyBldmVudE5hbWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUG9zdE1lc3NhZ2Uod2luZG93KSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3QgPSBIZWxwZXJzLmFkZEV2ZW50T2JqZWN0KHRoaXMsIHdyYXBFdmVudEluTmFtZXNwYWNlKTtcbiAgICAgICAgdGhpcy5saW5rZWRXaW5kb3cgPSB3aW5kb3c7XG5cbiAgICAgICAgZ2xvYmFsLndpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmIGdsb2JhbC53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSAhPT0gdGhpcy5saW5rZWRXaW5kb3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge307XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50LmRhdGEgPT09ICdzdHJpbmcnICYmIGdsb2JhbC5KU09OICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZ2xvYmFsLkpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY29tbWFuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRPYmplY3QudHJpZ2dlcihtZXNzYWdlLmNvbW1hbmQsIG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKiBQcml2YXRlIE1lbWJlcnMgKiovXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLmV2ZW50T2JqZWN0ID0gbnVsbDtcbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUubGlua2VkV2luZG93ID0gbnVsbDtcblxuICAgIC8qKiBQdWJsaWMgTWVtYmVycyAqKi9cbiAgICBQb3N0TWVzc2FnZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGNvbW1hbmQsIGRhdGEsIHRhcmdldE9yaWdpbikge1xuICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkYXRhID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0T3JpZ2luID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhcmdldE9yaWdpbiA9ICcqJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5saW5rZWRXaW5kb3cgfHwgdGhpcy5saW5rZWRXaW5kb3cucG9zdE1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBnbG9iYWwud2luZG93LkpTT04gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMubGlua2VkV2luZG93LnBvc3RNZXNzYWdlKGdsb2JhbC5KU09OLnN0cmluZ2lmeSh7ZGF0YTogZGF0YSwgY29tbWFuZDogY29tbWFuZH0pLCB0YXJnZXRPcmlnaW4pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5ldmVudE9iamVjdC5vbihldmVudCwgaGFuZGxlLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgUG9zdE1lc3NhZ2UucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaGFuZGxlLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZXZlbnRPYmplY3Qub2ZmKGV2ZW50LCBoYW5kbGUsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBQb3N0TWVzc2FnZS5fTkFNRVNQQUNFID0gJ1BPU1RfTUVTU0FHRSc7XG5cblxuICAgIHJldHVybiBQb3N0TWVzc2FnZTtcbn0pKCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyB3aWR0aD1cXFwiNDdweFxcXCIgaGVpZ2h0PVxcXCI0N3B4XFxcIiBjbGFzcz1cXFwic3Bpbm5lci1yb3VuZFxcXCI+PHBhdGggZD1cXFwiTTQuNzg1MjcyOCwxMC40MjEwODc1IEMyLjk0MTExNjY0LDEzLjA1NTIxOTcgMS42Mzc3NzEwOSwxNi4wOTQ2MTA2IDEuMDM3NTM5NTYsMTkuMzc2ODU1NiBMNS4xNjYzODk3MSwxOS4zNzY4NTU2IEM1LjY0Mjk2MTUsMTcuMTg3NTU0IDYuNTAxMjUyNDMsMTUuMTM5MTY0IDcuNjY3Njg4OTksMTMuMzA1MzA1IEw1Ljk1NTcyNDI4LDExLjU5MjI3MDUgTDQuNzg1MjcyOCwxMC40MjEwODc1IEw0Ljc4NTI3MjgsMTAuNDIxMDg3NSBaIE0xMC40NjkzMDQ4LDQuNzQ1NjU2MTUgQzEzLjEyNzQ4NzMsMi44OTA4MDYxIDE2LjE5NjU5NzYsMS41ODY3NDY0OCAxOS41MTAwMTYxLDEgTDE5LjUxMDAxNjEsNC45OTUyMzkzNCBDMTcuMjcxMDkyMyw1LjQ4Nzk3NzgyIDE1LjE4MDMxOTMsNi4zODA4NTI5IDEzLjMxNjY5MDcsNy41OTQ4MjE1MyBMMTEuNjMzNzMzOSw1LjkxMDgxMjkzIEwxMC40NjkzMDQ4LDQuNzQ1NjU2MTUgTDEwLjQ2OTMwNDgsNC43NDU2NTYxNSBaIE00Mi4yNDI2MzA5LDM2LjUzODgzODYgQzQ0LjExMTI3ODIsMzMuODU3NTAxNiA0NS40MjA2NDYxLDMwLjc1ODE1MDQgNDYsMjcuNDExNzI2OSBMNDEuOTQ0MTIxMSwyNy40MTE3MjY5IEM0MS40NTI3OTQ1LDI5LjY2MTg5MjYgNDAuNTU4MzY5MiwzMS43NjI5MTEgMzkuMzQwNDQxMiwzMy42MzQ5MzU2IEw0MS4wMzMyMzQ3LDM1LjMyODc4NjkgTDQyLjI0MjUzMDYsMzYuNTM4ODM4NiBMNDIuMjQyNjMwOSwzNi41Mzg4Mzg2IFogTTM2LjU3MDc0NDEsNDIuMjI2NDIyNyBDMzMuOTE2Nzc3Myw0NC4wODY3OTY3IDMwLjg1MDk3OTMsNDUuMzk3Mjg0MiAyNy41Mzk4NjkzLDQ1Ljk5MTE2MTYgTDI3LjUzOTg2OTMsNDEuNzk2MDU0OSBDMjkuNzM3NjQwMiw0MS4zMjAyOTAxIDMxLjc5MzY4NDEsNDAuNDU5MzUzNiAzMy42MzM2MjQ2LDM5LjI4NzU2OCBMMzUuMzU1NDI1OCw0MS4wMTA0NDUzIEwzNi41NzA3NDQxLDQyLjIyNjUyMzEgTDM2LjU3MDc0NDEsNDIuMjI2NDIyNyBaIE00LjcxMTc5OTY1LDM2LjQ3MzE1MzUgQzIuODY3NDQyNzQsMzMuODA2OTgyMyAxLjU3NDYzNjM3LDMwLjczMDkzMjIgMSwyNy40MTE4MjczIEw1LjE2ODg5OTA0LDI3LjQxMTgyNzMgQzUuNjQ4MjgxMjgsMjkuNjA3MzU1OSA2LjUxMTU5MDg3LDMxLjY2MTA2OSA3LjY4NDY1MjA1LDMzLjQ5ODQ0MzIgTDUuOTU1NzI0MjgsMzUuMjI4NDUxNSBMNC43MTE3OTk2NSwzNi40NzMxNTM1IEw0LjcxMTc5OTY1LDM2LjQ3MzE1MzUgWiBNMTAuMzY0MDEzMyw0Mi4xODA0MjMgQzEzLjA0NjI4NTQsNDQuMDc0NTQzNSAxNi4xNTI3MzQ1LDQ1LjQwNTUyIDE5LjUxMDExNjUsNDYgTDE5LjUxMDExNjUsNDEuNzgyMTk0NyBDMTcuMjgxNzMxOSw0MS4yOTE2NjU4IDE1LjIwMDA5MjgsNDAuNDA0ODE2OSAxMy4zNDMwODg5LDM5LjE5OTU4NjIgTDExLjYzMzczMzksNDAuOTEwMDA5NCBMMTAuMzY0MDEzMyw0Mi4xODA1MjM1IEwxMC4zNjQwMTMzLDQyLjE4MDQyMyBaIE00Mi4xNjg4NTY3LDEwLjM1NTcwMzggQzQ0LjAzNzMwMzEsMTMuMDA0ODAwOCA0NS4zNTc0MTEsMTYuMDY3NDkyOSA0NS45NjI2NjEyLDE5LjM3Njg1NTYgTDQxLjk0NjkzMTYsMTkuMzc2ODU1NiBDNDEuNDU4NTE1OCwxNy4xMzI4MTY0IDQwLjU2OTIwOTUsMTUuMDM2OTIwMiAzOS4zNTgwMDY1LDEzLjE2ODQxMDkgTDQxLjAzMzUzNTgsMTEuNDkxODM0NiBMNDIuMTY4OTU3LDEwLjM1NTcwMzggTDQyLjE2ODg1NjcsMTAuMzU1NzAzOCBaIE0zNi40NjUxNTE2LDQuNjk5OTU3ODIgQzMzLjgzNTU3NTQsMi44Nzg2NTMzNiAzMC44MDcxMTYyLDEuNTk0ODgxNzkgMjcuNTQwMDcwMSwxLjAwODgzODM2IEwyNy41NDAwNzAxLDQuOTgxMTc4MzEgQzI5Ljc0ODQ4MDUsNS40NTkxNTI3MiAzMS44MTM3NTg3LDYuMzI2MDE0OSAzMy42NjA0MjQyLDcuNTA2NDM3OTQgTDM1LjM1NTUyNjIsNS44MTAyNzY2IEwzNi40NjUxNTE2LDQuNjk5OTU3ODIgTDM2LjQ2NTE1MTYsNC42OTk5NTc4MiBaXFxcIiBmaWxsPVxcXCIjQ0NDQ0NDXFxcIj48L3BhdGg+PC9zdmc+XCI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHN2ZyBjbGFzcz1cXFwic3Bpbm5lci14c29sbGFcXFwiIHdpZHRoPVxcXCI1NlxcXCIgaGVpZ2h0PVxcXCI1NVxcXCI+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLXhcXFwiIGQ9XFxcIk0yMS4wMyA1LjA0MmwtMi4xMTItMi4xNTYtMy42NTcgMy42OTUtMy42NTctMy42OTUtMi4xMTIgMi4xNTYgMy42NTkgMy42NzMtMy42NTkgMy42OTYgMi4xMTIgMi4xNTcgMy42NTctMy42OTcgMy42NTcgMy42OTcgMi4xMTItMi4xNTctMy42NDgtMy42OTYgMy42NDgtMy42NzN6XFxcIiBmaWxsPVxcXCIjRjI1NDJEXFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLXNcXFwiIGQ9XFxcIk00MS4yMzIgNi44OTZsMi45NDEtMi45NzQtMi4xMzQtMi4xMzItMi45MiAyLjk3My0uMDA1LS4wMDgtMi4xMzQgMi4xMzUuMDA1LjAwOC0uMDA1LjAwNSAzLjc5MiAzLjgyLTIuOTE1IDIuOTQ3IDIuMTEyIDIuMTU2IDUuMDYtNS4xMTEtMy43OTgtMy44MTYuMDAxLS4wMDF6XFxcIiBmaWxsPVxcXCIjRkNDQTIwXFxcIj48L3BhdGg+PHBhdGggY2xhc3M9XFxcInNwaW5uZXIteHNvbGxhLW9cXFwiIGQ9XFxcIk00OC4wNjYgMjkuMTU5Yy0xLjUzNiAwLTIuNzYxIDEuMjYzLTIuNzYxIDIuNzkgMCAxLjUyNCAxLjIyNiAyLjc2NSAyLjc2MSAyLjc2NSAxLjUwOSAwIDIuNzM2LTEuMjQyIDIuNzM2LTIuNzY1IDAtMS41MjYtMS4yMjctMi43OS0yLjczNi0yLjc5bTAgOC41OTNjLTMuMTc5IDAtNS43NzEtMi41OTQtNS43NzEtNS44MDQgMC0zLjIxMyAyLjU5Mi01LjgwOCA1Ljc3MS01LjgwOCAzLjE1NSAwIDUuNzQ1IDIuNTk0IDUuNzQ1IDUuODA4IDAgMy4yMS0yLjU4OSA1LjgwNC01Ljc0NSA1LjgwNFxcXCIgZmlsbD1cXFwiIzhDM0VBNFxcXCI+PC9wYXRoPjxwYXRoIGNsYXNzPVxcXCJzcGlubmVyLXhzb2xsYS1sXFxcIiBkPVxcXCJNMjQuMzg5IDQyLjMyM2gyLjk5djEwLjQzN2gtMi45OXYtMTAuNDM3em00LjMzNCAwaDIuOTg5djEwLjQzN2gtMi45ODl2LTEwLjQzN3pcXFwiIGZpbGw9XFxcIiNCNURDMjBcXFwiPjwvcGF0aD48cGF0aCBjbGFzcz1cXFwic3Bpbm5lci14c29sbGEtYVxcXCIgZD1cXFwiTTcuNzk2IDMxLjg5OGwxLjQwNCAyLjQ1N2gtMi44MzVsMS40MzEtMi40NTdoLS4wMDF6bS0uMDAxLTUuNzU3bC02LjM2MyAxMS4xMDJoMTIuNzAzbC02LjM0MS0xMS4xMDJ6XFxcIiBmaWxsPVxcXCIjNjZDQ0RBXFxcIj48L3BhdGg+PC9zdmc+XCI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3Nhc3NpZnknKSgnLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveHtwb3NpdGlvbjpmaXhlZDt0b3A6MDtsZWZ0OjA7Ym90dG9tOjA7cmlnaHQ6MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlOy13ZWJraXQtYW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW4gMC4xNXM7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW4gMC4xNXN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1vdmVybGF5e3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtib3R0b206MDtyaWdodDowO3otaW5kZXg6MX0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWNvbnRlbnR7cG9zaXRpb246cmVsYXRpdmU7dG9wOjA7bGVmdDowO3otaW5kZXg6M30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWNvbnRlbnRfX2hpZGRlbnt2aXNpYmlsaXR5OmhpZGRlbjt6LWluZGV4Oi0xfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtY29udGVudC1pZnJhbWV7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50fS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lcntwb3NpdGlvbjphYnNvbHV0ZTt0b3A6NTAlO2xlZnQ6NTAlO2Rpc3BsYXk6bm9uZTt6LWluZGV4OjI7cG9pbnRlci1ldmVudHM6bm9uZX0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhe3dpZHRoOjU2cHg7aGVpZ2h0OjU1cHg7bWFyZ2luLXRvcDotMjhweDttYXJnaW4tbGVmdDotMjZweH0ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS14LC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXMsLnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtbywueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1sLC54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWF7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5IDFzIGluZmluaXRlIGVhc2UtaW4tb3V0Oy13ZWJraXQtYW5pbWF0aW9uLWZpbGwtbW9kZTpib3RoO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtYm91bmNlZGVsYXkgMXMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7YW5pbWF0aW9uLWZpbGwtbW9kZTpib3RofS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXh7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6MHM7YW5pbWF0aW9uLWRlbGF5OjBzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLXN7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjJzO2FuaW1hdGlvbi1kZWxheTouMnN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXhzb2xsYSAuc3Bpbm5lci14c29sbGEtb3std2Via2l0LWFuaW1hdGlvbi1kZWxheTouNHM7YW5pbWF0aW9uLWRlbGF5Oi40c30ueHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW5uZXIgLnNwaW5uZXIteHNvbGxhIC5zcGlubmVyLXhzb2xsYS1sey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi42czthbmltYXRpb24tZGVsYXk6LjZzfS54cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3Bpbm5lciAuc3Bpbm5lci14c29sbGEgLnNwaW5uZXIteHNvbGxhLWF7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjhzO2FuaW1hdGlvbi1kZWxheTouOHN9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLXJvdW5ke21hcmdpbi10b3A6LTIzcHg7bWFyZ2luLWxlZnQ6LTIzcHg7LXdlYmtpdC1hbmltYXRpb246eHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW4gM3MgaW5maW5pdGUgbGluZWFyO2FuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiAzcyBpbmZpbml0ZSBsaW5lYXJ9LnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGlubmVyIC5zcGlubmVyLWN1c3RvbXstd2Via2l0LWFuaW1hdGlvbjp4cGF5c3RhdGlvbi13aWRnZXQtbGlnaHRib3gtc3BpbiBpbmZpbml0ZSBsaW5lYXI7YW5pbWF0aW9uOnhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1zcGluIGluZmluaXRlIGxpbmVhcn1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LWJvdW5jZWRlbGF5ezAlLDgwJSwxMDAle29wYWNpdHk6MH00MCV7b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1ib3VuY2VkZWxheXswJSw4MCUsMTAwJXtvcGFjaXR5OjB9NDAle29wYWNpdHk6MX19QC13ZWJraXQta2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW57ZnJvbXtvcGFjaXR5OjB9dG97b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIHhwYXlzdGF0aW9uLXdpZGdldC1saWdodGJveC1mYWRlaW57ZnJvbXtvcGFjaXR5OjB9dG97b3BhY2l0eToxfX1ALXdlYmtpdC1rZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW57ZnJvbXstd2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMGRlZyl9dG97LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fUBrZXlmcmFtZXMgeHBheXN0YXRpb24td2lkZ2V0LWxpZ2h0Ym94LXNwaW57ZnJvbXt0cmFuc2Zvcm06cm90YXRlKDBkZWcpfXRve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19ICAvKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV3b0pJblpsY25OcGIyNGlPaUF6TEFvSkltWnBiR1VpT2lBaWJHbG5hSFJpYjNndWMyTnpjeUlzQ2draWMyOTFjbU5sY3lJNklGc0tDUWtpYkdsbmFIUmliM2d1YzJOemN5SUtDVjBzQ2draWMyOTFjbU5sYzBOdmJuUmxiblFpT2lCYkNna0pJaVJzYVdkb2RHSnZlQzF3Y21WbWFYZzZJQ2Q0Y0dGNWMzUmhkR2x2YmkxM2FXUm5aWFF0YkdsbmFIUmliM2duTzF4dUpHeHBaMmgwWW05NExXTnNZWE56T2lBbkxpY2dLeUFrYkdsbmFIUmliM2d0Y0hKbFptbDRPMXh1WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwZ2UxeHVJQ0J3YjNOcGRHbHZiam9nWm1sNFpXUTdYRzRnSUhSdmNEb2dNRHRjYmlBZ2JHVm1kRG9nTUR0Y2JpQWdZbTkwZEc5dE9pQXdPMXh1SUNCeWFXZG9kRG9nTUR0Y2JpQWdkMmxrZEdnNklERXdNQ1U3WEc0Z0lHaGxhV2RvZERvZ01UQXdKVHRjYmlBZ0xYZGxZbXRwZEMxaGJtbHRZWFJwYjI0NklDTjdKR3hwWjJoMFltOTRMWEJ5WldacGVIMHRabUZrWldsdUlDNHhOWE03WEc0Z0lHRnVhVzFoZEdsdmJqb2dJM3NrYkdsbmFIUmliM2d0Y0hKbFptbDRmUzFtWVdSbGFXNGdMakUxY3p0Y2JuMWNibHh1STNza2JHbG5hSFJpYjNndFkyeGhjM045TFc5MlpYSnNZWGtnZTF4dUlDQndiM05wZEdsdmJqb2dZV0p6YjJ4MWRHVTdYRzRnSUhSdmNEb3dPMXh1SUNCc1pXWjBPaUF3TzF4dUlDQmliM1IwYjIwNklEQTdYRzRnSUhKcFoyaDBPaUF3TzF4dUlDQjZMV2x1WkdWNE9pQXhPMXh1ZlZ4dVhHNGpleVJzYVdkb2RHSnZlQzFqYkdGemMzMHRZMjl1ZEdWdWRDQjdYRzRnSUhCdmMybDBhVzl1T2lCeVpXeGhkR2wyWlR0Y2JpQWdkRzl3T2lBd08xeHVJQ0JzWldaME9pQXdPMXh1SUNCNkxXbHVaR1Y0T2lBek8xeHVmVnh1WEc0amV5UnNhV2RvZEdKdmVDMWpiR0Z6YzMwdFkyOXVkR1Z1ZEY5ZmFHbGtaR1Z1SUh0Y2JpQWdkbWx6YVdKcGJHbDBlVG9nYUdsa1pHVnVPMXh1SUNCNkxXbHVaR1Y0T2lBdE1UdGNibjFjYmx4dUkzc2tiR2xuYUhSaWIzZ3RZMnhoYzNOOUxXTnZiblJsYm5RdGFXWnlZVzFsSUh0Y2JpQWdkMmxrZEdnNklERXdNQ1U3WEc0Z0lHaGxhV2RvZERvZ01UQXdKVHRjYmlBZ1ltOXlaR1Z5T2lBd08xeHVJQ0JpWVdOclozSnZkVzVrT2lCMGNtRnVjM0JoY21WdWREdGNibjFjYmx4dUkzc2tiR2xuYUhSaWIzZ3RZMnhoYzNOOUxYTndhVzV1WlhJZ2UxeHVJQ0J3YjNOcGRHbHZiam9nWVdKemIyeDFkR1U3WEc0Z0lIUnZjRG9nTlRBbE8xeHVJQ0JzWldaME9pQTFNQ1U3WEc0Z0lHUnBjM0JzWVhrNklHNXZibVU3WEc0Z0lIb3RhVzVrWlhnNklESTdYRzRnSUhCdmFXNTBaWEl0WlhabGJuUnpPaUJ1YjI1bE8xeHVYRzRnSUM1emNHbHVibVZ5TFhoemIyeHNZU0I3WEc0Z0lDQWdkMmxrZEdnNklEVTJjSGc3WEc0Z0lDQWdhR1ZwWjJoME9pQTFOWEI0TzF4dUlDQWdJRzFoY21kcGJqb2dlMXh1SUNBZ0lDQWdkRzl3T2lBdE1qaHdlRHRjYmlBZ0lDQWdJR3hsWm5RNklDMHlObkI0TzF4dUlDQWdJSDFjYmx4dUlDQWdJQzV6Y0dsdWJtVnlMWGh6YjJ4c1lTMTRMQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRjeXdnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMVzhzSUM1emNHbHVibVZ5TFhoemIyeHNZUzFzTENBdWMzQnBibTVsY2kxNGMyOXNiR0V0WVNCN1hHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMWliM1Z1WTJWa1pXeGhlU0F4Y3lCcGJtWnBibWwwWlNCbFlYTmxMV2x1TFc5MWREdGNiaUFnSUNBZ0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dUxXWnBiR3d0Ylc5a1pUb2dZbTkwYUR0Y2JpQWdJQ0FnSUdGdWFXMWhkR2x2YmpvZ0kzc2tiR2xuYUhSaWIzZ3RjSEpsWm1sNGZTMWliM1Z1WTJWa1pXeGhlU0F4Y3lCcGJtWnBibWwwWlNCbFlYTmxMV2x1TFc5MWREdGNiaUFnSUNBZ0lHRnVhVzFoZEdsdmJpMW1hV3hzTFcxdlpHVTZJR0p2ZEdnN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMWGdnZTF4dUlDQWdJQ0FnTFhkbFltdHBkQzFoYm1sdFlYUnBiMjR0WkdWc1lYazZJREJ6TzF4dUlDQWdJQ0FnWVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF3Y3p0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F1YzNCcGJtNWxjaTE0YzI5c2JHRXRjeUI3WEc0Z0lDQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiaTFrWld4aGVUb2dMakp6TzF4dUlDQWdJQ0FnWVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF1TW5NN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnTG5Od2FXNXVaWEl0ZUhOdmJHeGhMVzhnZTF4dUlDQWdJQ0FnTFhkbFltdHBkQzFoYm1sdFlYUnBiMjR0WkdWc1lYazZJQzQwY3p0Y2JpQWdJQ0FnSUdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTGpSek8xeHVJQ0FnSUgxY2JseHVJQ0FnSUM1emNHbHVibVZ5TFhoemIyeHNZUzFzSUh0Y2JpQWdJQ0FnSUMxM1pXSnJhWFF0WVc1cGJXRjBhVzl1TFdSbGJHRjVPaUF1Tm5NN1hHNGdJQ0FnSUNCaGJtbHRZWFJwYjI0dFpHVnNZWGs2SUM0MmN6dGNiaUFnSUNCOVhHNWNiaUFnSUNBdWMzQnBibTVsY2kxNGMyOXNiR0V0WVNCN1hHNGdJQ0FnSUNBdGQyVmlhMmwwTFdGdWFXMWhkR2x2Ymkxa1pXeGhlVG9nTGpoek8xeHVJQ0FnSUNBZ1lXNXBiV0YwYVc5dUxXUmxiR0Y1T2lBdU9ITTdYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdMbk53YVc1dVpYSXRjbTkxYm1RZ2UxeHVJQ0FnSUcxaGNtZHBiam9nZTF4dUlDQWdJQ0FnZEc5d09pQXRNak53ZUR0Y2JpQWdJQ0FnSUd4bFpuUTZJQzB5TTNCNE8xeHVJQ0FnSUgxY2JpQWdJQ0F0ZDJWaWEybDBMV0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxemNHbHVJRE56SUdsdVptbHVhWFJsSUd4cGJtVmhjanRjYmlBZ0lDQmhibWx0WVhScGIyNDZJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0YzNCcGJpQXpjeUJwYm1acGJtbDBaU0JzYVc1bFlYSTdYRzRnSUgxY2JseHVJQ0F1YzNCcGJtNWxjaTFqZFhOMGIyMGdlMXh1SUNBZ0lDMTNaV0pyYVhRdFlXNXBiV0YwYVc5dU9pQWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMWE53YVc0Z2FXNW1hVzVwZEdVZ2JHbHVaV0Z5TzF4dUlDQWdJR0Z1YVcxaGRHbHZiam9nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxemNHbHVJR2x1Wm1sdWFYUmxJR3hwYm1WaGNqdGNiaUFnZlZ4dWZWeHVYRzVBTFhkbFltdHBkQzFyWlhsbWNtRnRaWE1nSTNza2JHbG5hSFJpYjNndGNISmxabWw0ZlMxaWIzVnVZMlZrWld4aGVTQjdYRzRnSURBbExDQTRNQ1VzSURFd01DVWdleUJ2Y0dGamFYUjVPaUF3T3lCOVhHNGdJRFF3SlNCN0lHOXdZV05wZEhrNklERWdmVnh1ZlZ4dVhHNUFhMlY1Wm5KaGJXVnpJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0WW05MWJtTmxaR1ZzWVhrZ2UxeHVJQ0F3SlN3Z09EQWxMQ0F4TURBbElIc2diM0JoWTJsMGVUb2dNRHNnZlZ4dUlDQTBNQ1VnZXlCdmNHRmphWFI1T2lBeE95QjlYRzU5WEc1Y2JrQXRkMlZpYTJsMExXdGxlV1p5WVcxbGN5QWpleVJzYVdkb2RHSnZlQzF3Y21WbWFYaDlMV1poWkdWcGJpQjdYRzRnSUdaeWIyMGdleUJ2Y0dGamFYUjVPaUF3T3lCOVhHNGdJSFJ2SUhzZ2IzQmhZMmwwZVRvZ01Uc2dmVnh1ZlZ4dVhHNUFhMlY1Wm5KaGJXVnpJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0Wm1Ga1pXbHVJSHRjYmlBZ1puSnZiU0I3SUc5d1lXTnBkSGs2SURBN0lIMWNiaUFnZEc4Z2V5QnZjR0ZqYVhSNU9pQXhPeUI5WEc1OVhHNWNia0F0ZDJWaWEybDBMV3RsZVdaeVlXMWxjeUFqZXlSc2FXZG9kR0p2ZUMxd2NtVm1hWGg5TFhOd2FXNGdlMXh1SUNCbWNtOXRJSHNnTFhkbFltdHBkQzEwY21GdWMyWnZjbTA2SUhKdmRHRjBaU2d3WkdWbktUc2dmVnh1SUNCMGJ5QjdJQzEzWldKcmFYUXRkSEpoYm5ObWIzSnRPaUJ5YjNSaGRHVW9Nell3WkdWbktUc2dmVnh1ZlZ4dVhHNUFhMlY1Wm5KaGJXVnpJQ043Skd4cFoyaDBZbTk0TFhCeVpXWnBlSDB0YzNCcGJpQjdYRzRnSUdaeWIyMGdleUIwY21GdWMyWnZjbTA2SUhKdmRHRjBaU2d3WkdWbktUc2dmVnh1SUNCMGJ5QjdJSFJ5WVc1elptOXliVG9nY205MFlYUmxLRE0yTUdSbFp5azdJSDFjYm4xY2JpSUtDVjBzQ2draWJXRndjR2x1WjNNaU9pQWlRVUZIUVN4QlFVRkJMRFJDUVVFMFFpeEJRVUUxUWl4RFFVTkZMRkZCUVZFc1EwRkJSU3hMUVVGTkxFTkJRMmhDTEVkQlFVY3NRMEZCUlN4RFFVRkZMRU5CUTFBc1NVRkJTU3hEUVVGRkxFTkJRVVVzUTBGRFVpeE5RVUZOTEVOQlFVVXNRMEZCUlN4RFFVTldMRXRCUVVzc1EwRkJSU3hEUVVGRkxFTkJRMVFzUzBGQlN5eERRVUZGTEVsQlFVc3NRMEZEV2l4TlFVRk5MRU5CUVVVc1NVRkJTeXhEUVVOaUxHbENRVUZwUWl4RFFVRkZMR3REUVVFd1FpeERRVUZSTEV0QlFVa3NRMEZEZWtRc1UwRkJVeXhEUVVGRkxHdERRVUV3UWl4RFFVRlJMRXRCUVVrc1EwRkRiRVFzUVVGRlJDeEJRVUZCTEc5RFFVRnZReXhCUVVGd1F5eERRVU5GTEZGQlFWRXNRMEZCUlN4UlFVRlRMRU5CUTI1Q0xFZEJRVWNzUTBGQlF5eERRVUZGTEVOQlEwNHNTVUZCU1N4RFFVRkZMRU5CUVVVc1EwRkRVaXhOUVVGTkxFTkJRVVVzUTBGQlJTeERRVU5XTEV0QlFVc3NRMEZCUlN4RFFVRkZMRU5CUTFRc1QwRkJUeXhEUVVGRkxFTkJRVVVzUTBGRFdpeEJRVVZFTEVGQlFVRXNiME5CUVc5RExFRkJRWEJETEVOQlEwVXNVVUZCVVN4RFFVRkZMRkZCUVZNc1EwRkRia0lzUjBGQlJ5eERRVUZGTEVOQlFVVXNRMEZEVUN4SlFVRkpMRU5CUVVVc1EwRkJSU3hEUVVOU0xFOUJRVThzUTBGQlJTeERRVUZGTEVOQlExb3NRVUZGUkN4QlFVRkJMRFJEUVVFMFF5eEJRVUUxUXl4RFFVTkZMRlZCUVZVc1EwRkJSU3hOUVVGUExFTkJRMjVDTEU5QlFVOHNRMEZCUlN4RlFVRkhMRU5CUTJJc1FVRkZSQ3hCUVVGQkxESkRRVUV5UXl4QlFVRXpReXhEUVVORkxFdEJRVXNzUTBGQlJTeEpRVUZMTEVOQlExb3NUVUZCVFN4RFFVRkZMRWxCUVVzc1EwRkRZaXhOUVVGTkxFTkJRVVVzUTBGQlJTeERRVU5XTEZWQlFWVXNRMEZCUlN4WFFVRlpMRU5CUTNwQ0xFRkJSVVFzUVVGQlFTeHZRMEZCYjBNc1FVRkJjRU1zUTBGRFJTeFJRVUZSTEVOQlFVVXNVVUZCVXl4RFFVTnVRaXhIUVVGSExFTkJRVVVzUjBGQlNTeERRVU5VTEVsQlFVa3NRMEZCUlN4SFFVRkpMRU5CUTFZc1QwRkJUeXhEUVVGRkxFbEJRVXNzUTBGRFpDeFBRVUZQTEVOQlFVVXNRMEZCUlN4RFFVTllMR05CUVdNc1EwRkJSU3hKUVVGTExFTkJkMFIwUWl4QlFUbEVSQ3hCUVZGRkxHOURRVkpyUXl4RFFWRnNReXhsUVVGbExFRkJRVU1zUTBGRFpDeExRVUZMTEVOQlFVVXNTVUZCU3l4RFFVTmFMRTFCUVUwc1EwRkJSU3hKUVVGTExFTkJRMklzVFVGQlRTeEJRVUZETEVOQlFVTXNRVUZEVGl4SFFVRkhMRU5CUVVVc1MwRkJUU3hEUVVSaUxFMUJRVTBzUVVGQlF5eERRVUZETEVGQlJVNHNTVUZCU1N4RFFVRkZMRXRCUVUwc1EwRnJRMllzUVVFdlEwZ3NRVUZuUWtrc2IwTkJhRUpuUXl4RFFWRnNReXhsUVVGbExFTkJVV0lzYVVKQlFXbENMRU5CYUVKeVFpeEJRV2RDZFVJc2IwTkJhRUpoTEVOQlVXeERMR1ZCUVdVc1EwRlJUU3hwUWtGQmFVSXNRMEZvUW5oRExFRkJaMEl3UXl4dlEwRm9RazRzUTBGUmJFTXNaVUZCWlN4RFFWRjVRaXhwUWtGQmFVSXNRMEZvUWpORUxFRkJaMEkyUkN4dlEwRm9RbnBDTEVOQlVXeERMR1ZCUVdVc1EwRlJORU1zYVVKQlFXbENMRU5CYUVJNVJTeEJRV2RDWjBZc2IwTkJhRUkxUXl4RFFWRnNReXhsUVVGbExFTkJVU3RFTEdsQ1FVRnBRaXhCUVVGRExFTkJRelZHTEdsQ1FVRnBRaXhEUVVGRkxIVkRRVUVyUWl4RFFVRmhMRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVU4wUml3eVFrRkJNa0lzUTBGQlJTeEpRVUZMTEVOQlEyeERMRk5CUVZNc1EwRkJSU3gxUTBGQkswSXNRMEZCWVN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGRE9VVXNiVUpCUVcxQ0xFTkJRVVVzU1VGQlN5eERRVU16UWl4QlFYSkNUQ3hCUVhWQ1NTeHZRMEYyUW1kRExFTkJVV3hETEdWQlFXVXNRMEZsWWl4cFFrRkJhVUlzUVVGQlF5eERRVU5vUWl4MVFrRkJkVUlzUTBGQlJTeEZRVUZITEVOQlF6VkNMR1ZCUVdVc1EwRkJSU3hGUVVGSExFTkJRM0pDTEVGQk1VSk1MRUZCTkVKSkxHOURRVFZDWjBNc1EwRlJiRU1zWlVGQlpTeERRVzlDWWl4cFFrRkJhVUlzUVVGQlF5eERRVU5vUWl4MVFrRkJkVUlzUTBGQlJTeEhRVUZKTEVOQlF6ZENMR1ZCUVdVc1EwRkJSU3hIUVVGSkxFTkJRM1JDTEVGQkwwSk1MRUZCYVVOSkxHOURRV3BEWjBNc1EwRlJiRU1zWlVGQlpTeERRWGxDWWl4cFFrRkJhVUlzUVVGQlF5eERRVU5vUWl4MVFrRkJkVUlzUTBGQlJTeEhRVUZKTEVOQlF6ZENMR1ZCUVdVc1EwRkJSU3hIUVVGSkxFTkJRM1JDTEVGQmNFTk1MRUZCYzBOSkxHOURRWFJEWjBNc1EwRlJiRU1zWlVGQlpTeERRVGhDWWl4cFFrRkJhVUlzUVVGQlF5eERRVU5vUWl4MVFrRkJkVUlzUTBGQlJTeEhRVUZKTEVOQlF6ZENMR1ZCUVdVc1EwRkJSU3hIUVVGSkxFTkJRM1JDTEVGQmVrTk1MRUZCTWtOSkxHOURRVE5EWjBNc1EwRlJiRU1zWlVGQlpTeERRVzFEWWl4cFFrRkJhVUlzUVVGQlF5eERRVU5vUWl4MVFrRkJkVUlzUTBGQlJTeEhRVUZKTEVOQlF6ZENMR1ZCUVdVc1EwRkJSU3hIUVVGSkxFTkJRM1JDTEVGQk9VTk1MRUZCYVVSRkxHOURRV3BFYTBNc1EwRnBSR3hETEdOQlFXTXNRVUZCUXl4RFFVTmlMRTFCUVUwc1FVRkJReXhEUVVGRExFRkJRMDRzUjBGQlJ5eERRVUZGTEV0QlFVMHNRMEZFWWl4TlFVRk5MRUZCUVVNc1EwRkJReXhCUVVWT0xFbEJRVWtzUTBGQlJTeExRVUZOTEVOQlJXUXNhVUpCUVdsQ0xFTkJRVVVzWjBOQlFYZENMRU5CUVUwc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlEyNUZMRk5CUVZNc1EwRkJSU3huUTBGQmQwSXNRMEZCVFN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGRE5VUXNRVUY0UkVnc1FVRXdSRVVzYjBOQk1VUnJReXhEUVRCRWJFTXNaVUZCWlN4QlFVRkRMRU5CUTJRc2FVSkJRV2xDTEVOQlFVVXNaME5CUVhkQ0xFTkJRVTBzVVVGQlVTeERRVUZETEUxQlFVMHNRMEZEYUVVc1UwRkJVeXhEUVVGRkxHZERRVUYzUWl4RFFVRk5MRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRM3BFTEVGQlIwZ3NhMEpCUVd0Q0xFTkJRV3hDTEhWRFFVRnJRaXhEUVVOb1FpeEJRVUZCTEVWQlFVVXNRMEZCUlN4QlFVRkJMRWRCUVVjc1EwRkJSU3hCUVVGQkxFbEJRVWtzUTBGQlJ5eFBRVUZQTEVOQlFVVXNRMEZCUlN4RFFVTXpRaXhCUVVGQkxFZEJRVWNzUTBGQlJ5eFBRVUZQTEVOQlFVVXNRMEZCUnl4RlFVZHdRaXhWUVVGVkxFTkJRVllzZFVOQlFWVXNRMEZEVWl4QlFVRkJMRVZCUVVVc1EwRkJSU3hCUVVGQkxFZEJRVWNzUTBGQlJTeEJRVUZCTEVsQlFVa3NRMEZCUnl4UFFVRlBMRU5CUVVVc1EwRkJSU3hEUVVNelFpeEJRVUZCTEVkQlFVY3NRMEZCUnl4UFFVRlBMRU5CUVVVc1EwRkJSU3hGUVVkdVFpeHJRa0ZCYTBJc1EwRkJiRUlzYTBOQlFXdENMRU5CUTJoQ0xFRkJRVUVzU1VGQlNTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRU5CUTJ4Q0xFRkJRVUVzUlVGQlJTeERRVUZITEU5QlFVOHNRMEZCUlN4RFFVRkZMRVZCUjJ4Q0xGVkJRVlVzUTBGQlZpeHJRMEZCVlN4RFFVTlNMRUZCUVVFc1NVRkJTU3hEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVOQlEyeENMRUZCUVVFc1JVRkJSU3hEUVVGSExFOUJRVThzUTBGQlJTeERRVUZGTEVWQlIyeENMR3RDUVVGclFpeERRVUZzUWl4blEwRkJhMElzUTBGRGFFSXNRVUZCUVN4SlFVRkpMRU5CUVVjc2FVSkJRV2xDTEVOQlFVVXNXVUZCVFN4RFFVTm9ReXhCUVVGQkxFVkJRVVVzUTBGQlJ5eHBRa0ZCYVVJc1EwRkJSU3hqUVVGTkxFVkJSMmhETEZWQlFWVXNRMEZCVml4blEwRkJWU3hEUVVOU0xFRkJRVUVzU1VGQlNTeERRVUZITEZOQlFWTXNRMEZCUlN4WlFVRk5MRU5CUTNoQ0xFRkJRVUVzUlVGQlJTeERRVUZITEZOQlFWTXNRMEZCUlN4alFVRk5JaXdLQ1NKdVlXMWxjeUk2SUZ0ZENuMD0gKi8nKTs7IiwibW9kdWxlLmV4cG9ydHMgPSAnMS4yLjEyJztcbiIsInZhciBIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJylcbnZhciBBcHAgPSByZXF1aXJlKCcuL2FwcCcpO1xudmFyIHBvbHlmaWxscyA9IHJlcXVpcmUoJy4vcG9seWZpbGxzJyk7XG5cbnBvbHlmaWxscy5hcHBseVBvbHlmaWxscygpO1xuXG52YXIgaW5zdGFuY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEFwcCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oSGVscGVycy56aXBPYmplY3QoWydpbml0JywgJ29wZW4nLCAnY2xvc2UnLCAnb24nLCAnb2ZmJywgJ3NlbmRNZXNzYWdlJywgJ29uTWVzc2FnZSddLm1hcChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgICAgICB2YXIgYXBwID0gZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgcmV0dXJuIFttZXRob2ROYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXBwW21ldGhvZE5hbWVdLmFwcGx5KGFwcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfV07XG4gICAgfSkpLCB7XG4gICAgICAgIGV2ZW50VHlwZXM6IEFwcC5ldmVudFR5cGVzLFxuICAgIH0pO1xufSkoKTtcbiJdfQ==
