'use strict'


var wikipediaQuestionMarksImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Question_opening-closing.svg';

var https = require('https');

var config = require('../../config/environment');

var getCoverUrl = function(game) {
  var base = '';
  if (!game.cover) return wikipediaQuestionMarksImageUrl;
  if (!game.cover.url) return game.cover;
  return 'https://www.igdb.com' + game.cover.url;
};

var igdb_api = function(path, next) {
  https.request({
    host: 'www.igdb.com',
    path: '/api/v1/' + path,
    port: '443',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Token token="' + config.igdb.apiKey + '"'
    }
  },function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
      var data = JSON.parse(str);
      next(null, data);  
    });  
  }).end();  
}

exports.search = function(query, next) {
  var path = 'games/search?q='+query.split(' ').join('+')
  igdb_api(path, next);
};

exports.find = function(id, next) {
  igdb_api('games/'+id, function(err,data){
    data.game.cover = getCoverUrl(data.game),
    next(err, data);
  });
};

/**
 * Recursively converts a list of game id's to game objects;
 */
exports.findList = function(list, next) {
  if (!list.length) return next(null,[]);
  exports.find(list.shift(),function(err, data) {
    if (err) return next(err, []);
    exports.findList(list, function(err, otherGames) {
      if (err) return next(err, otherGames);
      otherGames.unshift({
        name      : data.game.name,
        igdb_id   : data.game.id,
        cover     : data.game.cover
      });
      return next(null, otherGames);  
    }); 
  });
};