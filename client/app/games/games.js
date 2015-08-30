'use strict';

angular.module('brashShmoesApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('games', {
        url: '/games',
        templateUrl: 'app/games/games.html',
        controller: 'GamesController'
      });
  });