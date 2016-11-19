var express = require('express');
var session = require('express-session')

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var flash = require('express-flash');
var LocalStrategy = require('passport-local').Strategy;

var database = require("./routes/database");


//var db= require('./db');
//var mongodb = require('mongodb');
//var MongoClient = mongodb.MongoClient;
//var connectionString = 'mongodb://localhost:27017/mydb';
//var connectionString = 'mongodb://sa:123@ds050189.mlab.com:50189/miedb';
//var conn;




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











//mongodb.MongoClient.connect(connectionString, function(err, database) {
  //  if(err) throw err;

 //   conn = database;

 //   console.log('DB connected on: ' + connectionString);
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
app.use(require('morgan')('tiny'));
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
    database.User.findOne({ username: username }, function(err, user) {
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
    database.User.findById(id, function(err, user) {
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
app.get('/forgotpassword',
    function(req, res){
        res.render('forgotpassword');
        //   res.sendFile('Login.html');
    });



/*router.post('/forgotpassword',
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
            database.User.findOne({ email: req.body.email }, function(err, user) {
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

app.get('/logout',
    function(req, res) {
        //change the logged out status
        //changeUserFlag(req.user.username, false);
        database.User.findOne({username: req.user.username}, function (err, user) {
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



app.post('/signup', function(req, res) {
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.fname + " " + req.body.lname,
        newID : '45'
    });

    user.save(function(err) {
        req.logIn(user, function(err) {
            //res.redirect('/login');
            res.render('home',{ user: req.user ,title:"Sudoku Online Match"});
        });
    });
});



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

//Addwd by Nasir