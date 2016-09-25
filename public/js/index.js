/* global window:false */
'use strict';

var $ = window.$;

var API_BASE = 'http://' + window.location.host;

$(function () {
  $('#connection form').on('submit', function () {
    var shortCode = $('#url').val();
    var fourNewTabs = false;
    if ($('#newtabs').length > 0) {
      fourNewTabs = $('#newtabs').get(0).checked;
    }
    if (fourNewTabs) {
      window.open(API_BASE + '/' + shortCode, '_blank');
      window.open(API_BASE + '/' + shortCode, '_blank');
      window.open(API_BASE + '/' + shortCode, '_blank');
      window.open(API_BASE + '/' + shortCode, '_blank');
    } else {
      window.location.href = API_BASE + '/' + shortCode;
    }
    return false;
  });
});
