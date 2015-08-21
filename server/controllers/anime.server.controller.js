var Anime = require('./..models/anime');
var _ = require('lodash');

exports.list = function(req, res) {
	if (req.user) {
		Anime.find({ user: req.user }, function(err, anime) {
			if (err) {
				return res.send(err);
			}
			return res.json(anime);
		});
	} else {
		return res.status(403).send({
      success: false,
      message: 'No user provided.'
    });
	}
};

exports.create = function(req, res) {
	var anime = new Anime(req.body);
	anime.user = req.user;

	anime.save(function(err) {
		if (err) { res.send(err); }
		res.json(anime);
	});
};

exports.purge = function(req, res) {
	Anime.remove(function(err, anime) {
		if (err) { res.send(err); }
		res.json({ message: "good job m8!" });
	});
};

exports.animeById = function(req, res, next, id) {
	Anime.findById(id, function(err, anime) {
		if (err) { return next(err); }
		if(!anime) { return next(new Error('can\'t find anime')); }
		req.anime = anime;
		return next();
	});
};

exports.read = function(req, res) {
	res.json(req.anime);
};

exports.update = function(req, res) {
	var anime = req.anime;
	anime = _.extend(anime, req.body);
	anime.save(function(err) {
		if (err) { res.send(err); }
		res.json(anime);
	});
};

exports.destroy = function(req, res) {
	req.anime.remove(function(err, anime) {
		if (err) { res.send(err); }
		res.json({ message: "good job m8!" });
	});
};

exports.updateEpisode = function(req, res, increment) {
	var anime = req.anime;
	anime.lastWatched += increment;

	anime.save(function(err) {
		if (err) { res.send(err); }
		res.json(anime);
	});
};
