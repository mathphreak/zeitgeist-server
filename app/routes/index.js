'use strict';

var GameHandler = require('../controllers/game-handler.server.js');

module.exports = function (app) {
  var gameHandler = new GameHandler();

  app.route('/')
    .get(function (req, res) {
      res.send('Hello World!');
    });

  app.route('/game/new')
    .get(gameHandler.newGame);

  app.route('/game/:shortCode')
    .get(gameHandler.getGame);
};
