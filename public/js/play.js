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
  if (player.role) {
    $('#role').text(player.role);
  }
  if (player.color) {
    var textColor = window.chroma(player.color).luminance(0.2).css();
    var backgroundColor = window.chroma(player.color).luminance(0.8).css();
    $('#color').text(player.color).css('color', textColor);
    $('body').css('background-color', backgroundColor);
  }
  if (player.messmaker) {
    $('#messmaker').text('are');
  } else {
    $('#messmaker').text('are not');
  }
  if ($('#lobby').is(':visible')) {
    $('#ready span').text(player.ready ? 'Ready' : 'Not Ready');
    $('#ready i').toggleClass('fa-times', !player.ready);
    $('#ready i').toggleClass('fa-check', player.ready);
    $('#ready').toggleClass('btn-default', !player.ready);
    $('#ready').toggleClass('btn-primary', player.ready);
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
  if ($('#playing').is(':visible')) {
    $('#infoHere').text(player.infoHere);
    $('#action').text(player.action);

    var sampleButton = '<button class="btn btn-default" type="button"></button>';
    $('#neighbors').empty();
    player.neighbors.forEach(function (c) {
      var el = $(sampleButton).text(c);
      $('#neighbors').append(el);
    });
    $('#playing .btn').each(function () {
      if ($(this).text() === player.choice) {
        $(this).addClass('btn-primary');
      } else {
        $(this).removeClass('btn-primary');
      }
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
    var ready = $('#ready span').text() === 'Not Ready';
    savePlayer(shortCode, playerID, {
      ready: ready
    }).then(handlePlayerInfo);
    return false;
  });

  $(window.document).on('click', '#playing .btn', function () {
    var choice = $(this).text();
    savePlayer(shortCode, playerID, {
      ready: true,
      choice: choice
    }).then(handlePlayerInfo);
  });

  setInterval(function () {
    getPlayer(shortCode, playerID)
      .then(handlePlayerInfo);
  }, 2000);
});
