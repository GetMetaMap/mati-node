import {Mati} from './mati'
import {middleware, validateRequest} from './matiWebhook'

module.exports = {
  Mati: Mati,
  Webhook: {
    middleware,
    validateRequest
  }
}
