var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../config/config');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true
  },
  hash: String,
  salt: String
});

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

UserSchema.methods.generateJWT = function (days) {
  var tokenize = {
    _id: this._id,
    username: this.username
  };

  // set expiration to 60 days
  if (days !== undefined) {
    var exp = new Date();
    exp.setDate(exp.getDate() + days);

    tokenize.exp = parseInt(exp.getTime() / 1000);
  } else {
    tokenize.guest = true;
  }

  return jwt.sign(tokenize, config.appSecret, {});
};

module.exports = mongoose.model('User', UserSchema);
