'use strict';

var bodyParser = require('body-parser');

var GameHandler = require('../controllers/game-handler.server.js');

module.exports = function (app) {
  var gameHandler = new GameHandler();

  app.route('/')
    .get(function (req, res) {
      res.send('Hello World!');
    });

  app.route('/play/:shortCode')
    .get(function (req, res) {
      res.render('play');
    });

  app.route('/play/:shortCode/:playerID')
    .get(function (req, res) {
      res.render('play');
    });

  app.route('/game/new')
    .get(gameHandler.newGame);

  app.route('/game/:shortCode')
    .get(gameHandler.getGame);

  app.route('/game/:shortCode/players/new')
    .post(gameHandler.newPlayer);

  app.route('/game/:shortCode/players/:playerID')
    .post(bodyParser.urlencoded({extended: false}),
      gameHandler.editPlayer);
};
