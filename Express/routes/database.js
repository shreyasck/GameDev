/**
 * Created by Nasir on 11/19/2016.
 */
var mongoose = require('mongoose');
//var connectionString = 'mongodb://sa:123@ds050189.mlab.com:50189/miedb';
var connectionString = 'localhost';

mongoose.connect(connectionString);

// connection  successfully
mongoose.connection.on('connected', function () {
    console.log('DB connected successfully to: ' + connectionString);
});

// connection  error
mongoose.connection.on('error',function (err) {
    console.log('DB connection error: ' + err);
});

// connection  disconnected
mongoose.connection.on('disconnected', function () {
    console.log('DB connection disconnected');
});

var Schema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    onlineflag: {type: Boolean},
    displayName: {type: String},
    VerificationFlag: {type: Boolean},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
var  tbl_GameDateSchema = new mongoose.Schema({
    id: {type: String}
});
Schema.methods.comparePassword = function(candidatePassword, cb) {
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
module.exports = {
    sayHi: function() {
        return "Hi";
    },

    sayBye: function() {
        return "Bye";
    },
    //userSchema : Schema,
    User : mongoose.model('tbl_user', Schema),
    GameDateSchema : mongoose.model('tbl_GameDateSchema', tbl_GameDateSchema)
};