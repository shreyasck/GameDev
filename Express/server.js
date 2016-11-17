var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
//var db= require('./db');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/mydb';
//var url = 'mongodb://sa:123@ds050189.mlab.com:50189/miedb';
var conn;




mongodb.MongoClient.connect(url, function(err, database) {
    if(err) throw err;

    conn = database;

    console.log('DB connected on: ' + url);
});

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function(username, password, cb) {
     //   console.log('user name:' + username + '  passport:'+ passport);
        var collection = conn.collection('tbl_user');
        collection.findOne({username:username}, function(err, item) {
            if (!item) { return cb(null, false); }
            if (item.password != password) { return cb(null, false); }
            return cb(null, item);
        });


        }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    var collection = conn.collection('tbl_user');
    collection.findOne({id:id}, function(err, item) {
        if (err) { return cb(err); }
        cb(null, item);
    });

    /* db.users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
    */
});

// Create a new Express application.
var app = express();
//app.use(express.static('html'));
app.use(express.static('public/stylesheets'));
app.use(express.static('public/images'));
app.use(express.static('public/javascripts'));
//app.use(express.static('views'));
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.


app.use(passport.initialize());
app.use(passport.session());


app.get('/test',
    function(req, res) {
        res.sendfile('views/test.html');
        // res.render('signin');
    });

app.get('/',
    function(req, res) {
        res.render('login',{ message: "  "});
       // res.render('signin');
    });
app.get('/home',
    function(req, res) {
        res.render('home' );
        // res.render('signin');
    });
app.get('/error',
    function(req, res) {
        res.render('error');
        // res.render('signin');
    });


app.get('/login',
    function(req, res){
        //change status
        
        res.render('login',{ message: "  "});
        //   res.sendFile('Login.html');
    });

app.get('/signin',
    function(req, res){
        res.render('signin');
        //   res.sendFile('Login.html');
    });



app.get('/forgotpassword',
    function(req, res){
        res.render('forgotpassword');
        //   res.sendFile('Login.html');
    });


app.post('/forgotpassword',
    function(req, res){
        res.render('login');
        //   res.sendFile('Login.html');
    });


app.post('/login',
    passport.authenticate('local', { failureRedirect: '/error' }),


function(req, res) {

    //change the login status

    changeUserFlag(req.user.username, true);

        res.render('home',{ user: req.user ,title:"Sudoku Online Match"});

    });

app.get('/logout',
    function(req, res){
        //change the logged out status
        changeUserFlag(req.user.username, false);
        req.logout();
        res.redirect('/');
    });
function  changeUserFlag(username, status) {
    var collection = conn.collection('tbl_user');
    console.log("user name:  flag is changed"+ username);
    collection.updateOne({"username":username}, {$set:{"onlineflag":status}});

}
app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('profile', { user: req.user , title:"Sudoku Online Match"});
    });


app.get('/startGame',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('startGame');//, { user: req.user });
    });
//app.listen(4000);

app.get('/1',
   // require('connect-ensure-login').ensureLoggedIn(),
// need to change user verification flag to true

    function(req, res){
        var collection = conn.collection('tbl_user');

        var username = req.param('username');
        var id = req.param('id');

        console.log("user name:  VerificationFlag is changed"+ username + " ID : "+ id);

        collection.updateOne({"username":username}, {$set:{"VerificationFlag":true}});

        res.render('verification'); //,{ user:req.user}
    })


//
module.exports = app;

//Archana code
function  UniqueUsername(username, password,cb) {
    var collection = conn.collection('tbl_user');

    collection.findOne({username:username}, function(err, item) {
        if (!item) {  cb(null, false,{message: 'Unknown user'}); }
        if (item.password != password) {  cb(null, false, {message: 'Invalid password'}); }
         cb(null,true, "ok");// item);
    });


}
app.post('/signup',
    function(req, res) {
// (1) collect data from form
        var username = req.param('username');
        var password = req.param('password');
        var displayName = req.param('displayName');
        var email = req.param('email');
        console.log("username: " + username);
        console.log("password: " + password);
        console.log("displayName: " + displayName);
        console.log("email: " + email);

// (2) insure user not exist

       /* var printFunction = function (par1, par2, data) {
            console.log("data: " + data);
        }
        UniqueUsername(username,password, printFunction);
        //console.log("return value:" + result);
        */
// (3) save new user in db
        var collection = conn.collection('tbl_user');
        var newUser = {username: username, password: password, email: email, displayName: displayName};
        collection.insert(newUser, {w:1}, function (err, doc) {
            console.log("User added:" + doc.id);
            res.render('login', { message: "successfully registered"});
        })
// (4) Redirect to login page
        //change the login status





});
