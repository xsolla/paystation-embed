# Xsolla Pay Station Widget

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Overview

The Xsolla Pay Station Widget is a JavaScript embed that opens the Xsolla Pay Station payment interface on your website. It adapts its layout to the user's device type (desktop lightbox or mobile child window) and tracks payment lifecycle events.

The widget requires an `access_token` obtained from the [Xsolla Pay Station API](https://developers.xsolla.com/api/pay-station/operation/create-token/) to function.

## Requirements

- An Xsolla Publisher Account with a configured project
- A server-side mechanism to generate a Pay Station `access_token`

## Install

**CDN (recommended — no build step):**

```html
<script src="https://cdn.xsolla.net/payments-bucket-prod/embed/1.5.4/widget.min.js"></script>
```

**npm:**

```bash
npm install xsolla-pay-station-widget
```

## Usage

### Asynchronous loading (recommended)

```javascript
const options = {
    access_token: 'YOUR_ACCESS_TOKEN'
};

const s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = 'https://cdn.xsolla.net/payments-bucket-prod/embed/1.5.4/widget.min.js';
s.addEventListener('load', function () {
    XPayStationWidget.init(options);
}, false);
document.getElementsByTagName('head')[0].appendChild(s);
```

### Open the payment interface

```javascript
XPayStationWidget.open();
```

Or via an HTML attribute:

```html
<button data-xpaystation-widget-open>Buy Credits</button>
```

### Events

```javascript
XPayStationWidget.on(XPayStationWidget.eventTypes.STATUS, function (event, data) {
    console.log(data.paymentInfo);
});
```

Available events: `init`, `open`, `load`, `close`, `status`, `status-invoice`, `status-delivering`, `status-done`, `status-troubled`, `user-country`, `fcp`, `error`.

## Documentation

Full API reference and integration guides: [developers.xsolla.com/api/pay-station/](https://developers.xsolla.com/api/pay-station/)

## Support

- [GitHub Issues](https://github.com/xsolla/paystation-embed/issues)
- [Xsolla Developer Portal](https://developers.xsolla.com/)

## License

MIT. See [LICENSE](./LICENSE).
