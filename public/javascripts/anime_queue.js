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
                controller: 'QueueCtrl',
                resolve: {
                    postPromise: ['animeSrv', function(animeSrv){
                        return animeSrv.getAll();
                    }]
                }
            });

        $stateProvider
            .state('anime', {
                url: '/anime/{id}',
                templateUrl: '../partials/anime_view.html',
                controller: 'AnimeCtrl',
                resolve: {
                    anime: ['$stateParams', 'animeSrv', function($stateParams, animeSrv) {
                        return animeSrv.get($stateParams.id);
                    }]
                }
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
                animeSrv.create({
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

app.factory('animeSrv', [
    '$http',
    function($http) {
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

        animeSrv.getAll = function() {
            return $http.get('/anime').success(function(data){
                angular.copy(data, animeSrv.anime);
            });
        };

        animeSrv.create = function(anime) {
            return $http.post('/anime', anime).success(function(data){
                animeSrv.anime.push(data);
            });
        };

        animeSrv.nextEpisode = function(anime) {
            return $http.put('/anime/' + anime._id + '/nextEpisode')
                .success(function(data){
                    anime.lastWatched += 1;
                });
        };

        animeSrv.previousEpisode = function(anime) {
            return $http.put('/anime/' + anime._id + '/previousEpisode')
                .success(function(data){
                    anime.lastWatched -= 1;
                });
        };

        animeSrv.get = function(id) {
            return $http.get('/anime/' + id).then(function(res){
                return res.data;
            });
        };

        return animeSrv;
    }
]);

app.controller('AnimeCtrl', [
   '$scope', 'animeSrv', 'anime',
    function($scope, animeSrv, anime) {
        $scope.anime = anime;

        $scope.id = $stateParams.id;

        $scope.nextEpisode = function() {
            animeSrv.nextEpisode($scope.anime);
        };

        $scope.previousEpisode = function() {
            animeSrv.previousEpisode($scope.anime);
        };
    }
]);