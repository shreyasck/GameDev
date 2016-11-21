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
    function(req, res) {
        res.render('editProfile', {username: req.user.username, title: 'Edit your profile', user: req.user})
    });

// (2)update user info in db

router.post('/editProfile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        // (1) collect data from form
        var username = req.param('username');
        var password = req.param('password');
        var displayName = req.param('displayName');
        var email = req.param('email');
        console.log("username: " + username);
        console.log("password: " + password);
        console.log("displayName: " + displayName);
        console.log("email: " + email);

        var collection = conn.collection('tbl_user');
        var newUser = {username: username};
        collection.update({username:username}, {$set:{displayName:displayName, email:email}} , function (err, doc) {
            console.log("Profile updated:" + doc.id);

            collection.findOne({username:username}, function(err, userFromDB) {
                res.render('profile',{user:userFromDB, message: "successfully updated"});
            });


        });
        //(3) Redirect to profile page

    });

//Change Password
//(1)
router.get('/changePassword',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        res.render('changePassword', {username: req.user.username, title: 'Change the Password', user: req.user})
    });
//(2)Connect to DB
router.post('/changePassword',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        // (1) collect data from form
        var oldpassword = req.param('oldpassword');
        var newpassword = req.param('newpassword');
        var confirmpassword = req.param('confirmpassword');
        console.log("New Password: " + password);
        console.log("Confirm your New Password: " + password);

        var collection = conn.collection('tbl_user');
        var newUser = {username: username};
        collection.update({username:username}, {$set:{password:confirmpassword}} , function (err, doc) {
            console.log("Password Changed Successfully!!:" + doc.id);

            collection.findOne({username: username}, function (err, userFromDB) {
                res.render('profile', {user: userFromDB, message: "Password Changed Successfully!!"});
            })})});

//(3)Redirect to profile page




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


