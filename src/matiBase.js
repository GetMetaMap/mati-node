
import axios from 'axios'
import queryString from 'query-string'
const matiURL = 'https://api.mati.io'

/**
 * @class MatiBase
 * @classdesc The main Mati SDK class. It is marked as private so
 * that it doesn't show up in the docs because it is never used directly.
 * @arg {Object} options
 * requests.
 * @arg {String} options.clientId - The client id for your app. Used to create
 * authentication URL.
 * @arg {String} options.clientSecret - The client secret for your app.
 * @arg {String} [options.baseURL] - Base url, default 'https://api.mati.io'
 */

export class MatiBase {
  constructor (options) {
    options = options || {}
    this.accessToken = options.accessToken
    this.clientId = options.clientId
    this.clientSecret = options.clientSecret
    this.http = axios.create({
      baseURL: options.baseURL || matiURL
    })
    this.timeout = new Date().getTime() + 10000
    this.getAccessTokenFromCode()
    this.authInterceptor()
  }

  /**
   * @private
   * Set the access token used to authenticate requests to the API.
   * @arg {String} accessToken - An access token
   * @returns {undefined}
   */
  setAccessToken (token) {
    this.accessToken = token
  }

  /**
   * @private
   * Get the access token
   * @returns {String} Access token
   */
  getAccessToken () {
    return this.accessToken
  }

  /**
   * @private
   * Set the client id, which is used to help gain an access token.
   * @arg {String} clientId - Your apps client id
   * @returns {undefined}
   */
  setClientId (clientId) {
    this.clientId = clientId
  }

  /**
   * @private
   * Get the client id
   * @returns {String} Client id
   */
  getClientId () {
    return this.clientId
  }

  /**
   * @private
   * Set the client secret
   * @arg {String} clientSecret - Your app's client secret
   * @returns {undefined}
   */
  setClientSecret (clientSecret) {
    this.clientSecret = clientSecret
  }

  /**
   * @private
   * Get the client secret
   * @returns {String} Client secret
   */
  getClientSecret () {
    return this.clientSecret
  }

  /**
   * @private
   * Verify if token is valid
   * @returns {Boolean}
   */
  isTokenValid () {
    if (new Date().getTime() > this.timeout) return true
    return false
  }

  /**
   * @private
   * Get an OAuth2 access token from an client credentials.
   * @returns {Object}
  */
  async issueToken () {
    const clientId = this.getClientId()
    const clientSecret = this.getClientSecret()

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: clientId,
        password: clientSecret
      },
      data: queryString.stringify({ grant_type: 'client_credentials', scope: 'identity' }),
      url: '/oauth/token'
    }
    const response = await this.http(options)
    return response
  }

  /**
   * @private
   * Http client Auth interceptor.
   * @returns {Object}
  */
  authInterceptor () {
    this.http.interceptors.request.use(async (config) => {
      let originalRequest = config

      if (this.isTokenValid()) {
        this.timeout = new Date().getTime() + 10000
        try {
          const token = await this.issueToken()
          this.setAccessToken(token.data.access_token)
          originalRequest.headers['Authorization'] = 'Bearer ' + token.data.access_token
          const response = await originalRequest
          return response
        } catch (error) {
          this.timeout = new Date().getTime()
          throw error
        }
      }
      return config
    }, (err) => {
      return Promise.reject(err)
    })
  }

  /**
   * @private
   * Get an OAuth2 access token from an client credentials.
   * @returns {undefined}
  */
  async getAccessTokenFromCode () {
    const clientId = this.getClientId()
    const clientSecret = this.getClientSecret()

    if (!clientId) {
      throw new Error('A client id is required.')
    }
    if (!clientSecret) {
      throw new Error('A client secret is required.')
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: clientId,
        password: clientSecret
      },
      data: queryString.stringify({ grant_type: 'client_credentials', scope: 'identity' }),
      url: '/oauth/token'
    }

    try {
      const response = await this.http(options)
      return this.setAccessToken(response.data.access_token)
    } catch (error) {
      throw error
    }
  }

  /**
     * @private
  * Creates API request with given parameters.
  * @arg {String} [mt] - http method [GET, PUT, POST, DELETE, PATCH]
  * requests.
  * @arg {String} [path] - The client id for your app. Used to create
  * authentication URL.
  * @arg {object} [args] - The client secret for your app.
  * @returns {Object}
  */

  async request (mt, path, args) {
    const options = {
      method: mt,
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: queryString.stringify(args),
      url: path
    }
    try {
      const response = await this.http(options)
      if (response.status === 204) {
        return {'message': 'success'}
      }
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
     * @private
  * Creates API upload request with given parameters.
  * @arg {String} [mt] - http method [GET, PUT, POST, DELETE, PATCH]
  * requests.
  * @arg {String} [path] - The client id for your app. Used to create
  * authentication URL.
  * @arg {object} [args] - The client secret for your app.
  * @returns {Object}
  */

  async uploadRequest (mt, path, data) {
    const options = {
      method: mt,
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`
      },
      data,
      url: path
    }

    try {
      const response = await this.http(options)
      return response.data
    } catch (error) {
      throw error
    }
  }
}
