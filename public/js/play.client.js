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
  $.ajax({
    method: 'POST',
    dataType: 'json',
    data: data,
    url: API_BASE + '/game/' + shortCode + '/players/' + playerID
  });
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
    $('#connecting').hide();
    $('#pick-name').show();
  }

  $('#pick-name form').on('submit', function () {
    var name = $('#player-name').val();
    savePlayer(shortCode, playerID, {
      name: name
    });
    return false;
  });

  $('#ready').on('click', function () {
    savePlayer(shortCode, playerID, {
      ready: true
    });
    return false;
  });
});
