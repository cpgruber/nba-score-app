require("../db/schema")
var mongoose = require('mongoose')

var GameModel = mongoose.model("Game")
module.exports = GameModel
