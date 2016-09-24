/* global window:false */
'use strict';

var $ = window.$;

var API_BASE = 'http://' + window.location.host;

function makeNewPlayer(shortCode) {
  return $.ajax({
    method: 'POST',
    dataType: 'json',
    url: API_BASE + '/game/' + shortCode + '/players/new'
  });
}

function savePlayer(shortCode, playerID, data) {
  return $.ajax({
    method: 'POST',
    dataType: 'json',
    data: data,
    url: API_BASE + '/game/' + shortCode + '/players/' + playerID
  });
}

function getPlayer(shortCode, playerID) {
  return $.ajax({
    method: 'GET',
    dataType: 'json',
    url: API_BASE + '/game/' + shortCode + '/players/' + playerID
  });
}

function handlePlayerInfo(data) {
  var player = data.self;
  var state = data.state;
  if (state) {
    $('body > .container > div:not(#' + state + ')').hide();
    $('#' + state).show();
  }
  if ($('#lobby').is(':visible')) {
    if (player.name === 'waiting...') {
      $('#static-player-name').hide();
      $('#player-name').show();
      $('#lobby form button').show();
    } else {
      $('#player-name').hide();
      $('#static-player-name').show().text(player.name);
      $('#lobby form button').hide();
    }
  }
}

$(function () {
  // ['', 'play', shortCode, playerID]
  var pathSegments = window.location.pathname.split('/');
  var shortCode = pathSegments[2];
  var playerID = pathSegments[3];

  if (playerID === undefined) {
    // URL doesn't include player ID so generate a new player
    makeNewPlayer(shortCode)
      .then(function (data) {
        window.location.href += '/' + data.id;
      });
  } else {
    getPlayer(shortCode, playerID)
      .then(handlePlayerInfo);
  }

  $('#lobby form').on('submit', function () {
    var name = $('#player-name').val();
    savePlayer(shortCode, playerID, {
      name: name
    }).then(handlePlayerInfo);
    return false;
  });

  $('#ready').on('click', function () {
    var ready = $('#ready').text() === 'Ready';
    savePlayer(shortCode, playerID, {
      ready: ready
    });
    $('#ready').text(ready ? 'Not Ready' : 'Ready');
    return false;
  });

  setInterval(function () {
    getPlayer(shortCode, playerID)
      .then(handlePlayerInfo);
  }, 2000);
});
