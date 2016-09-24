'use strict';

var bodyParser = require('body-parser');

var GameHandler = require('../controllers/game-handler.server.js');

module.exports = function (app) {
  var gameHandler = new GameHandler();

  app.route('/')
    .get(function (req, res) {
      res.send('Hello World!');
    });

  app.route(/^\/(\d{1,4})$/)
    .get(function (req, res) {
      var shortCode = req.params[0];
      res.redirect('/play/' + shortCode);
    });

  app.route('/play/:shortCode')
    .get(gameHandler.play);

  app.route('/play/:shortCode/:playerID')
    .get(gameHandler.play);

  app.route('/game/new')
    .get(gameHandler.newGame);

  app.route('/game/:shortCode')
    .get(gameHandler.getGame)
    .post(bodyParser.urlencoded({extended: false}),
      gameHandler.editGame);

  app.route('/game/:shortCode/choice')
    .post(bodyParser.json(), gameHandler.offerChoice);

  app.route('/game/:shortCode/players/new')
    .post(gameHandler.newPlayer);

  app.route('/game/:shortCode/players/:playerID')
    .get(gameHandler.getPlayer)
    .post(bodyParser.urlencoded({extended: false}),
      gameHandler.editPlayer);
};
