require("../db/schema")
var mongoose = require('mongoose')

var DayModel = mongoose.model("Day")
module.exports = DayModel
