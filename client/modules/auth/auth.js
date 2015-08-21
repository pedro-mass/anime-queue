var module = angular.module('auth', []);

module.config([
  '$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'modules/auth/templates/login.html',
        controller: 'AuthCtrl'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'modules/auth/templates/register.html',
        controller: 'AuthCtrl'
      });
  }
]);
