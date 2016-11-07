var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
module.exports = function(app) {
  var index = require('../controllers/index.server.controller');
  app.get('/', index.render);
};
