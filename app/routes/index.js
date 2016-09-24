'use strict';

var bodyParser = require('body-parser');

var GameHandler = require('../controllers/game-handler.js');

module.exports = function (app) {
  var gameHandler = new GameHandler();

  app.route('/')
    .get(function (req, res) {
      // Complex debugging switches are difficult.
      // Laziness is easy, and in the spirit of a game jam.
      var now = new Date();
      var endOfGameJam = new Date('2016-09-25T17:00:00-05:00');
      res.render('index', {
        host: req.hostname,
        newTabBox: now.getTime() < endOfGameJam.getTime()
      });
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
