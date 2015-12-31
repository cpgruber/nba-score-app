var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var router = require('./config/routes');

mongoose.connect('mongodb://localhost/nba-scoreboard');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

app.use(router);

// app server located on port 4000
app.listen(4000, function(){
  console.log("app listening on port 4000")
})
