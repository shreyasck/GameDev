var express = require('express');
var session = require('express-session')
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var flash = require('express-flash');
var LocalStrategy = require('passport-local').Strategy;
mongoose.connect('localhost');
//mongoose.connect('mongodb://sa:123@ds050189.mlab.com:50189/miedb');



//var db= require('./db');
//var mongodb = require('mongodb');
//var MongoClient = mongodb.MongoClient;
//var url = 'mongodb://localhost:27017/mydb';
//var url = 'mongodb://sa:123@ds050189.mlab.com:50189/miedb';
//var conn;


var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    onlineflag: {type: Boolean},
    displayName: {type: String},
    VerificationFlag: {type: Boolean},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

/*userSchema.pre('save', function(next) {
    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});*/




userSchema.methods.comparePassword = function(candidatePassword, cb) {
    console.log("ComparePassword " + candidatePassword + " " + this.password);
    /*bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err)
        {
            console.log("Error");
            return cb(err);
        }
        cb(null, isMatch);
    });*/
    if (this.password != candidatePassword) { return cb(null, false);}
    cb(null, true);

};

var User = mongoose.model('UserData', userSchema);




//mongodb.MongoClient.connect(url, function(err, database) {
  //  if(err) throw err;

 //   conn = database;

 //   console.log('DB connected on: ' + url);
//});

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.


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
app.use(session({ secret: 'session secret key' }));
app.use(flash());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.


app.use(passport.initialize());
app.use(passport.session());

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err)
        if (!user) {
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            //changeUserFlag(req.user.username, true);
            user.onlineflag = true;
            user.save(function(err) {
                req.logIn(user, function(err) {
                    // done(err, user);
                });
            });
            res.render('home',{ user: req.user ,title:"Sudoku Online Match"});
        });
    })(req, res, next);
});


passport.use(new LocalStrategy(function(username, password, done) {
    //console.log("Login verification " + username + " "  + password);
    User.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user)
        {
            //console.log("No User");
            return done(null, false, { message: 'Incorrect username.' });
        }
        user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});




app.get('/test',
    function(req, res) {
        res.sendfile('views/test.html');
        // res.render('signin');
    });

app.get('/',
    function(req, res) {
        res.render('login', { user: req.user, title:"Sudoku Online Match" });
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
        
        res.render('login');
     //   res.sendFile('Login.html');
    });

app.get('/signin',
    function(req, res){
        res.render('login');
        //   res.sendFile('Login.html');
    });

/*app.post('/signup',
    function(req, res){
        res.render('login');
        //   res.sendFile('Login.html');
    });*/

/*app.post('/login',
    passport.authenticate('local', { failureRedirect: '/error' }),


function(req, res) {

    //change the login status

    changeUserFlag(req.user.username, true);

        res.render('home',{ user: req.user ,title:"Sudoku Online Match"});

    });*/





///////////////////////////////////////////////new separation section for fragmentaion//////////////////////////////////////////////////////////////
var nasir = require('./routes/nasir');
var archana = require('./routes/archana');
var shreyas = require('./routes/shreyas');
var garima = require('./routes/garima');
var padmini = require('./routes/padmini');
var suganya = require('./routes/suganya');


app.use(nasir);
app.use(shreyas);
app.use(garima);
app.use(padmini);
app.use(suganya);
app.use(archana);

/////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = app;

