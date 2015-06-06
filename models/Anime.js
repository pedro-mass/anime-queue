var mongoose = require('mongoose');

var AnimeSchema = new mongoose.Schema({
    name: String,
    link: String,
    lastWatched: {type: Number, default: 0},

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

AnimeSchema.methods.nextEpisode = function(cb) {
    this.lastWatched += 1;
    this.save(cb);
};

AnimeSchema.methods.previousEpisode = function(cb) {
    this.lastWatched -= 1;
    this.save(cb);
};

AnimeSchema.methods.update = function(updatedAnime, cb) {
    this.name = updatedAnime.name;
    this.link = updatedAnime.link;
    this.lastWatched = updatedAnime.lastWatched;

    this.save(cb);
};

AnimeSchema.methods.delete = function(cb) {
    this.remove();
};

mongoose.model('Anime', AnimeSchema);