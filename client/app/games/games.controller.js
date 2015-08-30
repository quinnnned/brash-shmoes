'use strict';

angular
.module('brashShmoesApp')
.controller('GamesController', function ($scope, $http, Auth, Game, socket) {
  
  var maxSummaryLength = 200;  
  
  $scope.disableSuggestions = false;
  
  $scope.suggestions = [];
  
  $scope.allowMoreSuggestions = true;
  
  // Get games
  $scope.games= [];
  
  var reloadGames = function() {
    Game.all(function(games){
      $scope.games = games;
      pushRankings();
    });  
  }
  
  reloadGames();
  
  $scope.submitSuggestions = function() {
    $scope.disableSuggestions = true;
    $scope.showSubmitSuggestions = false;
    Game.submitSuggestions($scope.suggestions, reloadGames);
  };
  
  $scope.onSelect = function ($item, $model, $label) {
    Game.find($model.id, function(game){
      delete $scope.selection;
      game.igdb_id = $model.id;
      
      $scope.setSelectedGame(game);
    });
  };
  
  $scope.upVote = function(game) { moveGame(game, -1); };
  
  $scope.downVote = function(game) { moveGame(game, +1); };
  
  var pushRankings = function() {
    $http.post('/api/games/rank',{
      order: _($scope.games)
              .filter('ranked', true)
              .pluck('igdb_id')
              .value()
    } ).then(function(res){console.log(res);});
  };
  
  var moveGame = function(game, direction) {
    var i = $scope.games.indexOf(game);
    var j = i + direction;
    
    if (j < 0) return;
    if (j > $scope.games.length - 1) return;
    
    var temp = $scope.games[i];
    $scope.games[i] = $scope.games[j];
    $scope.games[j] = temp;
    $scope.games[j].isOpen = true;
    
    // Both of these games are now ranked
    $scope.games[i].ranked = true;
    $scope.games[j].ranked = true;
    
    pushRankings();
  };
  
  $scope.setSelectedGame = function(game) {
    $scope.selectedGame = game;
    $scope.shortenSummary = true;
    setGameSummary();
  };

  $scope.getLocation = function(val) {
    if (val.length < 4) return; // min query = 4 letters
    return $http.get('/api/games/search', { params: { q: val } })
      .then(function(response){
        return response.data.map(function(item){
          return item;
        });
    });
  };
  
  var setGameSummary = function() {
    $scope.displayedSummary = $scope.selectedGame.summary;
    $scope.moreOrLess = $scope.shortenSummary ? ' more >>' : ' << less';
    $scope.moreOrLess = $scope.selectedGame.summary.length < maxSummaryLength ? '' : $scope.moreOrLess;
    $scope.displayedSummary = $scope.shortenSummary ? $scope.displayedSummary.substring(0,maxSummaryLength) : $scope.displayedSummary;
  };
  
  $scope.toggleSummary = function() {
    $scope.shortenSummary = !$scope.shortenSummary;
    setGameSummary();
  };
  
  $scope.suggestGame = function(game) {
    
    if (_.contains(_.pluck($scope.games,'igdb_id'),game.igdb_id)) {
      alert('This game has already been suggested!');
      return;  
    }
    
    if (_.contains(_.pluck($scope.suggestions,'igdb_id'),game.igdb_id)) {
      alert("This game is already in your suggestions!");
      return;  
    }
    
    $scope.suggestions.push(game);
    $scope.selectedGame = null;
    updateGameSearch();
  };
  
  $scope.unsuggestGame = function(game) {
    var idx = $scope.suggestions.indexOf(game);
    $scope.suggestions.splice(idx,1);
    updateGameSearch();
  };
  
  var updateGameSearch = function(){
    $scope.allowMoreSuggestions = $scope.suggestions.length < 3;
    $scope.showSubmitSuggestions = $scope.suggestions.length == 3;
  };

});
