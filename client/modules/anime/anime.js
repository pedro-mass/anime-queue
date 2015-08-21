var module = angular.module('anime', ['ui.router']);

module.config([
  '$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('queue', {
        url: '/queue',
        templateUrl: 'modules/anime/templates/queue.html',
        controller: 'QueueCtrl'
      })
      .state('anime', {
        url: '/anime/{id}',
        templateUrl: 'modules/anime/templates/anime-view.html',
        controller: 'AnimeCtrl'
      });
  }
]);
