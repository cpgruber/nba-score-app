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
      .attr("transform",function(d,i){
        var prevPoint = 0;
        var vals = d3.select(this.parentNode).datum().points;
        for (var b=0;b<i+1;b++){
          prevPoint+=vals[b]
        }
        return "translate("+GameView.scale(prevPoint)+",15)"
      })
      .text(function(d,i){
        var prevPoint = 0;
        var vals = d3.select(this.parentNode).datum().points;
        for (var b=0;b<i+1;b++){
          prevPoint+=vals[b]
        }
        return prevPoint;
      })
      .style("fill",function(d,i){
        var palette = d3.select(this.parentNode).datum().palette;
        return palette[i%2]||"fff";
      })
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
  }
}
