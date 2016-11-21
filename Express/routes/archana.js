var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/SPChoose',
    function(req, res){
        res.render('./SinglePlayer/SPChooseLevel');
        //   res.sendFile('Login.html');
    });

router.get('/SPPlay',
    function(req, res){
        res.render('./SinglePlayer/SPPlayingPage');
        //   res.sendFile('Login.html');
    });

router.post('/SPPlay',
    function(req, res){
        res.render('./SinglePlayer/SPPlayingPage');
        //   res.sendFile('Login.html');
    });
router.post('/SPStart',
    function(req, res){
        res.render('./SinglePlayer/SPPlayingPage');
        //   res.sendFile('Login.html');
    });

router.get('/GoBack',
    function(req, res) {
        res.render('home' ,{ user: req.user, title:"Sudoku Online Match" });
        // res.render('signin');
    });

module.exports = router;