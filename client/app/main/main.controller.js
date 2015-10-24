'use strict';

angular.module('brashShmoesApp')
  .controller('MainCtrl', function ($window, $scope, $http, socket) {
    
    
    console.log('hey it changes');
    
    
    $scope.games = [];
    $http.get('/api/games/group/').then(function(res) {
      $scope.games = res.data.games;  
      $scope.points = res.data.points;
    }, console.log);
    
    $scope.shames = [];
    $scope.fames = [];
    $http.get('/api/users/shame/').then(function(res){
      $scope.shames = res.data.shames;
      $scope.fames = res.data.fames;
    }, console.log);
  });
