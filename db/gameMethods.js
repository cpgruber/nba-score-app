var fs = require("fs");
var env = fs.existsSync("./env.js") ? require("./env") : process.env;
var request = require("request");
var Day = require("../models/day");
var Game = require("../models/game");

var stattleship_params = {
  method:'GET',
  json:true,
  headers:{
    'Content-Type':'application/json',
    'Authorization':'Token token='+env.stattleship,
    'Accept':'application/vnd.stattleship.com; version=1.2'
  }
}

var getData = function (url) {
  console.log("getting data")
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
  console.log("getting top performances")
  return new Promise(function(resolve, reject){
    console.log("getting player game logs")
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
  console.log("got top player")
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
  console.log("mapped player log")
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

function formatDate(date){
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  if (month.toString().length == 1){
    month = "0"+month;
  }
  if (day.toString().length == 1){
    day = "0"+day;
  }
  return year+"-"+month+"-"+day;
}

module.exports = {
  getData:getData,
  getTopPerformances:getTopPerformances,
  mapData:mapData,
  formatDate:formatDate
}
