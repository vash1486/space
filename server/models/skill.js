const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let Skill = new Schema({
  name: {
    type: String,
    unique: true
  },
  maxLevel: Number,
  baseLearningTime: Number,
  learningTimeDelta: Number,
  modifiers: [{
    type: String,
    value: Number
  }]
});

module.exports = mongoose.model('Skill', Skill);
