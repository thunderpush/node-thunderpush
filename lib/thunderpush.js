/*
 * node-thunderpush
 * https://github.com/thunderpush/node-thunderpush
 *
 * Copyright (c) 2014 Ryan Schumacher
 * Licensed under the MIT license.
 */

'use strict';

module.exports = (function() {
  
  var http = require('http');
  var _ = require('lodash');

  var Thunderpush = function(options, verbose) {
    this.options = options || {};
    this.verbose = _.isNumber(verbose) ? verbose + 0 : 0;

    if(_.isEmpty(this.options.key)) {
      throw new Error('Key is required');
    }
    if(_.isEmpty(this.options.secret)) {
      throw new Error('Secret is required');
    }

    return this;
  };

  Thunderpush.prototype.root = '/api/1.0.0/';
  Thunderpush.prototype.verbose = 0;

  /**
   * Request helper
   */
  Thunderpush.prototype._request = function(method, endpoint, content, success) {

    // Parse content
    if(_.isString(content)) {
      var parsedContent = '';
      
      try {
        parsedContent = JSON.stringify(JSON.parse(content));
      }
      catch(e) {
        parsedContent = "\"" + content + "\"";
      }

      content = parsedContent;
    }
    else {
      content = '';
    }

    var options = {
      hostname: this.options.hostname || 'localhost',
      port: this.options.port || '80',
      method: method,
      path: this.root + this.options.key + (endpoint || '') + '/',
      headers: {
        'accept': 'application/json',
        'content-length': Buffer.byteLength(content, 'utf8'),
        'x-thunder-secret-key': this.options.secret
      }
    };

    if(this.verbose) {
      console.info('DEBUG: Opening request to ' + options.method.toUpperCase() + ' ' + options.path);
    }
    if(this.verbose > 2) {
      console.info('DEBUG:   ' + "\n", options);
    }

    var request = http.request(options, success);

    request.on('error', function(e) {
      throw new Error('Thunderpush could not connect to server: ' + e.message);
    });

    if(this.verbose) {
      console.info('DEBUG: Writing to request ' + content);
    }
    request.write(content, 'utf8');

    if(this.verbose) {
      console.info('DEBUG: Closing request');
    }
    request.end();

    return request;
  };

  /**
   * Http get helper
   */
  Thunderpush.prototype._httpGet = function(endpoint, success) {
    var req = this._request('GET', endpoint, {}, success);

    return req;
  };

  /**
   * Http get helper
   */
  Thunderpush.prototype._httpPost = function(endpoint, data, success) {
    var req = this._request('POST', endpoint, data, success);

    return req;
  };

  /**
   * Http delete helper
   */
  Thunderpush.prototype._httpDelete = function(endpoint, success) {
    var req = this._request('DELETE', endpoint, {}, success);

    return req;
  };

  /**
   * Define thunderpush connect
   */
  Thunderpush.prototype.ping = function(success) {
    
    return this._httpPost('/ping', function(res) {
      if(res.statusCode !== 200) {
        throw new Error('No pong from server');
      }

      if(success) {
        success(res);
      }
    });

  };

  /** 
   * Channel prototype
   */
  Thunderpush.prototype.channel = function(channel) {

    this.scope = 'channel';
    this.channel = channel;
    return this;

  };

  /** 
   * User prototype
   */
  Thunderpush.prototype.user = function(id) {

    this.scope = 'user';
    this.user = id;
    return this;

  };

  /**
   * Get all users in the channel
   */
  Thunderpush.prototype.get = function(success) {

    if(this.scope === 'channel') {
      return this.getChannel(this.channel, success);
    }
    else if(this.scope === 'user') {
      return this.getUser(this.user, success);
    }

    throw new Error('Scope must be defined by either channel() or user()');

  };

  /**
   * Message handler
   */
  Thunderpush.prototype.message = function(message, success) {

    if(this.scope === 'channel') {
      return this.messageChannel(this.channel, message, success);
    }
    else if(this.scope === 'user') {
      return this.messageUser(this.user, message, success);
    }

    throw new Error('Scope must be defined by either channel() or user()');

  };

  /**
   * Reject handler
   */
  Thunderpush.prototype.disconnect = function(success) {

    if(this.scope === 'channel') {
      return this.disconnectChannel(this.channel, success);
    }
    else if(this.scope === 'user') {
      return this.disconnectUser(this.user, success);
    }

    throw new Error('Scope must be defined by either channel() or user()');

  };

  /****/

  /**
   * Get channel presence
   */
  Thunderpush.prototype.getChannel = function(channel, success) {

    if(_.isEmpty(channel)) {
      return this._httpGet('/channels/', success);
    }
    else {
      return this._httpGet('/channels/' + channel, success);
    }

  };

  /**
   * Send message to all users in a channel
   */
  Thunderpush.prototype.messageChannel = function(channel, message, success) {

    if(_.isEmpty(channel)) {
     return false;
    }
    return this._httpPost('/channels/' + channel, message, success);

  };

  /**
   * Reject all users from a channel
   */
  Thunderpush.prototype.disconnectChannel = function(channel, success) {

    if(_.isEmpty(channel)) {
      return false;
    }
    return this._httpDelete('/channels/' + channel, success);

  };

  /**
   * Get users presence
   */
  Thunderpush.prototype.getUser = function(user, success) {

    if(_.isEmpty(user)) {
      return this._httpGet('/users', success);
    }
    else {
      return this._httpGet('/users/' + user, success);
    }

  };

  /**
   * Send message to a user
   */
  Thunderpush.prototype.messageUser = function(user, message, success) {

    if(_.isEmpty(user)) {
      return false;
    }
    return this._httpPost('/users/' + user, message, success);

  };

  /**
   * Reject a user
   */
  Thunderpush.prototype.disconnectUser = function(user, success) {

    if(_.isEmpty(user)) {
      return false;
    }
    return this._httpDelete('/users/' + user, success);

  };

  return Thunderpush;

})();
