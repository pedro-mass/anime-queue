var mongoose = require('mongoose');

var AnimeSchema = new mongoose.Schema({
    name: String,
    link: String,
    lastWatched: {type: Number, default: 0}
});

AnimeSchema.methods.nextEpisode = function(cb) {
    this.lastWatched += 1;
    this.save(cb);
}

AnimeSchema.methods.previousEpisode = function(cb) {
    this.lastWatched -= 1;
    this.save(cb);
}

AnimeSchema.methods.delete = function(cb) {
    this.remove();
    //this.save(cb);
}

mongoose.model('Anime', AnimeSchema);