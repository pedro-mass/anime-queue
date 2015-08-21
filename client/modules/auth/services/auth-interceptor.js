var module = angular.module('auth');

module.factory('AuthInterceptorService', [
  '$q', '$location', 'AuthTokenService',
  function($q, $location, AuthTokenService) {
    var service = {};

    // this will happen on all HTTP requests
    service.request = function(config) {
      // grab the token
      var token = AuthTokenService.getToken();

      // if the token exists, add it to the header as x-access-token
      if (token) {
        config.headers['x-access-token'] = token;
      }

      return config;
    };

    // happens on response errors
    service.responseError = function(response) {
      // if our server returns 403 forbidden response
      if (response.status == 403) {
        $location.path('#/login');
      }

      // return the errors from the server as a promise
      return $q.reject(response);
    };

    return service;
  }
]);
