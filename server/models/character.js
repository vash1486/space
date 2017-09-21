const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let Character = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    index: true
  },
  name: {
    type: String
  },
  surname: {
    type: String
  },
  nameSurname: {
    type: String,
    unique: true,
    lowercase: true
  },
  race: {
    type: Schema.Types.ObjectId,
    ref: 'Race'
  },
  flag: String,
  creation: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  skills: [{
    skillid: {
      type: Schema.Types.ObjectId,
      ref: 'Skill'
    },
    level: Number,
    learning: {
      type: Number,
      Default: 0
    }
  }]
});

Character.pre('save', function(next) {
  this.nameSurname = this.name+'|'+this.surname;
  this.lastModified = new Date();
  next();
});

Character.statics.getFields = function() {
  return Object.keys(Account.obj).join(' ');
};

Character.statics.findByAccount = function(id, cb) {
  let query = this.findOne({
    account: id
  }, Character.statics.getFields());

  if (cb) {
    query.exec(cb);
  } else {
    return query.exec();
  }
};

module.exports = mongoose.model('Character', Character);
