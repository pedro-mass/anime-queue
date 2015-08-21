var module = angular.module('auth');

module.factory('AuthTokenService', [
  '$window',
  function($window) {
    var service = {};

    // get the token out of local storage
    service.getToken = function() {
      return $window.localStorage.getItem('token');
    };

    service.getPayload = function(token) {
      return JSON.parse($window.atob(token.split('.')[1]));
    };

    // function to set token or clear token
    // if token is passed, set the token
    // if there is no token, clear it from local storage
    service.setToken = function(token) {
      if (token) {
        $window.localStorage.setItem('token', token);
      } else {
        $window.localStorage.removeItem('token');
      }
    };

    return service;
  }
]);
