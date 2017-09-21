const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cryptoHelper = require('./../helpers/crypto');
const errors = require('./../errors/api');
const jwt = require('jsonwebtoken');

let Account = new Schema({
  username: {
    type: String
  },
  usernameLower: {
    type: String,
    unique: true,
    lowercase: true
  },
  birthday: {
    type: Date
  },
  hash: {
    type: String,
    select: false
  },
  salt: {
    type: String,
    select: false
  },
  loginAttempts: {
    number: {
      type: Number,
      default: 0
    },
    last: {
      type: Date,
      default: Date.now
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  role: {
    type: Number,
    default: 0
  }
});

Account.pre('save', function(next) {
  this.usernameLower = this.username.toLowerCase();
  next();
});

Account.statics.getFields = function() {
  // usando obj al posto di paths escludiamo _v e altri campi generati automaticamente, ma non _id... perché?
  return Object.keys(Account.obj).join(' ');
};

Account.statics.serialize = function() {
  return function(account, cb) {
    cb(null, account.id);
  };
};

Account.statics.deserialize = function() {
  let self = this;
  return function(id, cb) {
    return self.findById(id)
      .then(function(account) {
        if (!account) throw new NotFoundError('account not found');
        cb(null, account);
      }).catch(cb);
  };
};

Account.statics.authenticate = function(username, password) {
  return this.findByUsername(username)
    .then(function(account) {
      if (!account) throw new errors.UnauthorizedError('account not found');
      // TODO controllo sull'eccesso di tentativi di login!
      return cryptoHelper.verify(password, account.hash, account.salt)
        .then(function(result) {
          if (result !== true) throw new errors.UnauthorizedError('wrong password');

          account.loginAttempts.number = 0;
          account.loginAttempts.last = new Date();
          account.lastLogin = new Date();
          return account.save()
            .then(function(account) {
              account.hash = undefined;
              account.salt = undefined;
              return account;
            });
        })
        .catch(function(err) {
          if (typeof account !== 'undefined') {
            ++account.loginAttempts.number;
            account.loginAttempts.last = new Date();
            account.save();
          }
          throw err;
        });
    });
};

Account.statics.register = function(params) {
  const self = this;
  return this.findByUsername(params.username)
    .then(function(account) {
      if (account) throw new errors.ConflictError('username taken');

      return cryptoHelper.salt()
        .then(function(salt) {
          return cryptoHelper.hash(params.password, salt)
            .then(function(hash) {
              params.salt = salt;
              params.hash = hash;
              params.password = undefined;
              params.confirm = undefined;

              return self.model('Account').create(params);
            });
        });
    })
    .catch(function(err) {
      if (err.name !== 'NotFoundError') throw err;

      console.log(err);
    });
};

Account.statics.findById = function(id, cb) {
  let query = this.findOne({
    _id: id
  }, Account.statics.getFields());

  if (cb) {
    query.exec(cb);
  } else {
    return query.exec();
  }
};

Account.statics.findByUsername = function(username, cb) {
  let query = this.findOne({
    usernameLower: username.toLowerCase()
  }, Account.statics.getFields());

  if (cb) {
    query.exec(cb);
  } else {
    return query.exec();
  }
};

Account.methods.getToken = function(version) {
  return jwt.sign({
    user: this,
    version: version
  }, 'chiave-segretissima', {
    expiresIn: 60 * 60
  });
};

Account.methods.changePassword = function(oldpassword, newpassword) {
  const self = this;
  return cryptoHelper.verify(oldpassword, self.hash, self.salt)
    .then(function(result) {
      if (result !== true) throw new errors.UnauthorizedError('wrong password');

      return cryptoHelper.salt()
        .then(function(salt) {
          return cryptoHelper.hash(newpassword, salt)
            .then(function(hash) {
              self.salt = salt;
              self.hash = hash;
              return self.save();
            });
        });
    });
};

module.exports = mongoose.model('Account', Account);
