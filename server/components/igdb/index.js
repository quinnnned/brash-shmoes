'use strict'

var https = require('https');

var config = require('../../config/environment');

var igdb_api = function(path, next) {
  https.request({
    host: 'www.igdb.com',
    path: '/api/v1/'+path,
    port: '443',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Token token="'+config.igdb.apiKey+'"'
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


exports.find = function(id,next) {
  var path = 'games/'+id;
  igdb_api(path, next);
};
