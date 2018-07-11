'use strict';

var _mati = require('./mati');

var _matiWebhook = require('./matiWebhook');

module.exports = {
  Mati: _mati.Mati,
  Webhook: {
    middleware: _matiWebhook.middleware,
    validateRequest: _matiWebhook.validateRequest
  }
};