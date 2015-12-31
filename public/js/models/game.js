var Game = function(info){
  this.matchup = info.label;
  this.outcome = info.scoreline;
  this.teams = info.teams;
}

Game.fetch = function(date){
  return $.ajax({
    type:"GET",
    dataType:"json",
    url:"http://localhost:4000/games?date="+date
  }).then(function(results){
    var games = []
    results.games.forEach(function(result){
      games.push(new Game(result.game))
    })
    return games;
  })
}

Game.getMax = function(games){
  return d3.max(games,function(d){
    return d3.max(d.teams,function(e){
      return e.log.points_scored_total
    })
  })
}

Game.makeScale = function(max,w){
  return d3.scale.linear().domain([0,max])
}

Game.getPalette = function(team){
  var name = (team.nickname=="Lakers")?"Los Angeles Lakers":(team.nickname=="Clippers")?"Los Angeles Clippers":team.name+" "+team.nickname;
  return colors.teams.filter(function(d){return d.name==name})[0].colors.hex;
}
