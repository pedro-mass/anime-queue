var app = angular.module('animeQueue',
  ['ui.router', 'core', 'auth', 'anime']);

app.config([
  '$stateProvider','$urlRouterProvider', '$httpProvider', 'AuthInterceptorService',
  function($stateProvider, $urlRouterProvider, $httpProvider, AuthInterceptorService) {
    var defaultRoute = 'home';

    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'modules/core/templates/home.html',
        controller: 'HomeCtrl'
      })

    $urlRouterProvider.otherwise(defaultRoute);

    // attach our auth interceptor to the http requests
    $httpProvider.interceptors.push('AuthInterceptorService');
  }
]);
