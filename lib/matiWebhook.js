'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 Utility function to validate an incoming request is indeed from Mati
 @param {string} matiHeader - The value of the X-signature header from the request
 @param {string} secret - The webhook secret that you registered with the webhook
 @param {object} payloadBody - the body of the webhook response
 */

var validateRequest = function validateRequest(matiHeader, secret, payloadBody) {
  var payload = JSON.stringify(payloadBody);
  var computedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return matiHeader === computedSignature;
};

/**
  Express middleware to accompany a Mati webhook. Provides Mati
  request validation.

  Options:
  - validate: {Boolean} whether or not the middleware should validate the request
      came from Mati. Default true. If the request does not originate from
      Mati, we will return a text body and a 403.  If there is no configured
      secret, this is an error condition, so we will returnna 500.
  Returns a middleware function.
  Examples:
  var webhookMiddleware = mati.webhook.middleware();
  var webhookMiddleware = mati.webhook.middleware('Y0uRS3CR3T'); //init with secret
   */

var middleware = function middleware(secret) {
  // set secret from input or environment variable
  var sec = process.env.MATI_WEBHOOK_SECRET || secret;

  // Create middleware function
  return function (request, response, next) {
    // Check for a valid auth token
    if (!sec) {
      console.error('[Mati]: Error - Mati secret is required for webhook request validation.');
      response.type('text/plain').status(500).send('Mati Error - we attempted to validate this request without first configuring secret.');
    } else {
      // Check that the request originated from Mati
      var matiHeader = request.headers['x-signature'];
      var payloadBodybody = request.body;
      var valid = validateRequest(matiHeader, sec, payloadBodybody);
      if (valid) {
        next();
      } else {
        console.log('Mati webhook validation Error - verify your secret');
        response.type('text/plain').status(403).send('Mati webhook validation Error - verify your secret');
      }
    };
  };
};

exports.validateRequest = validateRequest;
exports.middleware = middleware;