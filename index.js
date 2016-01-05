var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var router = require('./config/routes');

// mongoose.connect(process.env.MONGOLAB_URI||'mongodb://localhost/nba-scoreboard');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

app.use(router);

var port = process.env.PORT || 4000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
