var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI||'mongodb://localhost/nba-scoreboard');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId

var GameSchema = new Schema({
  createdAt: Date,
  game: Object
});

var DaySchema = new Schema({
  createdAt: Date,
  day:String,
  games: [GameSchema]
});

mongoose.model("Day", DaySchema)
mongoose.model("Game", GameSchema)
