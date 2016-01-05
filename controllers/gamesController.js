// var request = require("request");
var Day = require("../models/day");
var Game = require("../models/game");
var Methods = require("../db/gameMethods")

function error(response, message){
  response.status(500);
  response.json({error: message})
}

var gamesController = {
  getGames:function(req,res){
    var dateString = req.query.date;
    var url = 'https://www.stattleship.com/basketball/nba/team_game_logs?on='+dateString;
    Day.findOne({'day':dateString},function(err, day){
      if (err) return err;
      if (day){
        console.log("numbers have been crunched already");
        res.json(day)
      }else{
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
                res.json(newDay)
              }
            });
          });
        });
      }
    });
  }
}

module.exports = gamesController;
