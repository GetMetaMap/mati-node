# mati-sdk
<!--
[![Build Status][circleci-image]][circleci-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
-->

Node.js client library for [Mati](https://getmati.io).

## Installation

```bash
  npm install mati-sdk
```

## Documentation

You can find this library documentation in this [page](http://mati.github.io/mati-sdk/).
This library is intended to ease the integration of mati using node. It handles authentication automatically, and provides developers a friendlier interaction. It also provides a [webhook middleware](global.html#webhookMiddleware) for express and a header [webhook validation](global.html#validateRequest) function for webhooks.

For more information about [mati api](https://getmati.io) check our [api documentation page](https://matikyc.docs.apiary.io/).


The **matiClient** constructor takes a client ID, and client Secret paramenter.

```js
var matiClient = require('mati-sdk').Mati;
var mati = new matiClient({
    'clientId': '{your_client_Id}',
    'secretId': '{your_secret_Id}',
});
```

Be aware that all class methods return promises.

```js
mati.listIdentities()
  .then(identities => {
    console.log(identities)
  })
  .catch(err=> {
    // Handle error.
  });
```

## What is Mati?
Mati verifies your users on the fly with the most advanced and secured technology. We’re creating a network of KYC verified people. If your user is already in Mati they won’t need to upload the required documents again, which make the verification process easier and smoother. Mati is using AI for assigning a verification score to a user based on their face match and documents.

## Mati helps you to:
* Mati allows you verify your customers using our **biometric technology**.
* User verification flow automation
* Customize your user verfication flow
* Information sent directly to your backend
* Official document checking. Support for mexican national ID document validation *CURP* and *INE*.
* Facematch between selfie and document ID photo.
* Livness check [not supported in this library yet]

## Create a free Mati Account

1.  Go to [mati dashboard](https://dashboard.mati.io/auth/register) and click "Try it for free".
2.  Create you API credentials on configuration screen.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://getmati.com/whitehat) details the procedure for disclosing security issues.

## WE ARE HIRING!

We are looking for the most talented people, if you're looking for an oportunity in an amazing startup, contact us!

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

<!-- Vaaaaarrrrsss -->
[circleci-image]: http://img.shields.io/circleci/project/github/mati/mati-sdk.svg?branch=master&style=flat-square
[circleci-url]: https://circleci.com/gh/mati/mati-sdk
[npm-image]: https://img.shields.io/npm/v/mati.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mati-sdk
[license-image]: http://img.shields.io/npm/l/mati.svg?style=flat-square
[license-url]: #license
[downloads-image]: http://img.shields.io/npm/dm/mati.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/mati-sdk
