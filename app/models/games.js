'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Player = new Schema({
  name: String,
  ready: Boolean,
  infoHere: String,
  neighbors: [String],
  action: String,
  choice: String,
  saboteur: Boolean,
  role: String
});

var Game = new Schema({
  shortCode: String,
  state: String,
  started: {
    type: Date,
    expires: '2h'
  },
  players: [Player]
});

Game.statics.findCode = function (shortCode, cb) {
  return this.findOne({shortCode: shortCode}, cb);
};

Game.statics.genCode = function (cb) {
  var _this = this;
  var shortCode = Math.round(Math.random() * 10000);
  function tryCode() {
    _this.findCode(shortCode, function (err, result) {
      if (err) {
        return cb(err);
      }
      if (result === null) {
        return cb(undefined, shortCode);
      }
      shortCode = Math.round(Math.random() * 10000);
      tryCode();
    });
  }
  tryCode();
};

module.exports = mongoose.model('Game', Game);
