var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var Anime = mongoose.model('Anime');
var User = mongoose.model('User');

var tokenSecret = 'SECRET';

var auth = jwt({ secret: tokenSecret, userProperty: 'payload' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

// API calls - anime
router.param('animeID', function(req, res, next, id) {
  var query = Anime.findById(id);

  query.exec(function (err, animeModel){
    if (err) { return next(err); }
    if (!animeModel) { return next(new Error('can\'t find anime')); }

    req.animeModel = animeModel;
    return next();
  });
});

router.get('/api/anime', auth, function(req, res, next) {
  if (!req.payload) {
    return next(new Error('no auth info found'));
  }

  var query = User.findById(req.payload._id);

  query.exec(function (err, userModel){
    if (err) { return next(err); }
    if (!userModel) { return next(new Error('can\'t find user to look anime for')); }

    userModel.populate('anime', function(err, userModel) {
      if (err) { return next(err); }

      res.json(userModel.anime);
    });
  });
});

router.post('/api/anime', auth, function(req, res, next) {
  if (!req.payload) { return next(new Error('no auth info found')); }

  var query = User.findById(req.payload._id);
  query.exec(function (err, userModel){
    if (err) { return next(err); }
    if (!userModel) { return next(new Error('can\'t find user')); }

    var animeModel = new Anime(req.body);
    animeModel.user = userModel;

    // Save the anime
    animeModel.save(function(err, animeModel){
      if(err){ return next(err); }

      // update and save the user
      userModel.anime.push(animeModel);
      userModel.save(function(err, userModel) {
        if(err) { return next(err); }

        res.json(animeModel);
      });
    });
  });
});

router.get('/api/anime/:animeID', auth, function(req, res) {
  if (req.payload._id != req.animeModel.user) {
    return res.status(401).send('Unauthorized request: this anime isn\'t owned by the user.' );
  }

  res.json(req.animeModel);
});

router.put('/api/anime/:animeID', auth, function(req, res) {
  if (req.payload._id != req.animeModel.user) {
    return res.status(401).send('Unauthorized request: this anime isn\'t owned by the user.' );
  }

  req.animeModel.update(req.body);

  res.json(req.animeModel);
});

router.put('/api/anime/:animeID/nextEpisode', auth, function(req, res, next) {
  if (req.payload._id != req.animeModel.user) {
    return res.status(401).send('Unauthorized request: this anime isn\'t owned by the user.' );
  }

  req.animeModel.nextEpisode(function(err, animeModel){
    if (err) { return next(err); }

    res.json(animeModel);
  });
});

router.put('/api/anime/:animeID/previousEpisode', auth, function(req, res, next) {
  if (req.payload._id != req.animeModel.user) {
    return res.status(401).send('Unauthorized request: this anime isn\'t owned by the user.' );
  }

  req.animeModel.previousEpisode(function(err, animeModel){
    if (err) { return next(err); }

    res.json(animeModel);
  });
});

router.put('/api/anime/:animeID/delete', auth, function(req, res, next) {
  if (req.payload._id != req.animeModel.user) {
    return res.status(401).send('Unauthorized request: this anime isn\'t owned by the user.' );
  }

  req.animeModel.delete(function(err, animeModel){
    if (err) { return next(err); }

    var query = User.findById(req.payload._id);
    query.exec(function (err, userModel){
      if (err) { return next(err); }
      if (!userModel) { return next(new Error('can\'t find user')); }

      // delete anime from the user
      for(i=0; i<userModel.anime.length; i++) {
        if (animeModel.anime[i] == req.animeModel._id) {
          animeModel.anime.splice(i, 1);
          break;
        }
      }

      userModel.save(function(err, userModel) {
        if(err) { return next(err); }
      });
    });
  });
});

// API calls - authentication
router.post('/api/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/api/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});


// Maybe have a catch all here?
router.get('/*', function(req, res) {
  res.redirect('/');
});

module.exports = router;