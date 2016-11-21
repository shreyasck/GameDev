/**
 * Created by Nasir on 11/19/2016.
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var connectionString = 'mongodb://sa:123@ds050189.mlab.com:50189/miedb';
//var connectionString = 'localhost';

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

var bcrypt = require('bcrypt-nodejs');

var tbl_userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    onlineflag: {type: Boolean},
    displayName: {type: String},
    VerificationFlag: {type: Boolean},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

var tbl_levelsDataSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    levelname: {type: String, required: true},
    standartTime: {type: Date},
    discription: {type: String}
});

var tbl_GameLvlStoredDataSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    level_id: {type: Schema.Types.ObjectId, ref: 'LevelsData'},
    gameData: [Number]
});

var  tbl_GameDataSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    level_id: {type: Schema.Types.ObjectId, ref: 'LevelsData'},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    gameJsonData: [Number],
    score: Number,
    Date: Date,
    gamelvldata_id: {type: Schema.Types.ObjectId, ref: 'GameLvlStoredData'}
});


tbl_userSchema.pre('save', function(next) {
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
 });

tbl_userSchema.methods.comparePassword = function(candidatePassword, cb) {
   // console.log("ComparePassword " + candidatePassword + " " + this.password);
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err)
    {
     console.log("Error");
     return cb(err);
    }
     cb(null, isMatch);
     });
    // if (this.password != candidatePassword) { return cb(null, false);}
    // cb(null, true);
};
module.exports = {
    sayHi: function() {
        return "Hi";
    },

    sayBye: function() {
        return "Bye";
    },
    //userSchema : Schema,
    User : mongoose.model('tbl_user', tbl_userSchema),
    GameDataSchema : mongoose.model('tbl_GameData', tbl_GameDataSchema),
    LevelsDataSchema : mongoose.model('tbl_levelsData', tbl_levelsDataSchema),
    GameLvlStoredDataSchema : mongoose.model('tbl_GameLvlStoredData', tbl_GameLvlStoredDataSchema)
};