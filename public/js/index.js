/* global window:false */
'use strict';

var $ = window.$;

var API_BASE = 'http://' + window.location.host;

$(function () {
  $('#connection form').on('submit', function () {
    var shortCode = $('#url').val();
    var threeNewTabs = false;
    if ($('#newtabs').length > 0) {
      threeNewTabs = $('#newtabs').get(0).checked;
    }
    if (threeNewTabs) {
      window.open(API_BASE + '/' + shortCode, '_blank');
      window.open(API_BASE + '/' + shortCode, '_blank');
      window.open(API_BASE + '/' + shortCode, '_blank');
    } else {
      window.location.href = API_BASE + '/' + shortCode;
    }
    return false;
  });
});
