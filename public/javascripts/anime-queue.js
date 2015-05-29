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
                templateUrl: '../partials/anime-view.html',
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

        $scope.isFormVisible = false;

        $scope.showForm = function(show) {
            $scope.isFormVisible = show;

            // clear out the object when we hide the form
            if (!show) {
                $scope.animeToAdd = null;
            }

            // Add is the default actions
            $scope.formAction = 'Add';
            $scope.formTitleAction = 'Add';
        };

        $scope.addAnime = function() {
            if($scope.animeToAdd) {
                if(!isValidAnimeInfo($scope.animeToAdd)) { return; }

                if ($scope.animeToAdd) {
                    //check if the anime had an id
                    if ($scope.animeToAdd._id) {
                        $scope.animeToAdd.lastWatched = $scope.animeToAdd.currentEpisode - 1;

                        animeSrv.update($scope.animeToAdd);
                    } else {
                        animeSrv.create({
                            name: $scope.animeToAdd.name,
                            link: $scope.animeToAdd.link,
                            lastWatched: parseInt($scope.animeToAdd.lastWatched)
                        });
                    }
                }

                // reset form
                $scope.animeToAdd = {};
                $scope.showForm(false);
            }
        };

        $scope.editAnime = function(anime) {
            $scope.showForm(true);

            // change form/title actions for edit
            $scope.formAction = 'Save';
            $scope.formTitleAction = 'Edit';

            $scope.animeToAdd = anime;

            $scope.animeToAdd.currentEpisode = anime.lastWatched + 1;
        };

        $scope.deleteAnime = function(animeIndex) {
            if (animeIndex > -1) {
                animeSrv.delete($scope.animeQueue[animeIndex]);

                // delete from scope as well
                $scope.animeQueue.splice(animeIndex, 1);
            }
        };

        $scope.nextEpisode = function(anime) {
            animeSrv.nextEpisode(anime);
        };

        $scope.previousEpisode = function(anime) {
            animeSrv.previousEpisode(anime);
        };

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
        };

        var cleanseAnimeInfo = function(anime) {
            if(anime) {
                // make lastWatched an int
                if (anime.lastWatched && anime.lastWatched != '') {
                    anime.lastWatched = parseInt(anime.lastWatched);

                    if (isNaN(anime.lastWatched) || anime.lastWatched < 0) {
                        anime.lastWatched = 0;
                    }
                } else {
                    anime.lastWatched = 0;
                }

                // make currentEpisode an int
                if (anime.currentEpisode && anime.currentEpisode != '') {
                    anime.currentEpisode = parseInt(anime.currentEpisode);

                    if (isNaN(anime.currentEpisode) || anime.currentEpisode < 1) {
                        anime.currentEpisode = 1;
                    }
                } else {
                    anime.currentEpisode = 1;
                }
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

        animeSrv.update = function(anime) {
            return $http.put('/anime/' + anime._id, anime).success(function(data){
                anime = angular.copy(data);
            });
        }

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

        animeSrv.delete = function(anime) {
            return $http.put('/anime/' + anime._id + '/delete')
                .success(function(data){
                    anime = {};
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
        $scope.id = anime._id;

        $scope.getAnimeLink = function() {
            link = anime.link;

            if(link) {
                link = link.replace('[#]', anime.lastWatched);
            }

            return link;
        }

        $scope.nextEpisode = function() {
            animeSrv.nextEpisode($scope.anime);
        };

        $scope.previousEpisode = function() {
            animeSrv.previousEpisode($scope.anime);
        };

        // advance forward an episode whenever we get to this page
        $scope.nextEpisode();
    }
]);



// Form validator
ngModule.directive('animeLinkValidator', function() {

    var REQUIRED_PATTERNS = [
        /\d+/,    //numeric values
        /[a-z]+/, //lowercase values
        /[A-Z]+/, //uppercase values
        /\W+/,    //special characters
        /^\S+$/   //no whitespace allowed
    ];

    return {
        require : 'ngModel',
        link : function($scope, element, attrs, ngModel) {
            ngModel.$validators.animeLink = function(value) {
                var status = true;

                // value stores the value
                if (value.contains('[#]')) {
                    status = false;
                }

                //angular.forEach(REQUIRED_PATTERNS, function(pattern) {
                //    status = status && pattern.test(value);
                //});


                return status;
            };
        }
    }
});