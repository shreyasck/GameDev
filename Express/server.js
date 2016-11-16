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
//var db= require('./db');
//var mongodb = require('mongodb');
//var MongoClient = mongodb.MongoClient;
//var url = 'mongodb://localhost:27017/mydb';
//var url = 'mongodb://sa:123@ds050189.mlab.com:50189/miedb';
//var conn;

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

mongoose.connect('mongodb://sa:123@ds050189.mlab.com:50189/miedb');

//mongoose.connect('localhost');
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
app.get('/signup', function(req, res) {
    res.render('signup', {
        user: req.user
    });
});

app.post('/signup', function(req, res) {
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.fname + " " + req.body.lname
    });

    user.save(function(err) {
            req.logIn(user, function(err) {
            //res.redirect('/login');
            res.render('home',{ user: req.user ,title:"Sudoku Online Match"});
        });
    });
});

app.get('/forgotpassword',
    function(req, res){
        res.render('forgotpassword');
        //   res.sendFile('Login.html');
    });



/*app.post('/forgotpassword',
    function(req, res){
        res.render('login');
        //   res.sendFile('Login.html');
    });*/

app.post('/forgotpassword', function(req, res, next) {
   // console.log("ForgotPassword");
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    //console.log("User not found " + req.body.email);
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgotpassword');
                }
                //console.log("token "+ token);
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var Transport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'sudoku.kiel',
                    pass: '123ABC456'
                }
            });

            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            Transport.sendMail(mailOptions, function(err, response) {
                if(err)
                    console.log(err);
                else
                    console.log("Message sent");

                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgotpassword');
    });
});

app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.user
        });
    });
});

app.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            //User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            User.findOne({ email: req.body.email}, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password != req.body.confirmpass)
                {
                    done(err, user);
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'sudoku.kiel',
                    pass: '123ABC456'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});

/*app.post('/login',
    passport.authenticate('local', { failureRedirect: '/error' }),


function(req, res) {

    //change the login status

    changeUserFlag(req.user.username, true);

        res.render('home',{ user: req.user ,title:"Sudoku Online Match"});

    });*/

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


app.get('/logout',
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

module.exports = app;

