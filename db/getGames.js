var Methods = require("./gameMethods");
var Day = require("../models/day");
var Game = require("../models/game");
var Time = require("time");
var mongoose = require("mongoose");

var now = new Time.Date();
now.setTimezone("America/New_York");
var dateString = Methods.formatDate(now);
var url = 'https://www.stattleship.com/basketball/nba/team_game_logs?on='+dateString;

Methods.getData(url).then(function(games){
  Methods.getTopPerformances(Methods.mapData(games)).then(function(gameLogs){
    var dayObject = {
      createdAt: Date(),
      day: dateString
    }
    var newDay = new Day(dayObject);
    for (var i=0;i<gameLogs.length;i++){
      var newDate = new Time.Date();
      newDate.setTimezone("America/New_York");
      newDay.games.push(new Game({createdAt:newDate,game:gameLogs[i]}))
      console.log("new game object created")
    }
    newDay.save(function(err){
      console.log("saving")
      if(!err){
        console.log("day saved in db")
      }else{
        console.log(err);
      }
      mongoose.disconnect();
    });
  });
});
