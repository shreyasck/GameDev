var express = require('express');
var router = express.Router();
var database = require("./database");

/* GET home page. */



router.get('/invite',
   // require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        console.log("invite function");
        //var collection = conn.collection('tbl_users');
        database.User.find({onlineflag:true}, function(err, onlineUsers) {
            if (err) return
                console.log(err);
            if (!onlineUsers)
            {

                console.log("no body online");
            }
            else
            {
                console.log("There are online users");
                res.render('invite', {onlineUsers: onlineUsers, title: "Invite A Friend "});
            }
        });

       /* collection.find({onlineflag:true}).toArray(function (err, result)
        { if (err) { console.log(err); }

        else if (result) {
            res.render('invite', {onlineUsers: result, title: "Invite A Friend "});
            console.log('Found:', result);
        }
        else { console.log('No document(s) found with defined "find" criteria!'); }
        });
*/
    });
function listofonline ( status) {

    var collection = conn.collection('tbl_user');
    collection.find({onlineflag:status}, function(err, docs){
        return docs;
    });

    var user = [];
    collection.find({},{'username' : 1}).forEach(function(o){
        for (var i = 0; i < o.username.length; i++){
            user.push(o.username)
            console.log("user names: " + user);
        }
    })

}

router.post ('/invite',
    function(id, cd){

        var collection = conn.collection('tbl_user');
        collection.findOne({id:id}, function(err, email) {
            if (err) { return cb(err); }
            cb(null,email);
        });


        res.render('invite');
        //   res.sendFile('invite.html');
    });


module.exports = router;