'use strict';

angular.module('brashShmoesApp')
  .controller('MainCtrl', function ($window, $scope, $http, socket) {
    
    
    console.log('hey it changes');
    
    
    $scope.games = [];
    $http.get('/api/games/group/').then(function(res) {
      $scope.games = res.data.games;  
    }, console.log);
    
    $scope.shames = [];
    $http.get('/api/users/shame/').then(function(res){
      $scope.shames = res.data.shames;
    }, console.log);
  });
