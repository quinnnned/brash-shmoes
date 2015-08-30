'use strict';

var _ = require('lodash');

var Game = require('./game.model');
var igdb = require('../../components/igdb/')

// IGDB // Get a list of games based on a search
exports.search = function(req, res) {
  igdb.search(req.query.q, function(err, data) {
    if (err) return res.status(404).send('Not Found');
    return res.status(200).json(data.games);  
  });
};

// IGDB // Get a list of games based on a search
exports.detail = function(req, res) {
  igdb.find(req.params.id, function(err, data) {
    var g = data.game;
    if (err) return res.status(404).send('Not Found');
    return res.status(200).json({
      name: g.name,
      summary: g.summary,
      alternateName: g.alternative_names && g.alternative_names.length > 0 ? g.alternative_names[0].name : null,
      cover: g.cover ? g.cover.replace('https://','http://') : '',
      platforms: _.map(g.release_dates,function(x){return x.platform_name;})
    });  
  });
};

// Get list of games
exports.index = function(req, res) {
  Game.find().lean().exec(function (err, games) {
    if(err) { return handleError(res, err); }
    
    var rankedGames = [];
    var unrankedGames = [];
    var userRankings = req.user.rankings;
    games.forEach(function(game){
      game.rank = userRankings.indexOf(game.igdb_id);
      game.ranked = game.rank >= 0;
      
      if(game.ranked) { 
        rankedGames.push(game);
      } else {
        unrankedGames.push(game);
      }
    });
    
    var sortedGames = _(rankedGames)
                        .sortBy('rank')
                        .concat(unrankedGames)
                        .value();
    
    return res.status(200).json(sortedGames);
  });
};

// User posts rankings
exports.rank = function(req, res) {
  console.time('rankpost');
  req.user.rankings = req.body.order;
  req.user.save(function(err){
    console.timeEnd('rankpost');
    if (err) return handleError(res, err);
    
    return res.status(200).json({status:'success'});
  });
};


// Get a single game
exports.show = function(req, res) {
  Game.findById(req.params.id, function (err, game) {
    if(err) { return handleError(res, err); }
    if(!game) { return res.status(404).send('Not Found'); }
    return res.json(game);
  });
};

// Creates a new game in the DB.
exports.create = function(req, res) {
  var newGame = req.body;
  newGame.user = req.user._id;
  console.log(newGame);
  Game.create(newGame, function(err, game) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(game);
  });
};

// Updates an existing game in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Game.findById(req.params.id, function (err, game) {
    if (err) { return handleError(res, err); }
    if(!game) { return res.status(404).send('Not Found'); }
    var updated = _.merge(game, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(game);
    });
  });
};

// Deletes a game from the DB.
exports.destroy = function(req, res) {
  Game.findById(req.params.id, function (err, game) {
    if(err) { return handleError(res, err); }
    if(!game) { return res.status(404).send('Not Found'); }
    game.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}