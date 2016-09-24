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
    $('#ready').text(player.ready ? 'Not Ready' : 'Ready');
    if (player.name === 'waiting...') {
      $('#static-player-name').hide();
      $('#player-name').show();
      $('#lobby form button').show();
    } else {
      $('#player-name').hide();
      $('#static-player-name').show().text(player.name);
      $('#lobby form button').hide();
    }
  } else if ($('#choosing').is(':visible')) {
    $('.choice-label').text(player.choiceLabel);

    var sampleButton = $('#choosing .btn').get(0).outerHTML;
    $('#choosing .choices').empty();
    player.choices.forEach(function (c, i) {
      var el = $(sampleButton).text(c).data('index', i);
      if (i === player.chosenIndex) {
        el.addClass('btn-primary');
      } else {
        el.removeClass('btn-primary');
      }
      $('#choosing .choices').append(el);
    });
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
    }).then(handlePlayerInfo);
    return false;
  });

  $(window.document).on('click', '#choosing .btn', function () {
    var index = $(this).data('index');
    savePlayer(shortCode, playerID, {
      ready: true,
      chosenIndex: index
    }).then(handlePlayerInfo);
  });

  setInterval(function () {
    getPlayer(shortCode, playerID)
      .then(handlePlayerInfo);
  }, 2000);
});
