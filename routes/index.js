var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var Anime = mongoose.model('Anime');
var User = mongoose.model('User');

var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });

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
  Anime.find(function(err, animeModel){
    if(err){ return next(err); }

    res.json(animeModel);
  });
});

router.post('/api/anime', auth, function(req, res, next) {
  var animeModel = new Anime(req.body);

  animeModel.save(function(err, animeModel){
    if(err){ return next(err); }

    res.json(animeModel);
  });
});

router.get('/api/anime/:animeID', auth, function(req, res) {
  res.json(req.animeModel);
});

router.put('/api/anime/:animeID', auth, function(req, res) {

  req.animeModel.update(req.body);

  res.json(req.animeModel);
});

router.put('/api/anime/:animeID/nextEpisode', auth, function(req, res, next) {
  req.animeModel.nextEpisode(function(err, animeModel){
    if (err) { return next(err); }

    res.json(animeModel);
  });
});

router.put('/api/anime/:animeID/previousEpisode', auth, function(req, res, next) {
  req.animeModel.previousEpisode(function(err, animeModel){
    if (err) { return next(err); }

    res.json(animeModel);
  });
});

router.put('/api/anime/:animeID/delete', auth, function(req, res, next) {
  req.animeModel.delete(function(err, animeModel){
    if (err) { return next(err); }

    //res.json(animeModel);
  });
});

// API calls - authentication
router.post('/api/register', function(req, res, next){
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Please fill out all fields'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function(err) {
    if (err) { return next(err); }

    return res.json({ token: user.generateJWT() });
  });
});

router.post('/login', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }

    if (user) {
      return res.json({ token: user.generateJWT() });
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