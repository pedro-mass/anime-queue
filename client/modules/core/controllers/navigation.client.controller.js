var module = angular.module('core');

// Handles the nav bar
module.controller('NavCtrl', [
  '$scope', 'AuthService', '$state',
  function($scope, AuthService, $state) {
    $scope.isLoggedIn = AuthService.isLoggedIn;
    $scope.currentUser = AuthService.currentUser;
    $scope.logOut = function() {
      AuthService.logOut();

      $state.go('home');
    };

    $scope.isNormalNav = function() {
      var result = true;

      // Not normal Nav when we are viewing an anime
      if ($state.current.data && $state.current.data.activePage && $state.current.data.activePage == 'animeView') {
        result = false;
      }

      return result;
      //return $state.current.data.activePage != 'animeView';
    };
  }
]);
