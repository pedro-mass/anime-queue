module.exports = function(app) {
	var AnimeController = require('../controllers/anime.server.controller');
	var UserController = require('../controllers/users.server.controller');

	app.route('/api/anime')
		.get(UserController.verifyToken, AnimeController.list)
		.post(UserController.verifyToken, AnimeController.create)
		.delete(AnimeController.purge);

	app.route('/api/anime/:animeId')
		.get(UserController.verifyToken, AnimeController.read)
		.put(UserController.verifyToken, AnimeController.update)
		.delete(UserController.verifyToken, AnimeController.destroy);

	app.put('/api/anime/:animeID/nextEpisode', AnimeController.nextEpisode);
	app.put('/api/anime/:animeID/previousEpisode', AnimeController.previousEpisode);

	app.param('animeId', AnimeController.animeById);



	app.route('/api/registerGuest')
		.post(UserController.registerGuest);

	app.route('/api/register')
		.post(UserController.findUserFromToken, UserController.register);

	app.route('/api/login')
		.post(UserController.login);

	// if none of the other routes are matched, default route
	app.get('*', function(req, res) {
		res.sendFile('client/index.html');
	});
};
