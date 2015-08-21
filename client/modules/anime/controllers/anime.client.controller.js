var module = angular.module('anime');

module.controller('AnimeCtrl', [
  '$scope', 'animeSrv', 'anime',
  function($scope, animeSrv, anime) {
    $scope.anime = anime;
    $scope.id = anime._id;

    $scope.getAnimeLink = function() {
      var link = anime.link;

      if (link) {
        link = link.replace('[#]', anime.lastWatched);
      }

      return link;
    };

    $scope.nextEpisode = function() {
      animeSrv.nextEpisode($scope.anime);
    };

    $scope.previousEpisode = function() {
      animeSrv.previousEpisode($scope.anime);
    };
  }
]);
