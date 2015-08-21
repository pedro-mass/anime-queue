var mongoose = require('mongoose');

var AnimeSchema = new mongoose.Schema({
    name: String,
    link: String,
    lastWatched: {type: Number, default: 0},
    finalEpisode: Number,

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Anime', AnimeSchema);
