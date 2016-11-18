var express = require('express');
var router = express.Router();

/* GET home page. */








router.get('/signup', function(req, res) {
    res.render('signup', {
        user: req.user
    });
});

router.post('/signup', function(req, res) {
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

router.get('/forgotpassword',
    function(req, res){
        res.render('forgotpassword');
        //   res.sendFile('Login.html');
    });



/*router.post('/forgotpassword',
 function(req, res){
 res.render('login');
 //   res.sendFile('Login.html');
 });*/

router.post('/forgotpassword', function(req, res, next) {
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

router.get('/reset/:token', function(req, res) {
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

router.post('/reset/:token', function(req, res) {
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





module.exports = router;