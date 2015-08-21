var module = angular.module('auth');

// Handles logIn and Register
module.controller('AuthCtrl', [
  '$scope', '$state', 'AuthService',
  function($scope, $state, AuthService) {
    $scope.user = {};

    $scope.register = function() {
      AuthService.register($scope.user).error(function(error) {
        $scope.error = error;
      }).then(function() {
        $state.go('home');
      });
    };

    $scope.logIn = function() {
      AuthService.logIn($scope.user).error(function(error) {
        $scope.error = error;
      }).then(function() {
        $state.go('queue');
      });
    };
  }
]);
