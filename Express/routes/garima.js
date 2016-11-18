var express = require('express');
var router = express.Router();

/* GET home page. */


router.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('profile', { user: req.user , title:"Sudoku Online Match"});
    });

router.get('/editProfile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('editProfile', { user: req.user , title:"Sudoku Online Match"});
    });

router.get('/1',
    // require('connect-ensure-login').ensureLoggedIn(),
// need to change user verification flag to true

    function(req, res){
        var collection = conn.collection('tbl_user');

        var username = req.param('username');
        var id = req.param('id');

        console.log("user name:  VerificationFlag is changed"+ username + " ID : "+ id);

        collection.updateOne({"username":username}, {$set:{"VerificationFlag":true}});

        res.render('verification'); //,{ user:req.user}
    });


module.exports = router;

