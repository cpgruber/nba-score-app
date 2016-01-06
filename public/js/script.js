$(document).ready(function(){
  var today = new Date();
  today.setHours(today.getHours()-8);
  var tDate = today.toISOString().substring(0, 10);
  var yesterday = new Date(today.setDate(today.getDate()-1));
  var yDate = yesterday.toISOString().substring(0, 10);
  $("input").val((yesterday.getMonth() + 1)+'/'+yesterday.getDate()+'/'+yesterday.getFullYear());
  console.log(tDate,yDate)
  fetchGames(tDate);

  $("input").datepicker({
    minDate: new Date(2015,9,27),
    maxDate: -1
  });

  $("input").on("change",function(e){
    var date = $(this).val();
    var d = new Date(date)
    d.setDate(d.getDate()+1);
    var da = d.toISOString().substring(0, 10);
    fetchGames(da);
  });

  function fetchGames(date){
    $(".games").empty();
    Game.fetch(date).then(function(games){
      var max = Game.getMax(games);
      GameView.scale = Game.makeScale(max);
      games.forEach(function(game){
        var gameView = new GameView(game);
        $(window).on("resize",function(){
          gameView.render();
        })
      })
    });
  }
});
