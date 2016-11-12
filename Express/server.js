var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
//var db= require('./db');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/mydb';
//var url = 'mongodb://admin:123@ds050189.mlab.com:50189/miedb';
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
        var collection = conn.collection('users');
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
    var collection = conn.collection('users');
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
        res.render('home', { user: req.user, title:"Sudoku Online Match" });
       // res.render('signin');
    });

app.get('/login',
    function(req, res){
        res.render('login');
     //   res.sendFile('Login.html');
    });
app.get('/signin',
    function(req, res){
        res.render('signin');
        //   res.sendFile('Login.html');
    });

app.post('/signup',
    function(req, res){
        res.render('signin');
        //   res.sendFile('Login.html');
    });

app.get('/forgotpassword',
    function(req, res){
        res.render('forgotpassword');
        //   res.sendFile('Login.html');
    });

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/signin  ' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout',
    function(req, res){
        req.logout();
        res.redirect('/');
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('profile', { user: req.user });
    });

app.get('/startGame',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('startGame');//, { user: req.user });
    });
//app.listen(4000);

module.exports = app;

