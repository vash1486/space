const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));

module.exports = {
  verify: function(password, hash, salt) {
    return this.hash(password, salt)
      .then(function(hashed) {
        return hashed === hash;
      });
  },

  hash: function(password, salt) {
    return crypto.pbkdf2Async(password, salt, 25000, 32, 'sha256')
      .then(function(hash) {
        return hash.toString('hex');
      });
  },

  salt: function() {
    return crypto.randomBytesAsync(32)
      .then(function(salt) {
        return salt.toString('hex');
      });
  }
};
