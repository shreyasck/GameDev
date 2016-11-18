var express = require('express');
var router = express.Router();

/* GET home page. */



router.get('/invite',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){



        var collection = conn.collection('tbl_user');

        collection.find({onlineflag:true}).toArray(function (err, result)
        { if (err) { console.log(err); }

        else if (result) {
            res.render('invite', {onlineUsers: result, title: "Invite A Friend "});
            console.log('Found:', result);
        }
        else { console.log('No document(s) found with defined "find" criteria!'); }
        });

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


module.exports = router;