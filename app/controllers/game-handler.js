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
        state: 'lobby',
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

  this.play = function (req, res) {
    Games
    .findCode(req.params.shortCode, function (err, result) {
      if (err) {
        throw err;
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
          throw err;
        }

        if (result === null) {
          res.sendStatus(404).end();
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
          throw err;
        }

        var result = game;
        if (req.body.state) {
          result.state = req.body.state;
        }

        game.save(function (err) {
          if (err) {
            throw err;
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
          throw err;
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
            throw err;
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
          throw err;
        }

        game.players.push({
          name: 'waiting...',
          ready: false
        });

        var result = game.players[game.players.length - 1]._id;

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

  this.getPlayer = function (req, res) {
    Games
      .findCode(req.params.shortCode, function (err, game) {
        if (err) {
          throw err;
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
          throw err;
        }

        if (game === null) {
          res.sendStatus(404).end();
          return;
        }

        var result = game.players.id(req.params.playerID);
        var legitParams = ['name', 'ready', 'choice'];

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
        if (req.body.saboteur) {
          console.warn('SABOTEUR:', req.body.saboteur);
          result.saboteur = (req.body.saboteur === 'true' || req.body.saboteur === true);
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
