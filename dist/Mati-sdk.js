(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('axios'), require('form-data')) :
	typeof define === 'function' && define.amd ? define(['axios', 'form-data'], factory) :
	(factory(global.axios,global.FormData));
}(this, (function (axios,FormData) { 'use strict';

	axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;
	FormData = FormData && FormData.hasOwnProperty('default') ? FormData['default'] : FormData;

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

	var strictUriEncode$1 = /*#__PURE__*/Object.freeze({
		default: strictUriEncode,
		__moduleExports: strictUriEncode
	});

	var token = '%[a-f0-9]{2}';
	var singleMatcher = new RegExp(token, 'gi');
	var multiMatcher = new RegExp('(' + token + ')+', 'gi');

	function decodeComponents(components, split) {
		try {
			// Try to decode the entire string first
			return decodeURIComponent(components.join(''));
		} catch (err) {
			// Do nothing
		}

		if (components.length === 1) {
			return components;
		}

		split = split || 1;

		// Split the array in 2 parts
		var left = components.slice(0, split);
		var right = components.slice(split);

		return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
	}

	function decode(input) {
		try {
			return decodeURIComponent(input);
		} catch (err) {
			var tokens = input.match(singleMatcher);

			for (var i = 1; i < tokens.length; i++) {
				input = decodeComponents(tokens, i).join('');

				tokens = input.match(singleMatcher);
			}

			return input;
		}
	}

	function customDecodeURIComponent(input) {
		// Keep track of all the replacements and prefill the map with the `BOM`
		var replaceMap = {
			'%FE%FF': '\uFFFD\uFFFD',
			'%FF%FE': '\uFFFD\uFFFD'
		};

		var match = multiMatcher.exec(input);
		while (match) {
			try {
				// Decode as big chunks as possible
				replaceMap[match[0]] = decodeURIComponent(match[0]);
			} catch (err) {
				var result = decode(match[0]);

				if (result !== match[0]) {
					replaceMap[match[0]] = result;
				}
			}

			match = multiMatcher.exec(input);
		}

		// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
		replaceMap['%C2'] = '\uFFFD';

		var entries = Object.keys(replaceMap);

		for (var i = 0; i < entries.length; i++) {
			// Replace all decoded components
			var key = entries[i];
			input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
		}

		return input;
	}

	var decodeUriComponent = function (encodedURI) {
		if (typeof encodedURI !== 'string') {
			throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
		}

		try {
			encodedURI = encodedURI.replace(/\+/g, ' ');

			// Try the built in decoder first
			return decodeURIComponent(encodedURI);
		} catch (err) {
			// Fallback to a more advanced decoder
			return customDecodeURIComponent(encodedURI);
		}
	};

	var decodeUriComponent$1 = /*#__PURE__*/Object.freeze({
		default: decodeUriComponent,
		__moduleExports: decodeUriComponent
	});

	var strictUriEncode$2 = ( strictUriEncode$1 && strictUriEncode ) || strictUriEncode$1;

	var decodeComponent = ( decodeUriComponent$1 && decodeUriComponent ) || decodeUriComponent$1;

	var queryString = createCommonjsModule(function (module, exports) {



	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return (key, value, index) => {
					return value === null ? [
						encode(key, options),
						'[',
						index,
						']'
					].join('') : [
						encode(key, options),
						'[',
						encode(index, options),
						']=',
						encode(value, options)
					].join('');
				};
			case 'bracket':
				return (key, value) => {
					return value === null ? [encode(key, options), '[]'].join('') : [
						encode(key, options),
						'[]=',
						encode(value, options)
					].join('');
				};
			default:
				return (key, value) => {
					return value === null ? encode(key, options) : [
						encode(key, options),
						'=',
						encode(value, options)
					].join('');
				};
		}
	}

	function parserForArrayFormat(options) {
		let result;

		switch (options.arrayFormat) {
			case 'index':
				return (key, value, accumulator) => {
					result = /\[(\d*)\]$/.exec(key);

					key = key.replace(/\[\d*\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = {};
					}

					accumulator[key][result[1]] = value;
				};
			case 'bracket':
				return (key, value, accumulator) => {
					result = /(\[\])$/.exec(key);
					key = key.replace(/\[\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = [value];
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
			default:
				return (key, value, accumulator) => {
					if (accumulator[key] === undefined) {
						accumulator[key] = value;
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
		}
	}

	function encode(value, options) {
		if (options.encode) {
			return options.strict ? strictUriEncode$2(value) : encodeURIComponent(value);
		}

		return value;
	}

	function decode(value, options) {
		if (options.decode) {
			return decodeComponent(value);
		}

		return value;
	}

	function keysSorter(input) {
		if (Array.isArray(input)) {
			return input.sort();
		}

		if (typeof input === 'object') {
			return keysSorter(Object.keys(input))
				.sort((a, b) => Number(a) - Number(b))
				.map(key => input[key]);
		}

		return input;
	}

	function extract(input) {
		const queryStart = input.indexOf('?');
		if (queryStart === -1) {
			return '';
		}
		return input.slice(queryStart + 1);
	}

	function parse(input, options) {
		options = Object.assign({decode: true, arrayFormat: 'none'}, options);

		const formatter = parserForArrayFormat(options);

		// Create an object with no prototype
		const ret = Object.create(null);

		if (typeof input !== 'string') {
			return ret;
		}

		input = input.trim().replace(/^[?#&]/, '');

		if (!input) {
			return ret;
		}

		for (const param of input.split('&')) {
			let [key, value] = param.replace(/\+/g, ' ').split('=');

			// Missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			value = value === undefined ? null : decode(value, options);

			formatter(decode(key, options), value, ret);
		}

		return Object.keys(ret).sort().reduce((result, key) => {
			const value = ret[key];
			if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
				// Sort object keys, not values
				result[key] = keysSorter(value);
			} else {
				result[key] = value;
			}

			return result;
		}, Object.create(null));
	}

	exports.extract = extract;
	exports.parse = parse;

	exports.stringify = (obj, options) => {
		const defaults = {
			encode: true,
			strict: true,
			arrayFormat: 'none'
		};

		options = Object.assign(defaults, options);

		if (options.sort === false) {
			options.sort = () => {};
		}

		const formatter = encoderForArrayFormat(options);

		return obj ? Object.keys(obj).sort(options.sort).map(key => {
			const value = obj[key];

			if (value === undefined) {
				return '';
			}

			if (value === null) {
				return encode(key, options);
			}

			if (Array.isArray(value)) {
				const result = [];

				for (const value2 of value.slice()) {
					if (value2 === undefined) {
						continue;
					}

					result.push(formatter(key, value2, result.length));
				}

				return result.join('&');
			}

			return encode(key, options) + '=' + encode(value, options);
		}).filter(x => x.length > 0).join('&') : '';
	};

	exports.parseUrl = (input, options) => {
		return {
			url: input.split('?')[0] || '',
			query: parse(extract(input), options)
		};
	};
	});
	var queryString_1 = queryString.extract;
	var queryString_2 = queryString.parse;
	var queryString_3 = queryString.stringify;
	var queryString_4 = queryString.parseUrl;

	var asyncToGenerator = function (fn) {
	  return function () {
	    var gen = fn.apply(this, arguments);
	    return new Promise(function (resolve, reject) {
	      function step(key, arg) {
	        try {
	          var info = gen[key](arg);
	          var value = info.value;
	        } catch (error) {
	          reject(error);
	          return;
	        }

	        if (info.done) {
	          resolve(value);
	        } else {
	          return Promise.resolve(value).then(function (value) {
	            step("next", value);
	          }, function (err) {
	            step("throw", err);
	          });
	        }
	      }

	      return step("next");
	    });
	  };
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

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

	var MatiBase = function () {
	  function MatiBase(options) {
	    classCallCheck(this, MatiBase);

	    options = options || {};
	    this.accessToken = options.accessToken;
	    this.clientId = options.clientId;
	    this.clientSecret = options.clientSecret;
	    this.http = axios.create({
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


	  createClass(MatiBase, [{
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
	    value: function () {
	      var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	        var clientId, clientSecret, options, response;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                clientId = this.getClientId();
	                clientSecret = this.getClientSecret();
	                options = {
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
	                };
	                _context.next = 5;
	                return this.http(options);

	              case 5:
	                response = _context.sent;
	                return _context.abrupt('return', response);

	              case 7:
	              case 'end':
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function issueToken() {
	        return _ref.apply(this, arguments);
	      }

	      return issueToken;
	    }()

	    /**
	     * Http client Auth interceptor.
	     * @returns {Object}
	    */

	  }, {
	    key: 'authInterceptor',
	    value: function authInterceptor() {
	      var _this = this;

	      this.http.interceptors.request.use(function () {
	        var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(config) {
	          var originalRequest, token, response;
	          return regeneratorRuntime.wrap(function _callee2$(_context2) {
	            while (1) {
	              switch (_context2.prev = _context2.next) {
	                case 0:
	                  originalRequest = config;

	                  if (!_this.isTokenValid()) {
	                    _context2.next = 19;
	                    break;
	                  }

	                  _this.timeout = new Date().getTime() + 10000;
	                  _context2.prev = 3;
	                  _context2.next = 6;
	                  return _this.issueToken();

	                case 6:
	                  token = _context2.sent;

	                  _this.setAccessToken(token.data.access_token);
	                  originalRequest.headers['Authorization'] = 'Bearer ' + token.data.access_token;
	                  _context2.next = 11;
	                  return originalRequest;

	                case 11:
	                  response = _context2.sent;
	                  return _context2.abrupt('return', response);

	                case 15:
	                  _context2.prev = 15;
	                  _context2.t0 = _context2['catch'](3);

	                  _this.timeout = new Date().getTime();
	                  throw _context2.t0;

	                case 19:
	                  return _context2.abrupt('return', config);

	                case 20:
	                case 'end':
	                  return _context2.stop();
	              }
	            }
	          }, _callee2, _this, [[3, 15]]);
	        }));

	        return function (_x) {
	          return _ref2.apply(this, arguments);
	        };
	      }(), function (err) {
	        return Promise.reject(err);
	      });
	    }

	    /**
	     Get an OAuth2 access token from an client credentials.
	     * @returns {undefined}
	    */

	  }, {
	    key: 'getAccessTokenFromCode',
	    value: function () {
	      var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
	        var clientId, clientSecret, options, response;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                clientId = this.getClientId();
	                clientSecret = this.getClientSecret();

	                if (clientId) {
	                  _context3.next = 4;
	                  break;
	                }

	                throw new Error('A client id is required.');

	              case 4:
	                if (clientSecret) {
	                  _context3.next = 6;
	                  break;
	                }

	                throw new Error('A client secret is required.');

	              case 6:
	                options = {
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
	                };
	                _context3.prev = 7;
	                _context3.next = 10;
	                return this.http(options);

	              case 10:
	                response = _context3.sent;
	                return _context3.abrupt('return', this.setAccessToken(response.data.access_token));

	              case 14:
	                _context3.prev = 14;
	                _context3.t0 = _context3['catch'](7);
	                throw _context3.t0;

	              case 17:
	              case 'end':
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[7, 14]]);
	      }));

	      function getAccessTokenFromCode() {
	        return _ref3.apply(this, arguments);
	      }

	      return getAccessTokenFromCode;
	    }()
	  }, {
	    key: 'request',
	    value: function () {
	      var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(mt, path, args) {
	        var options, response;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                options = {
	                  method: mt,
	                  headers: {
	                    'Authorization': 'Bearer ' + this.getAccessToken(),
	                    'Content-Type': 'application/x-www-form-urlencoded'
	                  },
	                  data: queryString.stringify(args),
	                  url: path
	                };
	                _context4.prev = 1;
	                _context4.next = 4;
	                return this.http(options);

	              case 4:
	                response = _context4.sent;

	                if (!(response.status === 204)) {
	                  _context4.next = 7;
	                  break;
	                }

	                return _context4.abrupt('return', { 'message': 'success' });

	              case 7:
	                return _context4.abrupt('return', response.data);

	              case 10:
	                _context4.prev = 10;
	                _context4.t0 = _context4['catch'](1);
	                throw _context4.t0;

	              case 13:
	              case 'end':
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this, [[1, 10]]);
	      }));

	      function request(_x2, _x3, _x4) {
	        return _ref4.apply(this, arguments);
	      }

	      return request;
	    }()
	  }, {
	    key: 'uploadRequest',
	    value: function () {
	      var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(mt, path, data) {
	        var options, response;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                options = {
	                  method: mt,
	                  headers: {
	                    'Authorization': 'Bearer ' + this.getAccessToken(),
	                    'Content-Type': 'multipart/form-data; boundary=' + data._boundary
	                  },
	                  data: data,
	                  url: path
	                };
	                _context5.prev = 1;
	                _context5.next = 4;
	                return this.http(options);

	              case 4:
	                response = _context5.sent;
	                return _context5.abrupt('return', response.data);

	              case 8:
	                _context5.prev = 8;
	                _context5.t0 = _context5['catch'](1);
	                throw _context5.t0;

	              case 11:
	              case 'end':
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this, [[1, 8]]);
	      }));

	      function uploadRequest(_x5, _x6, _x7) {
	        return _ref5.apply(this, arguments);
	      }

	      return uploadRequest;
	    }()
	  }]);
	  return MatiBase;
	}();

	/**
	 * @class Mati
	 * @extends MatiBase
	 * @classdesc The Mati SDK class that provides methods to read, write and
	 * create identities.
	 * @arg {Object} options requests.
	 */

	var Mati = function (_MatiBase) {
	  inherits(Mati, _MatiBase);

	  function Mati() {
	    classCallCheck(this, Mati);
	    return possibleConstructorReturn(this, (Mati.__proto__ || Object.getPrototypeOf(Mati)).apply(this, arguments));
	  }

	  createClass(Mati, [{
	    key: 'subscribeWebhook',

	    /**
	     * @description Create a webhook subscription on your mati account.
	     * @function Mati#subscribeWebhook
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.url] - Your webhook url
	     * @arg {string} [opts.secret] - Your webhook secret
	     * @returns {Promise} Resolves to webhook subscription created response
	     */
	    value: function subscribeWebhook(opts) {
	      return this.request('POST', '/v1/webhooks', opts);
	    }
	  }, {
	    key: 'getSubscription',


	    /**
	     * @description Get a single webhook subscription by id.
	     * @function Mati#getSubscription
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.id] - Your webhook id
	     * @returns {Promise} Resolves to webhook single subscription
	     */
	    value: function getSubscription(opts) {
	      return this.request('GET', '/v1/webhooks/' + opts.id);
	    }
	  }, {
	    key: 'listSubscriptions',


	    /**
	     * @description List all your webhook subscriptions on your mati account.
	     * @function Mati#listSubscriptions
	     * @memberof Mati
	     * @returns {Promise} Resolves to webhook subscriptions list response
	     */
	    value: function listSubscriptions() {
	      return this.request('GET', '/v1/webhooks');
	    }
	  }, {
	    key: 'deleteSubscription',


	    /**
	     * @description Delete webhook subscription by id.
	     * @function Mati#deleteSubscription
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.id] - Your webhook id
	     * @returns {Promise} Resolves to webhook delete subscription response
	     */
	    value: function deleteSubscription(opts) {
	      return this.request('DELETE', '/v1/webhooks/' + opts.id);
	    }
	  }, {
	    key: 'createIdentity',


	    /**
	     * @description Create new Identity on your mati account.
	     * @function Mati#createIdentity
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {object} [opts.metadata] - Your metadata information
	     * @arg {object} [opts.file] - Media object
	     * @returns {Promise} Resolves to identity created response
	     */
	    value: function createIdentity(opts) {
	      var data = new FormData();

	      if (opts !== undefined) {
	        if (opts.metadata) {
	          for (var key in opts.metadata) {
	            if (opts.metadata.hasOwnProperty(key)) {
	              data.append('metadata[' + key + ']', opts.metadata[key]);
	            }
	          }
	        }
	        if (opts.file) {
	          data.append('photo', opts.file, 'identity.jpeg');
	        }
	      }

	      return this.uploadRequest('POST', '/v1/identities', data);
	    }
	  }, {
	    key: 'listIdentities',


	    /**
	     * @description List all identities on your Mati account.
	     * @function Mati#listIdentities
	     * @memberof Mati
	     * @returns {Promise} Resolves to your Mati account identity list
	     */
	    value: function listIdentities() {
	      return this.request('GET', '/v1/identities');
	    }
	  }, {
	    key: 'getIdentity',


	    /**
	     * @description Get single identity by id.
	     * @function Mati#getIdentity
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.id] - Your webhook id
	     * @returns {Promise} Resolves to identity response
	     */
	    value: function getIdentity(opts) {
	      return this.request('GET', '/v1/identities/' + opts.id);
	    }
	  }, {
	    key: 'uploadIdFront',


	    /**
	     * @description Upload document front image.
	     * @function Mati#uploadIdFront
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.identityId] - IdentityId
	     * @arg {string} [opts.type] - Document type (default = 'national-id')
	     * @arg {object} [opts.file] - Media object
	     * @returns {Promise} Resolves to document front upload response
	     */
	    value: function uploadIdFront(opts) {
	      if (!opts.file || !opts.identityId) throw Error;
	      var data = new FormData();
	      data.append('type', opts.type || 'national-id');
	      data.append('side', 'front');
	      data.append('picture', opts.file, 'front.jpeg');
	      return this.uploadRequest('POST', '/v1/identities/' + opts.identityId + '/documents', data);
	    }
	  }, {
	    key: 'uploadIdBack',


	    /**
	     * @description Upload document back image.
	     * @function Mati#uploadIdBack
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.documentId] - DocumentId
	     * @arg {object} [opts.file] - Media object
	     * @returns {Promise} Resolves to document back upload response
	     */
	    value: function uploadIdBack(opts) {
	      if (!opts.file || !opts.documentId) throw Error;
	      var data = new FormData();
	      data.append('side', 'back');
	      data.append('picture', opts.file, 'front.jpeg');
	      return this.uploadRequest('PUT', '/v1/documents/' + opts.documentId, data);
	    }
	  }, {
	    key: 'updateFields',


	    /**
	     * @description Update document fields.
	     * @function Mati#updateFields
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.documentId] - DocumentId
	     * @arg {object} [opts.fields] - Fields to modify
	     * @returns {Promise} Resolves to update fields response
	     */
	    value: function updateFields(opts) {
	      return this.request('PATCH', '/v1/documents/' + opts.documentId, opts.fields);
	    }
	  }, {
	    key: 'listDocuments',


	    /**
	     * @description Get all documents by identity id.
	     * @function Mati#listDocuments
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.identityId] - IdentityId
	     * @returns {Promise} Resolves to identity document list
	     */
	    value: function listDocuments(opts) {
	      return this.request('GET', '/v1/identities/' + opts.identityId + '/documents');
	    }
	  }, {
	    key: 'getDocument',


	    /**
	     * @description Get single document by document id.
	     * @function Mati#getDocument
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.documentId] - DocumentId
	     * @returns {Promise} Resolves to document details response
	     */
	    value: function getDocument(opts) {
	      return this.request('GET', '/v1/documents/' + opts.documentId);
	    }
	  }, {
	    key: 'getVerifiedData',


	    /**
	     * @description Get document verified data by document id.
	     * @function Mati#getVerifiedData
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.documentId] - DocumentId
	     * @returns {Promise} Resolves to document verified data response
	     */
	    value: function getVerifiedData(opts) {
	      return this.request('GET', '/v1/documents/' + opts.documentId + '/verified-data');
	    }
	  }, {
	    key: 'listPictures',


	    /**
	     * @description Get list of pictures of the document by document id.
	     * @function Mati#listDocumentPictures
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.documentId] - DocumentId
	     * @returns {Promise} Resolves to pictures list response
	     */
	    value: function listPictures(opts) {
	      return this.request('GET', '/v1/documents/' + opts.documentId + '/pictures');
	    }
	  }, {
	    key: 'getPicture',


	    /**
	     * @description Get single picture by pictureId id.
	     * @function Mati#getDocument
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.pictureId] - PictureId
	     * @returns {Promise} Resolves to picture details response
	     */
	    value: function getPicture(data) {
	      return this.request('GET', '/v1/pictures/' + data.pictureId);
	    }
	  }, {
	    key: 'downloadPicture',


	    /**
	     * @description Download single picture by id.
	     * @function Mati#getDocument
	     * @memberof Mati
	     * @arg {object} [opts] - options
	     * @arg {string} [opts.documentId] - IdentityId
	     * @returns {Promise} Resolves to pictures download response
	     */
	    value: function downloadPicture(data) {
	      return this.request('GET', '/v1/pictures/' + data.documentId + '.jpg');
	    }
	  }]);
	  return Mati;
	}(MatiBase);

	var global$1 = (typeof global !== "undefined" ? global :
	            typeof self !== "undefined" ? self :
	            typeof window !== "undefined" ? window : {});

	// shim for using process in browser
	// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	var cachedSetTimeout = defaultSetTimout;
	var cachedClearTimeout = defaultClearTimeout;
	if (typeof global$1.setTimeout === 'function') {
	    cachedSetTimeout = setTimeout;
	}
	if (typeof global$1.clearTimeout === 'function') {
	    cachedClearTimeout = clearTimeout;
	}

	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	function nextTick(fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	}
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	var title = 'browser';
	var platform = 'browser';
	var browser = true;
	var env = {};
	var argv = [];
	var version = ''; // empty string to avoid regexp issues
	var versions = {};
	var release = {};
	var config = {};

	function noop() {}

	var on = noop;
	var addListener = noop;
	var once = noop;
	var off = noop;
	var removeListener = noop;
	var removeAllListeners = noop;
	var emit = noop;

	function binding(name) {
	    throw new Error('process.binding is not supported');
	}

	function cwd () { return '/' }
	function chdir (dir) {
	    throw new Error('process.chdir is not supported');
	}function umask() { return 0; }

	// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
	var performance = global$1.performance || {};
	var performanceNow =
	  performance.now        ||
	  performance.mozNow     ||
	  performance.msNow      ||
	  performance.oNow       ||
	  performance.webkitNow  ||
	  function(){ return (new Date()).getTime() };

	// generate timestamp or delta
	// see http://nodejs.org/api/process.html#process_process_hrtime
	function hrtime(previousTimestamp){
	  var clocktime = performanceNow.call(performance)*1e-3;
	  var seconds = Math.floor(clocktime);
	  var nanoseconds = Math.floor((clocktime%1)*1e9);
	  if (previousTimestamp) {
	    seconds = seconds - previousTimestamp[0];
	    nanoseconds = nanoseconds - previousTimestamp[1];
	    if (nanoseconds<0) {
	      seconds--;
	      nanoseconds += 1e9;
	    }
	  }
	  return [seconds,nanoseconds]
	}

	var startTime = new Date();
	function uptime() {
	  var currentTime = new Date();
	  var dif = currentTime - startTime;
	  return dif / 1000;
	}

	var process = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser,
	  env: env,
	  argv: argv,
	  version: version,
	  versions: versions,
	  on: on,
	  addListener: addListener,
	  once: once,
	  off: off,
	  removeListener: removeListener,
	  removeAllListeners: removeAllListeners,
	  emit: emit,
	  binding: binding,
	  cwd: cwd,
	  chdir: chdir,
	  umask: umask,
	  hrtime: hrtime,
	  platform: platform,
	  release: release,
	  config: config,
	  uptime: uptime
	};

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
	    }  };
	};

	module.exports = {
	  Mati: Mati,
	  Webhook: {
	    middleware: middleware,
	    validateRequest: validateRequest
	  }
	};

})));
//# sourceMappingURL=Mati-sdk.js.map
