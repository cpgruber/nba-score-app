var Methods = require("./gameMethods");
var Day = require("../models/day");
var Game = require("../models/game");
var Time = require("time");

var now = new Time.Date();
now.setTimezone("America/New_York");
var dateString = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
var url = 'https://www.stattleship.com/basketball/nba/team_game_logs?on='+dateString;

Methods.getData(url).then(function(games){
  Methods.getTopPerformances(Methods.mapData(games)).then(function(gameLogs){
    var dayObject = {
      createdAt: Date(),
      day: dateString
    }
    var newDay = new Day(dayObject);
    for (var i=0;i<gameLogs.length;i++){
      newDay.games.push(new Game({createdAt:Date(),game:gameLogs[i]}))
    }
    newDay.save(function(err){
      if(!err){
        console.log("day saved in db")
        return;
      }
    });
  });
});
