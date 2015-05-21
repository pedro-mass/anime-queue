$(document).ready(function() {
    changeAnime("http://www.animeram.org/hajime-no-ippo/8");
});

function changeAnime(anime) {
    $("#anime").html('<object data="' + anime + '"/>');
}


var app = angular.module('animeQueue', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'partials/queue.html',
                controller: 'QueueCtrl'
            });

        $stateProvider
            .state('anime', {
                url: '/anime/{id}',
                templateUrl: 'partials/anime_view.html',
                controller: 'AnimeCtrl'
            });

        $urlRouterProvider.otherwise('home');
    }
]);

app.controller('QueueCtrl',[
   '$scope', 'animeSrv',
    function($scope, animeSrv) {
        $scope.animeQueue = animeSrv.anime;

        $scope.getAnimeLink = function(anime) {
            link = anime.link;

            if(link) {
                link.replace('[#]', anime.lastWatched+1);
            }

            return link;
        }

        $scope.addAnime = function() {
            if(!isValidAnimeInfo($scope.animeToAdd)) { return; }

            if ($scope.animeToAdd) {
                $scope.animeQueue.push({
                    name: $scope.animeToAdd.name,
                    link: $scope.animeToAdd.link,
                    lastWatched: parseInt($scope.animeToAdd.lastWatched)
                });
            }

            $scope.animeToAdd = {};
        }

        var isValidAnimeInfo = function(anime) {
            result = false;

            cleanseAnimeInfo(anime);

            // TODO: make sure the link has the substring we need: '[#]'

            if(anime
                && anime.name && anime.name != ''
                && anime.link && anime.link != ''
            ) {
                result = true;
            }


            return result;
        }

        var cleanseAnimeInfo = function(anime) {
            // make lastWatched an int
            if (anime.lastWatched && anime.lastWatched != '') {
                anime.lastWatched = parseInt(anime.lastWatched);

                if (isNaN(anime.lastWatched)) {
                    anime.lastWatched = 0;
                }
            } else {
                anime.lastWatched = 0;
            }
        }
    }
]);

app.factory('animeSrv', [function() {
    var animeSrv = {
        anime: [
            {
                name: "dbz kai",
                link : "http://www.dragonballclub.net/dragonball-z-kai-episode-[#]/",
                lastWatched : 98
            },
            {
                name: "fullmetal alchmeist brotherhood",
                link : "http://www.dubzonline.pw/fullmetal-alchemist-brotherhood-episode-[#]-english-dub/",
                lastWatched : 20
            },
            {
                name: "Hajime No Ippo",
                link : "http://www.animeram.org/hajime-no-ippo/[#]",
                lastWatched : 25
            }
        ]
    };

    return animeSrv;
}]);

app.controller('AnimeCtrl', [
   '$scope', '$stateParams', 'animeSrv',
    function($scope, $stateParams, animeSrv) {
        $scope.anime = animeSrv.anime[$stateParams.id];

        $scope.id = $stateParams.id;

        $scope.nextEpisode = function() {
            $scope.anime.lastWatched = $scope.anime.lastWatched + 1;
        };

        $scope.previousEpisode = function() {
            $scope.anime.lastWatched = $scope.anime.lastWatched - 1;
        };
    }
]);