var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();


var Anime = mongoose.model('Anime');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.param('anime', function(req, res, next, id) {
  var query = Anime.findById(id);

  query.exec(function (err, anime){
    if (err) { return next(err); }
    if (!anime) { return next(new Error('can\'t find anime')); }

    req.anime = anime;
    return next();
  });
});


router.get('/anime', function(req, res, next) {
  Anime.find(function(err, anime){
    if(err){ return next(err); }

    res.json(anime);
  });
});

router.post('/anime', function(req, res, next) {
  var anime = new Anime(req.body);

  anime.save(function(err, anime){
    if(err){ return next(err); }

    res.json(anime);
  });
});

router.get('/anime/:anime', function(req, res) {
  res.json(req.anime);
});

router.put('/anime/:anime/nextEpisode', function(req, res, next) {
  req.anime.nextEpisode(function(err, anime){
    if (err) { return next(err); }

    res.json(anime);
  });
});

router.put('/anime/:anime/previousEpisode', function(req, res, next) {
  req.anime.previousEpisode(function(err, anime){
    if (err) { return next(err); }

    res.json(anime);
  });
});



module.exports = router;