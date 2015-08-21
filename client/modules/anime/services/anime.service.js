var module = angular.module('anime');

module.factory('animeSrv', [
  '$http', 'authSrv',
  function($http, authSrv) {
    var animeSrv = {
      anime: [{
        name: "dbz kai",
        link: "http://www.dragonballclub.net/dragonball-z-kai-episode-[#]/",
        lastWatched: 98
      }, {
        name: "fullmetal alchmeist brotherhood",
        link: "http://www.dubzonline.pw/fullmetal-alchemist-brotherhood-episode-[#]-english-dub/",
        lastWatched: 20
      }, {
        name: "Hajime No Ippo",
        link: "http://www.animeram.org/hajime-no-ippo/[#]",
        lastWatched: 25
      }]
    };

    var getAuthHeader = function() {
      return {
        headers: {
          Authorization: 'Bearer ' + authSrv.getToken()
        }
      };
    };

    animeSrv.getAll = function() {
      return $http.get('/api/anime', getAuthHeader()).success(function(data) {
        angular.copy(data, animeSrv.anime);
      });
    };

    animeSrv.create = function(anime) {
      return $http.post('/api/anime', anime, getAuthHeader()).success(function(data) {
        animeSrv.anime.push(data);
      });
    };

    animeSrv.update = function(anime) {
      return $http.put('/api/anime/' + anime._id, anime, getAuthHeader()).success(function(data) {
        anime = angular.copy(data);
      });
    };

    animeSrv.nextEpisode = function(anime) {
      return $http.put('/api/anime/' + anime._id + '/nextEpisode', null, getAuthHeader())
        .success(function(data) {
          anime.lastWatched += 1;
        });
    };

    animeSrv.previousEpisode = function(anime) {
      return $http.put('/api/anime/' + anime._id + '/previousEpisode', null, getAuthHeader())
        .success(function(data) {
          anime.lastWatched -= 1;
        });
    };

    animeSrv.delete = function(anime) {
      return $http.put('/api/anime/' + anime._id + '/delete', null, getAuthHeader())
        .success(function(data) {
          anime = {};
        });
    };

    animeSrv.get = function(id) {
      return $http.get('/api/anime/' + id, getAuthHeader()).then(function(res) {
        return res.data;
      });
    };

    return animeSrv;
  }
]);
