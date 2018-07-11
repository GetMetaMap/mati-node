'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MatiBase = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var matiURL = 'https://api.mati.io';

/**
 * @private
 * @class MatiBase
 * @classdesc The main Mati SDK class. It is marked as private so
 * that it doesn't show up in the docs because it is never used directly.
 * @arg {Object} options
 * @arg {String} [options.accessToken] - An access token for making authenticated
 * requests.
 * @arg {String} [options.clientId] - The client id for your app. Used to create
 * authentication URL.
 * @arg {String} [options.clientSecret] - The client secret for your app.
 * @arg {String} [options.baseURL] - Base url, default matiURL
 */

var MatiBase = exports.MatiBase = function () {
  function MatiBase(options) {
    _classCallCheck(this, MatiBase);

    options = options || {};
    this.accessToken = options.accessToken;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.http = _axios2.default.create({
      baseURL: options.baseURL || matiURL
    });
    this.timeout = new Date().getTime() + 10000;
    this.getAccessTokenFromCode();
    this.authInterceptor();
  }

  /**
   * Set the access token used to authenticate requests to the API.
   * @arg {String} accessToken - An access token
   * @returns {undefined}
   */


  _createClass(MatiBase, [{
    key: 'setAccessToken',
    value: function setAccessToken(token) {
      this.accessToken = token;
    }

    /**
     * Get the access token
     * @returns {String} Access token
     */

  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      return this.accessToken;
    }

    /**
     * Set the client id, which is used to help gain an access token.
     * @arg {String} clientId - Your apps client id
     * @returns {undefined}
     */

  }, {
    key: 'setClientId',
    value: function setClientId(clientId) {
      this.clientId = clientId;
    }

    /**
     * Get the client id
     * @returns {String} Client id
     */

  }, {
    key: 'getClientId',
    value: function getClientId() {
      return this.clientId;
    }

    /**
     * Set the client secret
     * @arg {String} clientSecret - Your app's client secret
     * @returns {undefined}
     */

  }, {
    key: 'setClientSecret',
    value: function setClientSecret(clientSecret) {
      this.clientSecret = clientSecret;
    }

    /**
     * Get the client secret
     * @returns {String} Client secret
     */

  }, {
    key: 'getClientSecret',
    value: function getClientSecret() {
      return this.clientSecret;
    }

    /**
     * Verify if token is valid
     * @returns {Boolean}
     */

  }, {
    key: 'isTokenValid',
    value: function isTokenValid() {
      if (new Date().getTime() > this.timeout) return true;
      return false;
    }

    /**
     * Get an OAuth2 access token from an client credentials.
     * @returns {Object}
    */

  }, {
    key: 'issueToken',
    value: async function issueToken() {
      var clientId = this.getClientId();
      var clientSecret = this.getClientSecret();

      var options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        },
        data: _queryString2.default.stringify({ grant_type: 'client_credentials', scope: 'identity' }),
        url: '/oauth/token'
      };
      var response = await this.http(options);
      return response;
    }

    /**
     * Http client Auth interceptor.
     * @returns {Object}
    */

  }, {
    key: 'authInterceptor',
    value: function authInterceptor() {
      var _this = this;

      this.http.interceptors.request.use(async function (config) {
        var originalRequest = config;

        if (_this.isTokenValid()) {
          _this.timeout = new Date().getTime() + 10000;
          try {
            var token = await _this.issueToken();
            _this.setAccessToken(token.data.access_token);
            originalRequest.headers['Authorization'] = 'Bearer ' + token.data.access_token;
            var response = await originalRequest;
            return response;
          } catch (error) {
            _this.timeout = new Date().getTime();
            throw error;
          }
        }
        return config;
      }, function (err) {
        return Promise.reject(err);
      });
    }

    /**
     Get an OAuth2 access token from an client credentials.
     * @returns {undefined}
    */

  }, {
    key: 'getAccessTokenFromCode',
    value: async function getAccessTokenFromCode() {
      var clientId = this.getClientId();
      var clientSecret = this.getClientSecret();

      if (!clientId) {
        throw new Error('A client id is required.');
      }
      if (!clientSecret) {
        throw new Error('A client secret is required.');
      }

      var options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        },
        data: _queryString2.default.stringify({ grant_type: 'client_credentials', scope: 'identity' }),
        url: '/oauth/token'
      };

      try {
        var response = await this.http(options);
        return this.setAccessToken(response.data.access_token);
      } catch (error) {
        throw error;
      }
    }
  }, {
    key: 'request',
    value: async function request(mt, path, args) {
      var options = {
        method: mt,
        headers: {
          'Authorization': 'Bearer ' + this.getAccessToken(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: _queryString2.default.stringify(args),
        url: path
      };
      try {
        var response = await this.http(options);
        if (response.status === 204) {
          return { 'message': 'success' };
        }
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }, {
    key: 'uploadRequest',
    value: async function uploadRequest(mt, path, data) {
      var options = {
        method: mt,
        headers: {
          'Authorization': 'Bearer ' + this.getAccessToken(),
          'Content-Type': 'multipart/form-data; boundary=' + data._boundary
        },
        data: data,
        url: path
      };

      try {
        var response = await this.http(options);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }]);

  return MatiBase;
}();