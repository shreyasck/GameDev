var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/Sayhi', function(req, res, next) {
    res.render('error');
});







router.get('/startGame',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('startGame');//, { user: req.user });
    });
//app.listen(4000);

module.exports = router;
