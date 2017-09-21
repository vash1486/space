const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let Race = new Schema({
  name: {
    type: String,
    unique: true
  },
  modifiers: [{
    type: String,
    value: Number
  }]
});

module.exports = mongoose.model('Race', Race);
