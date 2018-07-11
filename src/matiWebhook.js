/**
 * @description Utility function to validate an incoming request is indeed from Mati
 * @function validateRequest
 * @param {string} matiHeader - The value of the X-signature header from the request
 * @param {string} secret - The webhook secret that you registered with the webhook
 * @param {object} payloadBody - the body of the webhook response
 */

const validateRequest = (matiHeader, secret, payloadBody) => {
  const payload = JSON.stringify(payloadBody)
  const computedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return matiHeader === computedSignature
}

/**
 * @description Express middleware to accompany a Mati webhook. Provides Mati
 request validation.
 * @function webhookMiddleware
 * @param {string} [secret] - The value of the X-signature header from the request or process.env.MATI_WEBHOOK_SECRET
 * @returns {boolean}
 * @example
 * const webhookMiddleware = mati.webhook.middleware();
 * const webhookMiddleware = mati.webhook.middleware('Y0uRS3CR3T'); //init with secret
*/

const middleware = (secret) => {
  // set secret from input or environment variable
  let sec = process.env.MATI_WEBHOOK_SECRET || secret

  // Create middleware function
  return function (request, response, next) {
    // Check for a valid auth token
    if (!sec) {
      console.error('[Mati]: Error - Mati secret is required for webhook request validation.')
      response.type('text/plain')
        .status(500)
        .send('Mati Error - we attempted to validate this request without first configuring secret.')
    } else {
      // Check that the request originated from Mati
      const matiHeader = request.headers['x-signature']
      const payloadBodybody = request.body
      var valid = validateRequest(matiHeader, sec, payloadBodybody)
      if (valid) {
        next()
      } else {
        console.log('Mati webhook validation Error - verify your secret')
        response.type('text/plain')
          .status(403)
          .send('Mati webhook validation Error - verify your secret')
      }
    };
  }
}

export {
  validateRequest,
  middleware
}
