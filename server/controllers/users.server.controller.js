var passport = require('passport');
var User = require('../models/user');

var jwt = require('jsonwebtoken');  // used to create, sign, and verify tokens
var tokenSecret = 'Secret';

var _ = require('lodash');

var config = require('../config/config');

exports.register = function(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Please fill out all fields'
    });
  }

  // grab the user from the request
  var user = req.user;

  if (!user) {
    // if none was provided, make a new one
    user = new User();
  }

  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function(err) {
    if (err) {
      return next(err);
    }

    return res.json({
      token: user.generateJWT(3)
    });
  });
};

exports.login = function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Please fill out all fields'
    });
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (user) {
      return res.json({
        token: user.generateJWT(3)
      })
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
};

exports.registerGuest = function(req, res) {
  var user = new User();

  user.save(function(err) {
    if (err) {
      return next(err);
    } else {
      return res.json({
        token: user.generateJWT()
      });
    }
  });
};

function getToken(req) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  return token;
};

// route middleware to verify a token
exports.verifyToken = function(req, res, next) {
  // get the token from the request
  var token = getToken(req);

  // decode token
  if (token) {
    // verifies secret and checks expires
    jwt.verify(token, config.appSecret, function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // Look up user from token
        User.findOne({ _id: decoded._id}, function(err, user) {
          if (err) {
            return res.status(403).send({
              success: false,
              message: 'Invalid token.'
            });
          }

          // check to see if a user was found
          if (!user) {
            return res.status(403).send({
              success: false,
              message: 'User not found.'
            });
          }

          // add the user to the request object for future
          req.user = user;

          // add to request
          next();
        });
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
};

exports.findUserFromToken = function(req, res, next) {
  // get the token from the request
  var token = getToken(req);

  // decode token
  if (token) {
    // verifies secret and checks expires
    jwt.verify(token, config.appSecret, function(err, decoded) {
      if (!err) {
        // Look up user from token
        User.findOne({ _id: decoded._id}, function(err, user) {
          if (!err && user) {
            // add the user to the request object for future
            req.user = user;

            return next();
          } else {
            return next();
          }
        });
      } else {
        return next();
      }
    });
  } else {
    return next();
  }
};
