var express = require('express');
var router = express.Router();

/* GET home page. */








router.get('/signup', function(req, res) {
    res.render('signup', {
        user: req.user
    });
});

router.get('/chooseLevel',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('SinglePlayer/SPChooseLevel');//, { user: req.user });
    });

router.post('/singlePlayer',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
    if(req.body.easy) {
        console.log("Ea " + req.body.easy + " " + req.body.intermediate + " " + req.body.hard);
        // Do Stuffs for handling easy game level
    }
    else if(req.body.intermediate){
        console.log("i " + req.body.easy + " " + req.body.intermediate + " " + req.body.hard);
        // Do Stuffs for handling intermediate game level
    }
        else if(req.body.hard) {
        console.log("h " + req.body.easy + " " + req.body.intermediate + " " + req.body.hard);
        // Do Stuffs for handling hard game level
    }
            else {
        console.log("Error");
    }

        res.render('singlePlayer');//, { user: req.user });
    });

module.exports = router;