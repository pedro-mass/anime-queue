var app = angular.module('animeQueue', ['ui.router']);

app.config([
  '$stateProvider','$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    var defaultRoute = 'home';

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'modules/core/templates/home.html',
        controller: 'HomeCtrl'
      })

    $urlRouterProvider.otherwise(defaultRoute);
  }
]);
