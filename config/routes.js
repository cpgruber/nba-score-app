var express = require('express');
var router = express.Router();
var gamesController = require('../controllers/gamesController')

router.route('/games')
  .get(gamesController.getGames)

module.exports = router;
