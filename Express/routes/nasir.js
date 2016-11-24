var express = require('express');
var router = express.Router();



router.get('/mpstart',
    function(req, res){
        res.render('../views/multiplayer/MPPlayingPage');
        //   res.sendFile(__dirname +'/MPPlayingPage.html');
    });

router.get('/MPChoose',
    function(req, res){
        res.render('../views/multiplayer/MPChooseLevel');
        //   res.sendFile(__dirname +'/MPPlayingPage.html');
    });

router.post('/MPPlay',
    function(req, res){
        res.render('./multiplayer/MPPlayingPage');
        //   res.sendFile('Login.html');
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
