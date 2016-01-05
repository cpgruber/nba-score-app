// requiring mongoose dependency
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI||'mongodb://localhost/nba-scoreboard');
// instantiate a name space for our Schema constructor defined by mongoose.
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

// setting models in mongoose utilizing schemas defined above, we'll be using
mongoose.model("Day", DaySchema)
mongoose.model("Game", GameSchema)
