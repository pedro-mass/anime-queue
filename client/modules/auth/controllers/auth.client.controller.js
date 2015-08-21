var module = angular.module('auth');

// Handles logIn and Register
module.controller('AuthCtrl', [
  '$scope', '$state', 'authSrv',
  function($scope, $state, authSrv) {
    $scope.user = {};

    $scope.register = function() {
      authSrv.register($scope.user).error(function(error) {
        $scope.error = error;
      }).then(function() {
        $state.go('home');
      });
    };

    $scope.logIn = function() {
      authSrv.logIn($scope.user).error(function(error) {
        $scope.error = error;
      }).then(function() {
        $state.go('queue');
      });
    };
  }
]);
