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

  query.exec(function (err, animeModel){
    if (err) { return next(err); }
    if (!animeModel) { return next(new Error('can\'t find anime')); }

    req.animeModel = animeModel;
    return next();
  });
});


router.get('/anime', function(req, res, next) {
  Anime.find(function(err, animeModel){
    if(err){ return next(err); }

    res.json(animeModel);
  });
});

router.post('/anime', function(req, res, next) {
  var animeModel = new Anime(req.body);

  animeModel.save(function(err, animeModel){
    if(err){ return next(err); }

    res.json(animeModel);
  });
});

router.get('/anime/:anime', function(req, res) {
  res.json(req.animeModel);
});

router.put('/anime/:anime/nextEpisode', function(req, res, next) {
  req.animeModel.nextEpisode(function(err, animeModel){
    if (err) { return next(err); }

    res.json(animeModel);
  });
});

router.put('/anime/:anime/previousEpisode', function(req, res, next) {
  req.animeModel.previousEpisode(function(err, animeModel){
    if (err) { return next(err); }

    res.json(animeModel);
  });
});

router.put('/anime/:anime/delete', function(req, res, next) {
  req.animeModel.delete(function(err, animeModel){
    if (err) { return next(err); }

    //res.json(animeModel);
  });
});

module.exports = router;