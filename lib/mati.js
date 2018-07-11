'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mati = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matiBase = require('./matiBase');

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class Mati
 * @extends MatiBase
 * @classdesc The Mati SDK class that provides methods to read, write and
 * create identities.
 * @arg {Object} options requests.
 */

var Mati = exports.Mati = function (_MatiBase) {
  _inherits(Mati, _MatiBase);

  function Mati() {
    _classCallCheck(this, Mati);

    return _possibleConstructorReturn(this, (Mati.__proto__ || Object.getPrototypeOf(Mati)).apply(this, arguments));
  }

  _createClass(Mati, [{
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
      var data = new _formData2.default();

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
      var data = new _formData2.default();
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
      var data = new _formData2.default();
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
}(_matiBase.MatiBase);