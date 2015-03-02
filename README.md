# Xsolla PayStation Widget

## Integration Guide

### Getting the code

#### Linking to Xsolla CDN

Script is located on our CDN and is available here: [https://xsolla.cachefly.net/embed/paystation/1.0.0/widget.min.js](https://xsolla.cachefly.net/embed/paystation/1.0.0/widget.min.js). Use this URL to integrate script on your website.

#### Installing with Bower

If you want to include the source code of widget as a part of your project, you can install the package using [Bower](http://bower.io/).

```
bower install paystation3-embed
```

### Script Loading

Note: *After script loading you should initialize widget with some parameters.*

#### Asynchronous loading with callback (RECOMMENDED)

```
<script>
    var options = {
        access_token: 'abcdef1234567890abcdef1234567890'
    };
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.async = true;
    s.src = "//XSOLLA_CDN/widget.js";
    s.addEventListener('load', function (e) {
        XPayStationWidget.init(options);
    }, false);
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(s);
</script>
```

#### Synchronous loading (blocks content)

```
<script src="//XSOLLA_CDN/widget.js"></script>
<script>
    XPayStationWidget.init({
        access_token: 'abcdef1234567890abcdef1234567890'
    });
</script>
```

#### CommonJS

If your project uses CommonJS module format, you can access the widget by require()

```
var XPayStationWidget = require('PATH_TO_WIDGET/embed');
XPayStationWidget.init({
   access_token: 'abcdef1234567890abcdef1234567890'
});
```

#### RequireJS (AMD)

Also you can use widget with RequireJS loader

```
define(['PATH_TO_WIDGET/embed'], function (XPayStationWidget) {
    XPayStationWidget.init({
       access_token: 'abcdef1234567890abcdef1234567890'
    });
});
```

### Widget Options

* access_token — Access token
* lightbox - Options for modal dialog that contains frame of PayStation
    * width — Width of lightbox frame, default is '850px'
    * height — Height of lightbox frame, default is '100%'
    * zIndex — Property controls the vertical stacking order, default is 1000
    * overlayOpacity — Opacity of the overlay (from 0 to 1), default is '.6'
    * overlayBackground — Background of the overlay, default is '#000000'
    * closeByClick — Toggle if clicking the overlay should close lightbox, default true
    * closeByKeyboard — Toggle if pressing of ESC key should close lightbox, default true
    * contentBackground — Background of the frame, default is '#ffffff'
    * contentMargin — margin around frame, default '10px',
    * spinner — Type of animated loading spinner, can be 'xsolla' or round, default is the first one
    * spinnerColor — Color of the spinner, not set by default

### Widget API

You can refer to the widget object, using the following methods:

* init — parameter setting
* open — opening of payment interface (PayStation). Opens a modal window with an iframe that appears over the site content for desktop, and in the new window for mobile and tablet devices.
* on — Attach an event handler function for one or more events to the widget
* off — Remove an event handler

#### Events

init
open
load
close
status
status-invoice
status-delivering
status-troubled
status-done
