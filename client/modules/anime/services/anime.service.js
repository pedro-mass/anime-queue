var module = angular.module('anime');

module.factory('Anime', [
    '$resource',
    function($resource) {
        return $resource('/api/anime/:animeId',
          { noteId: '@_id'},
          { 'update': {method: 'PUT'} }
        );
    }
]);
