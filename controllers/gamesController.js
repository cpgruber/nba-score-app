var request = require("request");
var Day = require("../models/day");
var Game = require("../models/game");
var envjs = require("../env.js");

function error(response, message){
  response.status(500);
  response.json({error: message})
}

var stattleship_params = {
  method:'GET',
  json:true,
  headers:{
    'Content-Type':'application/json',
    'Authorization':'Token token='+(env.process.stattleship||envjs.key),
    'Accept':'application/vnd.stattleship.com; version=1.2'
  }
}

var getData = function (url) {
  return new Promise(function(resolve, reject){
    stattleship_params.url = url;
    request(stattleship_params
      ,function(err,response,body){
        if (err){
         resolve({exists: false})
         console.log("Invalid query.")
       }else{
         resolve(body)
       }
    })
  })
}

var getTopPerformances = function(games){
  return new Promise(function(resolve, reject){
    getPlayerLogs(games).then(function(logs){
      resolve(mapPlayerLogs(logs,games))
    })
  })
}

var getTopPlayer = function(team_id,log){
  var teamPlayers = log.game_logs.filter(function(a){return a.team_id == team_id});
  var topPlayer = teamPlayers.sort(function(a,b){
    return ((b.points + b.rebounds_total + b.assists + b.steals + b.blocks - b.turnovers)-(a.points + a.rebounds_total + a.assists + a.steals + a.blocks - a.turnovers))
  })[0];
  if (topPlayer){
    topPlayer.name = log.players.filter(function(a){return a.id == topPlayer.player_id})[0].name;
  }
  return topPlayer;
}

var mapPlayerLogs = function(logs,games){
  for(var i=0;i<games.length;i++){
    var slug = games[i].slug;
    var log = logs.filter(function(a){return a.games[0].slug == slug})[0];
    var home_id = log.games[0].home_team_id;
    var away_id = log.games[0].away_team_id;
    var topHome = getTopPlayer(home_id,log);
    var topAway = getTopPlayer(away_id,log);
    var home = games[i].teams.filter(function(a){return a.id == home_id})[0]
    var away = games[i].teams.filter(function(a){return a.id == away_id})[0]
    home.topPlayer = topHome;
    away.topPlayer = topAway;
  }
  return games;
}

var getPlayerLogs = function (games){
  return new Promise(function(resolve, reject){
    var callsDone = 0;
    var logs = [];
    for (var i = 0; i < games.length; i++) {
      var url = "https://www.stattleship.com/basketball/nba/game_logs?game_id="+games[i].slug;
      stattleship_params.url = url;
      request(stattleship_params,
        function(err,response,body){
          if(err){
            resolve({exists:false})
            console.log("Invalid query.")
          }else{
            logs.push(body);
            if (++callsDone == games.length){
              resolve(logs);
            }
          }
        })
      }
    })
  }

function getScores(team){
  var log = team.log;
  team.points = [log.points_quarter_1,log.points_quarter_2,log.points_quarter_3,log.points_quarter_4,
  log.points_overtime_1,log.points_overtime_2,log.points_overtime_3,log.points_overtime_4,log.points_overtime_5]
}

function mapData(data){
  return data.games.map(function(d){
    var home = data.opponents.filter(function(j){return j.id == d.home_team_id})[0];
    var away = data.opponents.filter(function(j){return j.id == d.away_team_id})[0];
    var winner = data.opponents.filter(function(j){return j.id == d.winning_team_id})[0];
    var loser = data.opponents.filter(function(j){
      return (d.home_team_id == d.winning_team_id)? j.id==d.away_team_id: j.id==d.home_team_id;
    })[0];
    var logs = data.team_game_logs.filter(function(j){return j.game_id == d.id});
    home.log = logs.filter(function(j){return j.opponent_id != home.id})[0];
    away.log = logs.filter(function(j){return j.opponent_id != away.id})[0];
    home.won = (d.winning_team_id==home.id)?true:false;
    home.home = true;
    away.won = (d.winning_team_id==away.id)?true:false;
    away.home = false;
    getScores(home);
    getScores(away);
    return {
      slug:d.slug,
      scoreline:d.scoreline,
      label:d.label,
      teams:[home,away]
    };
  })
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
        getData(url).then(function(games){
          getTopPerformances(mapData(games)).then(function(gameLogs){
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
