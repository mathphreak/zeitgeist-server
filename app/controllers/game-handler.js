'use strict';

var Games = require('../models/games.js');

function GameHandler() {
  this.newGame = function (req, res) {
    Games.genCode(function (err, shortCode) {
      if (err) {
        console.error('Error in GameHandler#newGame:', err);
        res.sendStatus(500);
        return;
      }
      var newGame = {
        shortCode: shortCode,
        state: 'lobby',
        started: new Date(),
        players: []
      };
      Games
        .create(newGame, function (err) {
          if (err) {
            console.error('Other error in GameHandler#newGame:', err);
            res.sendStatus(500);
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

  this.play = function (req, res) {
    Games
    .findCode(req.params.shortCode, function (err, result) {
      if (err) {
        console.error('Error in GameHandler#play', err);
        res.sendStatus(500);
        return;
      }

      if (result === null) {
        res.sendStatus(404).end();
        return;
      }

      res.render('play');
    });
  };

  this.getGame = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, result) {
        if (err) {
          console.error('Error in GameHandler#getGame', err);
          res.status(500).json({
            message: 'error'
          });
          return;
        }

        if (result === null) {
          res.send(404).json({
            message: 'error'
          });
          return;
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

  this.editGame = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          console.error('Error in GameHandler#editGame', err);
          res.status(500).json({
            message: 'error'
          });
          return;
        }

        var result = game;
        if (req.body.state) {
          result.state = req.body.state;
        }

        game.save(function (err) {
          if (err) {
            console.error('Other error in GameHandler#editGame', err);
            res.status(500).json({
              message: 'error'
            });
            return;
          }

          res.json({
            message: 'game-edit-ok',
            self: result
          });
        });
      });
  };

  this.offerChoice = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          console.error('Error in GameHandler#offerChoice', err);
          res.status(500).json({
            message: 'error'
          });
          return;
        }

        game.state = 'playing';

        var infoHere = req.body.infoHere;
        var neighbors = [];
        for (var i = 1; i <= 4; i++) {
          if (req.body['neighbor' + i] && req.body['neighbor' + i].length > 0) {
            neighbors.push(req.body['neighbor' + i]);
          }
        }
        var action = req.body.action;

        var result = game.players.id(req.params.playerID);

        result.ready = false;
        result.infoHere = infoHere;
        result.neighbors = neighbors;
        result.action = action;
        result.choice = '';

        game.save(function (err) {
          if (err) {
            console.error('Other error in GameHandler#offerChoice', err);
            res.status(500).json({
              message: 'error'
            });
            return;
          }

          res.json({
            message: 'choice-ok'
          });
        });
      });
  };

  this.newPlayer = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          console.error('Error in GameHandler#newPlayer', err);
          res.status(500).json({
            message: 'error'
          });
          return;
        }

        game.players.push({
          name: 'waiting...',
          ready: false
        });

        var result = game.players[game.players.length - 1]._id;

        game.save(function (err) {
          if (err) {
            console.error('Error in GameHandler#newPlayer', err);
            res.status(500).json({
              message: 'error'
            });
            return;
          }

          res.json({
            message: 'new-player-id',
            id: result
          });
        });
      });
  };

  this.getPlayer = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          console.error('Error in GameHandler#getPlayer', err);
          res.status(500).json({
            message: 'error'
          });
          return;
        }

        if (game === null) {
          res.sendStatus(404).end();
          return;
        }

        var result = game.players.id(req.params.playerID);

        res.json({
          message: 'player',
          self: result,
          state: game.state
        });
      });
  };

  this.editPlayer = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          console.error('Error in GameHandler#editPlayer', err);
          res.status(500).json({
            message: 'error'
          });
          return;
        }

        if (game === null) {
          res.sendStatus(404).end();
          return;
        }

        var result = game.players.id(req.params.playerID);
        // color isn't really legit, but there's no security issue from
        // people claiming to be the wrong color
        var legitParams = ['name', 'ready', 'choice', 'color'];

        legitParams.forEach(function (p) {
          if (req.body[p]) {
            result[p] = req.body[p];
          }
        });

        // HORRIBLE SECURITY ALERT
        if (req.body.role) {
          result.role = req.body.role;
        }

        // Horrible data interchange format alert
        if (req.body.messmaker) {
          result.messmaker = (req.body.messmaker === 'true' || req.body.messmaker === true);
        }

        game.save(function (err) {
          if (err) {
            console.error('Other error in GameHandler#editPlayer', err);
            res.status(500).json({
              message: 'error'
            });
            return;
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
