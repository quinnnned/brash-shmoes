'use strict';

angular.module('brashShmoesApp')
  .service('Game', function ($http) {
    this.search = function(queryString, next) {
        $http.get('/api/games/search?q='+queryString, {}).then(function(res) {
          next(res.data);
        });
    };
    
    this.find = function(id, next) {
      $http.get('/api/games/search/'+id, {}).then(function(res) {
        next(res.data);
      });
    };
    
    this.submitSuggestions = function(suggestions, next) {
      $http.post('/api/users/me/suggestions', {
        suggestionIds: suggestions.map(function(suggestion) {
          return suggestion.igdb_id;
        })  
      }).then(next);
    };
    
    this.all = function(next) { 
      $http.get('/api/games/').then(function(res){
        next(res.data);
      }); 
    };
});
