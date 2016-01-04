var GameView = function(game){
  this.game = game;
  this.game.teams.forEach(function(team){
    team.palette = Game.getPalette(team);
  });
  this.margins = {
    left:60,right:60
  }
  this.$el = $("<div class='game-container'>");
  this.render();
  $(".games").append(this.$el);
}

GameView.prototype = {
  makeGs:function(svg){
    var g = svg.selectAll('.game').data(this.game.teams).enter().append('g')
      .attr('class',function(d){
        return 'game '+d.slug;
      })
      .attr('transform',function(d,i){
        var y = (d.home)?0:25;
        return 'translate(0,'+y+')';
      })
    return g;
  },
  addRects:function(g){
    g.append("rect").attr("width",function(d){
      return GameView.scale(d3.sum(d.points))
    }).attr("height",21).style("fill","none").style("stroke","black")

    g.selectAll(".q").data(function(d){return d.points.filter(function(a){return a>0})}).enter().append("rect")
      .attr("class","q")
      .attr("width",function(d){
        return GameView.scale(d)
      })
      .attr("height",20)
      .attr("transform",function(d,i){
        var prevPoint = 0;
        var vals = d3.select(this.parentNode).datum().points;
        for (var b=0;b<i;b++){
          prevPoint+=vals[b]
        }
        return "translate("+GameView.scale(prevPoint)+",0)"
      })
      .style("fill",function(d,i){
        var palette = d3.select(this.parentNode).datum().palette;
        return palette[i%2]||"fff";
      })
  },
  addText:function(g){
    g.selectAll(".score").data(function(d){return d.points.filter(function(a){return a>0})}).enter().append("text")
      .attr("class","score")
      .attr("text-anchor","end")
      .attr("transform",function(d,i){
        var prevPoint = 0;
        var vals = d3.select(this.parentNode).datum().points;
        for (var b=0;b<i+1;b++){
          prevPoint+=vals[b]
        }
        return "translate("+GameView.scale(prevPoint-1)+",15)"
      })
      .text(function(d,i){
        var prevPoint = 0;
        var vals = d3.select(this.parentNode).datum().points;
        for (var b=0;b<i+1;b++){
          prevPoint+=vals[b]
        }
        return prevPoint;
      })
      .style("font-size",12)
      .style("fill",function(d,i){
        var palette = d3.select(this.parentNode).datum().palette;
        return palette[(i+1)%2]||"fff";
      })
  },
  addTopPlayers:function(teams){
    var self = this;
    var tops = $("<div/>");
    tops.addClass("tops");
    tops.html('Top players:');
    teams.forEach(function(team){
      topPlayer = team.topPlayer;
      var lineString = topPlayer.points+"pts"
      var line = [];
      if(topPlayer.rebounds_total > 3){
        line.push([topPlayer.rebounds_total,"reb"]);
      }
      if(topPlayer.assists > 3){
        line.push([topPlayer.assists,"ast"]);
      }
      if(topPlayer.steals > 3){
        line.push([topPlayer.steals,"stl"]);
      }
      if(topPlayer.blocks > 3){
        line.push([topPlayer.blocks,"blk"]);
      }
      line.sort(function(a,b){return b[0] - a[0]});
      var otherStats = [];
      for (var i=0;i<line.length;i++){
        otherStats.push(line[i].join(""));
      }
      var otherString = otherStats.join(", ");
      lineString += ", "+otherString;
      tops.append("<p>"+team.name+" "+team.nickname+": "+topPlayer.name+" "+lineString+"</p>")
    })
    self.$el.append(tops)
  },
  render:function(){
    this.$el.empty();
    this.$el.append("<p>"+this.game.matchup+"</p>");
    var mainW = $(".inner").width();
    var w = (mainW>700)?mainW*0.5:mainW*0.9;
    GameView.scale.range([0,(w-this.margins.right)])
    var svg = d3.select(this.$el[0]).append("svg").attr('height',50).attr('width',w);
    var g = this.makeGs(svg);
    this.addRects(g);
    this.addText(g);
    this.addTopPlayers(this.game.teams);
  }
}
