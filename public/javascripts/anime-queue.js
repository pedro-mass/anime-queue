var app = angular.module('animeQueue', ['ui.router']);

var appName = 'anime-queue';

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        var defaultRoute = 'home';

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl',
                data: {
                    activePage: 'home'
                }
            })

            .state('queue', {
                url: '/queue',
                templateUrl: 'partials/queue.html',
                controller: 'QueueCtrl',
                resolve: {
                    postPromise: ['animeSrv', function(animeSrv){
                        return animeSrv.getAll();
                    }]
                },
                data: {
                    activePage: 'queue'
                }
            })

            .state('anime', {
                url: '/anime/{id}',
                templateUrl: 'partials/anime-view.html',
                controller: 'AnimeCtrl',
                resolve: {
                    anime: ['$stateParams', 'animeSrv', function($stateParams, animeSrv) {
                        return animeSrv.get($stateParams.id);
                    }]
                },
                data: {
                    activePage: 'animeView'
                }
            })

            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'AuthCtrl',
                onEnter: [
                    '$state', 'authSrv',
                    function($state, authSrv) {
                        if (authSrv.isLoggedIn()) {
                            $state.go('home');
                        }
                    }
                ],
                data: {
                    activePage: 'login'
                }
            })

            .state('register', {
                url: '/register',
                templateUrl: 'partials/register.html',
                controller: 'AuthCtrl',
                onEnter: [
                    '$state', 'authSrv',
                    function($state, authSrv) {
                        if (authSrv.isLoggedIn()) {
                            $state.go('home');
                        }
                    }
                ],
                data: {
                    activePage: 'register'
                }
            })
        ;

        $urlRouterProvider.otherwise(defaultRoute);
    }
]);

app.factory('authSrv', [
    '$http', '$window',
    function($http, $window) {
        var auth = {};

        auth.saveToken = function(token) {
            $window.localStorage[appName] = token;
        };

        auth.getToken = function() {
            return $window.localStorage[appName];
        };

        auth.isLoggedIn = function(){
            var token = auth.getToken();

            if(token){
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function(){
            if(auth.isLoggedIn()){
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };

        auth.register = function(user){
            return $http.post('/api/register', user).success(function(data){
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function(user){
            return $http.post('/api/login', user).success(function(data){
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem(appName);
        };

        return auth;
    }
]);

// Handles logIn and Register
app.controller('AuthCtrl', [
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

app.controller('HomeCtrl', [
   '$scope', '$state',
    function($scope, $state) {

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
                        animeSrv.create($scope.animeToAdd);
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

        $scope.getEpisodeDisplay = function(anime) {
            result = anime.lastWatched + 1;

            if (anime.finalEpisode) {
                result += '/' + anime.finalEpisode;
            }

            return result;
        };

        $scope.isAnimeCompleted = function(anime) {
            if (anime.finalEpisode) {
                return anime.lastWatched+1 >= anime.finalEpisode;
            } else {
                return false;
            }
        };

        $scope.episodeDiff = function(anime) {
            var finalEpisode = anime.finalEpisode || 0;

            //return finalEpisode - anime.lastWatched;
            return anime.lastWatched - finalEpisode;
        };

        var isValidAnimeInfo = function(anime) {
            var result = false;

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
    '$http', 'authSrv',
    function($http, authSrv) {
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

        var getAuthHeader = function() {
            return {
                headers: { Authorization: 'Bearer ' + authSrv.getToken() }
            }
        };

        animeSrv.getAll = function() {
            return $http.get('/api/anime', getAuthHeader()).success(function(data) {
                angular.copy(data, animeSrv.anime);
            });
        };

        animeSrv.create = function(anime) {
            return $http.post('/api/anime', anime, getAuthHeader()).success(function(data){
                animeSrv.anime.push(data);
            });
        };

        animeSrv.update = function(anime) {
            return $http.put('/api/anime/' + anime._id, anime, getAuthHeader()).success(function(data){
                anime = angular.copy(data);
            });
        };

        animeSrv.nextEpisode = function(anime) {
            return $http.put('/api/anime/' + anime._id + '/nextEpisode', null, getAuthHeader())
                .success(function(data){
                    anime.lastWatched += 1;
                });
        };

        animeSrv.previousEpisode = function(anime) {
            return $http.put('/api/anime/' + anime._id + '/previousEpisode', null, getAuthHeader())
                .success(function(data){
                    anime.lastWatched -= 1;
                });
        };

        animeSrv.delete = function(anime) {
            return $http.put('/api/anime/' + anime._id + '/delete', null, getAuthHeader())
                .success(function(data){
                    anime = {};
                });
        };

        animeSrv.get = function(id) {
            return $http.get('/api/anime/' + id, getAuthHeader()).then(function(res){
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
            var link = anime.link;

            if(link) {
                link = link.replace('[#]', anime.lastWatched);
            }

            return link;
        };

        $scope.nextEpisode = function() {
            animeSrv.nextEpisode($scope.anime);
        };

        $scope.previousEpisode = function() {
            animeSrv.previousEpisode($scope.anime);
        };
    }
]);

// Handles the nav bar
app.controller('NavCtrl', [
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
            if ($state.current.data
                    && $state.current.data.activePage
                    && $state.current.data.activePage == 'animeView') {
                result = false;
            }

            return result;
            //return $state.current.data.activePage != 'animeView';
        };
    }
]);