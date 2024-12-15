# Xsolla Pay Station Widget

## Integration Guide

Xsolla team created a script to simplify the integration of Pay Station into your website. Please note: for the proper work of widget please make sure that you pass the ‘access_token’. More information about getting ‘access_token’ parameter is available [here](https://developers.xsolla.com/api/pay-station/operation/create-token/).

[See Demo](http://livedemo.xsolla.com/pay-station/)

Features:
* the most appropriate interface depending on the type of device
* tracking of events happening with Pay Station
* compliant with the AMD and CommonJS specification for defining modules

### Getting the code

#### Linking to Xsolla CDN

Script is located on our CDN and is available here: [https://cdn.xsolla.net/payments-bucket-prod/embed/1.3.4/widget.min.js](https://cdn.xsolla.net/payments-bucket-prod/embed/1.3.4/widget.min.js). Use this URL to integrate script on your website.

### Script Loading

#### Asynchronous loading with callback (recommended)

``` javascript
<script>
    const options = {
        access_token: 'abcdef1234567890abcdef1234567890'
    };
    
    const s = document.createElement('script');
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://cdn.xsolla.net/payments-bucket-prod/embed/1.3.4/widget.min.js";
    
    s.addEventListener('load', function (e) {
        XPayStationWidget.init(options);
    }, false);
    
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(s);
</script>
```

#### Synchronous loading (blocks content)

``` javascript
<script src="https://cdn.xsolla.net/payments-bucket-prod/embed/1.3.4/widget.min.js"></script>
<script>
    XPayStationWidget.init({
        access_token: 'abcdef1234567890abcdef1234567890'
    });
</script>
```

#### CommonJS

If your project uses CommonJS module format, you can access the widget by require()

``` javascript
const XPayStationWidget = require('PATH_TO_WIDGET/embed');
XPayStationWidget.init({
   access_token: 'abcdef1234567890abcdef1234567890'
});
```

#### RequireJS (AMD)

Also you can use widget with RequireJS loader

``` javascript
define(['PATH_TO_WIDGET/embed'], function (XPayStationWidget) {
    XPayStationWidget.init({
       access_token: 'abcdef1234567890abcdef1234567890'
    });
});
```

### Widget Options

* **access_token** — Access token
* **host** - Host for performing requests. The default value is **secure.xsolla.com**
* **sandbox** — Set **true** to test the payment process, sandbox-secure.xsolla.com will be used instead of **host**
* **lightbox** — Options for modal dialog that contains frame of Pay Station
    * **width** — Width of lightbox frame. If null, depends on Pay Station width. Default is null
    * **height** — Height of lightbox frame. If null, depends on Pay Station height. Default is '100%'
    * **zIndex** — Property controls the vertical stacking order, default is 1000
    * **overlayOpacity** — Opacity of the overlay (from 0 to 1), default is '.6'
    * **overlayBackground** — Background of the overlay, default is '#000000'
    * **modal** - Lightbox frame cannot be closed, default false
    * **closeByClick** — Toggle if clicking the overlay should close lightbox, default true
    * **closeByKeyboard** — Toggle if pressing of ESC key should close lightbox, default true
    * **contentBackground** — Background of the frame, default is '#ffffff'
    * **contentMargin** — margin around frame, default '10px',
    * **spinner** — Type of animated loading spinner, can be 'xsolla', 'round', 'none' or 'custom', default is the first one
    * **spinnerColor** — Color of the spinner, not set by default
    * **spinnerUrl** — URL of custom spinner, default is null
    * **spinnerRotationPeriod** — Rotation period of custom spinner, default 0
* **childWindow** — Options for child window that contains Pay Station. Suitable for mobile version
    * **target** — The target option specifies where to open the Pay Station window, can be '_blank', '_self', '_parent', default is '_blank'
* **iframeOnly** — Open Pay Station in iframe on all devices
* **queryParams** — Query params to be added to Pay Station url

### Widget API

#### Methods

You can refer to the widget object, using the following methods:

* **init(options)** — Parameter setting
* **open** — Opening of payment interface (Pay Station). Opens a modal window with an iframe that appears over the site content for desktop, and in the new window for mobile and tablet devices.
* **on(events, handler)** — Attach an event handler function for one or more events to the widget.
    * **events** (string) — One or more space-separated event types, such as "open" or "close status".
    * **handler** (function) — A function to execute when the event is triggered.
* **off(events, [handler])** — Remove an event handler. Calling .off() with no arguments removes all handlers attached to the widget.
    * **events** (string) — One or more space-separated event types.
    * **handler** (function) — A handler function previously attached for the event(s).

#### Events

* **init** — Event on widget initialization
* **open** — Event on opening of the widget
* **load** — Event after payment interface (Pay Station) was loaded
* **close** — Event after payment interface (Pay Station) was closed
* **status** — Event when the user was moved on the status page
* **status-invoice** — Event when the user was moved on the status page, but the payment is not yet completed
* **status-delivering** — Event when the user was moved on the status page, payment was completed, and we’re sending payment notification
* **status-done** — Event when the user was moved on the status page, and the payment was completed successfully
* **status-troubled** — Event when the user was moved on the status page, but the payment failed
* **user-country** — Event when Pay Station have determine user country
* **fcp** — Event when in Pay Station occures fcp
* **error** — Event when in Pay Station 4 occures payment flow errors

You can access list of event using XPayStationWidget.eventTypes object.

##### Example

``` javascript
XPayStationWidget.on(XPayStationWidget.eventTypes.STATUS, function (event, data) {
    console.log(data.paymentInfo); // {
                                   //   email: "main@example.com",
                                   //   invoice: 140381877,
                                   //   status: "invoice",
                                   //   userId: "user_1",
                                   //   virtualCurrencyAmount: 100
                                   // }
});
```
#### Going to the payment

To open Pay Station you can use .open() method or set "data-xpaystation-widget-open" attribute to HTML-element associated with the beginning of the payment, e.g. Payment button.

JavaScript call:
``` javascript
XPayStationWidget.open();
```

HTML example:
``` html
<button data-xpaystation-widget-open>Buy Credits</button>
```

### Troubleshooting

Browsers are sensitive to anything that could affect user security.
You should work carefully with [user trusted events](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted), such as click handling.
If a payment method opens in a new browser tab, you must ensure there is a connection between this functionality and a trusted event.
If the conditions for opening a new tab depend on asynchronous code, the event won’t be trusted, resulting in an error.
Refactoring the callback code that opens a new tab in a synchronous style can resolve this problem.

You may encounter a similar problem when opening a new window after requesting a token for Pay Station. Below, you can see the pseudocode that *DOES NOT* work.

```javascript
    button.addEventListener("click", async () => {
      const token = await getToken();
      window.open(`https://www.pay-station-url-example.com?token=${token}`, "_blank");
    });
```

It looks like everything is logically arranged: first, you get the data to open a new window, and then open it. However, you lose the connection between the trusted user event and opening a new window when you organize the code this way.

It would be more correct to take a different approach:

1. Immediately open a new window in response to a user-trusted click.
2. Save a reference to the new window.
3. Place a loader in the new window while the main content is not loaded.
4. Send a request to get a token for Pay Station.
5. After receiving the token, form a link for Pay Station with this token, and pass it to the opened window.

```javascript
    button.addEventListener("click", async () => {
      const newWindow = window.open("", "_blank");
      newWindow.document.body.innerHTML = "<div>Loading...</div>";
      
      const token = await getToken();
      newWindow.location = `https://www.pay-station-url-example.com?token=${token}`;
    });
```

Additional code that runs on a widget button click may also cause similar problems.
