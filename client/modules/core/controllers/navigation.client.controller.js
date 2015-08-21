var module = angular.module('core');

// Handles the nav bar
module.controller('NavCtrl', [
  '$scope', 'authSrv', '$state',
  function($scope, authSrv, $state) {
    $scope.isLoggedIn = authSrv.isLoggedIn;
    $scope.currentUser = authSrv.currentUser;
    $scope.logOut = function() {
      authSrv.logOut();

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
