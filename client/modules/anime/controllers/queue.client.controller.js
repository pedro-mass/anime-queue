var module = angular.module('anime');

module.controller('QueueCtrl', [
  '$scope', 'animeSrv',
  function($scope, animeSrv) {
    $scope.animeQueue = animeSrv.anime;

    $scope.isFormVisible = false;

    $scope.showForm = function(show) {
      $scope.isFormVisible = show;

      // clear out the object when we hide the form
      if (!show) {
        $scope.animeToAdd = null;
      }

      // Add is the default actions
      $scope.formAction = 'Add';
      $scope.formTitleAction = 'Add';
    };

    $scope.addAnime = function() {
      if ($scope.animeToAdd) {
        if (!isValidAnimeInfo($scope.animeToAdd)) {
          return;
        }

        if ($scope.animeToAdd) {
          //check if the anime had an id
          if ($scope.animeToAdd._id) {
            $scope.animeToAdd.lastWatched = $scope.animeToAdd.currentEpisode - 1;

            animeSrv.update($scope.animeToAdd);
          } else {
            animeSrv.create($scope.animeToAdd);
          }
        }

        // reset form
        $scope.animeToAdd = {};
        $scope.showForm(false);
      }
    };

    $scope.editAnime = function(anime) {
      $scope.showForm(true);

      // change form/title actions for edit
      $scope.formAction = 'Save';
      $scope.formTitleAction = 'Edit';

      $scope.animeToAdd = anime;

      $scope.animeToAdd.currentEpisode = anime.lastWatched + 1;
    };

    $scope.deleteAnime = function(animeIndex) {
      if (animeIndex > -1) {
        animeSrv.delete($scope.animeQueue[animeIndex]);

        // delete from scope as well
        $scope.animeQueue.splice(animeIndex, 1);
      }
    };

    $scope.nextEpisode = function(anime) {
      animeSrv.nextEpisode(anime);
    };

    $scope.previousEpisode = function(anime) {
      animeSrv.previousEpisode(anime);
    };

    $scope.getEpisodeDisplay = function(anime) {
      result = anime.lastWatched + 1;

      if (anime.finalEpisode) {
        result += '/' + anime.finalEpisode;
      }

      return result;
    };

    $scope.isAnimeCompleted = function(anime) {
      if (anime.finalEpisode) {
        return anime.lastWatched + 1 >= anime.finalEpisode;
      } else {
        return false;
      }
    };

    $scope.episodeDiff = function(anime) {
      var finalEpisode = anime.finalEpisode || 0;

      //return finalEpisode - anime.lastWatched;
      return anime.lastWatched - finalEpisode;
    };

    var isValidAnimeInfo = function(anime) {
      var result = false;

      cleanseAnimeInfo(anime);

      // TODO: make sure the link has the substring we need: '[#]'

      if (anime && anime.name && anime.name !== '' && anime.link && anime.link !== '') {
        result = true;
      }


      return result;
    };

    var cleanseAnimeInfo = function(anime) {
      if (anime) {
        // make lastWatched an int
        if (anime.lastWatched && anime.lastWatched !== '') {
          anime.lastWatched = parseInt(anime.lastWatched);

          if (isNaN(anime.lastWatched) || anime.lastWatched < 0) {
            anime.lastWatched = 0;
          }
        } else {
          anime.lastWatched = 0;
        }

        // make currentEpisode an int
        if (anime.currentEpisode && anime.currentEpisode !== '') {
          anime.currentEpisode = parseInt(anime.currentEpisode);

          if (isNaN(anime.currentEpisode) || anime.currentEpisode < 1) {
            anime.currentEpisode = 1;
          }
        } else {
          anime.currentEpisode = 1;
        }
      }

    };
  }
]);
