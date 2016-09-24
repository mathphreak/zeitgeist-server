'use strict';

var Games = require('../models/games.js');

function GameHandler() {
  this.newGame = function (req, res) {
    Games.genCode(function (err, shortCode) {
      if (err) {
        console.error('Error:', err);
        res.status(500).send(err);
        return;
      }
      var newGame = {
        shortCode: shortCode,
        state: 'connect',
        started: new Date(),
        players: [
          {ready: false},
          {ready: false},
          {ready: true}
        ]
      };
      Games
        .create(newGame, function (err) {
          if (err) {
            console.error('Error:', err);
            res.status(500).send(err);
            return;
          }
          res.json({
            message: 'game-url',
            shortCode: String(shortCode),
            url: 'http://' + req.hostname + '/play/' + shortCode
          });
        });
    });
  };

  this.getGame = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, result) {
        if (err) {
          throw err;
        }

        console.log(result);

        var players = result.players;
        var totalPlayers = players.length;
        var readyPlayers = players.filter(p => p.ready).length;

        res.json({
          message: 'game-heartbeat',
          ready: readyPlayers + '/' + totalPlayers
        });
      });
  };
}

module.exports = GameHandler;
