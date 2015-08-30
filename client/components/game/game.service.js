'use strict';

angular.module('brashShmoesApp')
  .service('Game', function ($http) {
    this.search = function(queryString, next) {
        $http.get('/api/games/search?q='+queryString, {

        }).then(function(res) {
          next(res.data);
        });
    };
    
    this.find = function(id, next) {
      $http.get('/api/games/search/'+id, {
        }).then(function(res) {
          next(res.data);
        });
    };
    
    this.submitSuggestions = function(suggestions, next) {
      suggestions.forEach(function(suggestion){
        $http.post('/api/games/', convert(suggestion)).then(next);  
      });
    };
    
    this.all = function(next) { $http.get('/api/games/').then(function(res){ console.log(res.data); next(res.data);}); };
    
    var convert = function(suggestion) {
      return {
        name      : suggestion.name
      , igdb_id   : suggestion.igdb_id
      , cover     : suggestion.cover
      
      };
    };
});
