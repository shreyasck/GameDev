
var express = require('express');
var router = express.Router();



router.get('/mpstart',
    function(req, res){
        res.render('../views/multiplayer/MPPlayingPage');
        //   res.sendFile(__dirname +'/MPPlayingPage.html');
    });


router.get('/Sayhi', function(req, res, next) {
    res.render('error');
});
router.get('/startGame',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('startGame');//, { user: req.user });
    });


module.exports = router;
