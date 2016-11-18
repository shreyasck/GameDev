var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/Sayhi', function(req, res, next) {
    res.render('error');
});






router.get('/logout',
    function(req, res) {
        //change the logged out status
        //changeUserFlag(req.user.username, false);
        User.findOne({username: req.user.username}, function (err, user) {
            if (!user) {
                return res.redirect('back');
            }
            user.onlineflag = false;
            user.save(function (err) {
                //req.logIn(user, function (err) {
                //     done(err, user);
                // });
            });
            req.logout();
            res.redirect('/');
        });
    });
function  changeUserFlag(username, status) {
    //var collection = conn.collection('tbl_user');
    // console.log("user name:  flag is changed"+ username);
    // collection.updateOne({"username":username}, {$set:{"onlineflag":status}});
    User.onlineflag = status;
}


router.get('/startGame',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('startGame');//, { user: req.user });
    });
//app.listen(4000);

module.exports = router;
