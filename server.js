'use strict';
var express = require('express');
var mongoose = require('mongoose');

var routes = require('./app/routes/index.js');

var app = express();

if (app.get('env') === 'development') {
  require('dotenv').load();
}

mongoose.connect(process.env.MONGODB_URI);

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log('Node.js listening on port ' + port + '...');
});
