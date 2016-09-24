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
        players: []
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
            url: 'http://' + req.hostname + '/' + shortCode
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

        var players = result.players;
        var totalPlayers = players.length;
        var readyPlayers = players.filter(p => p.ready).length;

        res.json({
          message: 'game-heartbeat',
          players: players,
          playerCount: players.length,
          ready: readyPlayers + '/' + totalPlayers,
          allPlayersReady: readyPlayers === totalPlayers
        });
      });
  };

  this.newPlayer = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          throw err;
        }

        game.players.unshift({
          name: 'waiting...',
          ready: false
        });

        var result = game.players[0]._id;

        game.save(function (err) {
          if (err) {
            throw err;
          }

          res.json({
            message: 'new-player-id',
            id: result
          });
        });
      });
  };

  this.editPlayer = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          throw err;
        }

        var result = game.players.id(req.params.playerID);
        if (req.body.name) {
          result.name = req.body.name;
        }
        if (req.body.ready) {
          result.ready = req.body.ready;
        }

        game.save(function (err) {
          if (err) {
            throw err;
          }

          res.json({
            message: 'player-edit-ok',
            self: result
          });
        });
      });
  };
}

module.exports = GameHandler;
