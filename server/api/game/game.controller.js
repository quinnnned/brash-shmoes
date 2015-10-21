'use strict';

var _ = require('lodash');

var Game = require('./game.model');
var User = require('../user/user.model')
var igdb = require('../../components/igdb/')
var voting = require('../../components/voting/');

// IGDB // Get a list of games based on a search
exports.search = function(req, res) {
  igdb.search(req.query.q, function(err, data) {
    if (err) return res.status(404).send('Not Found');
    return res.status(200).json(data.games);  
  });
};


exports.detail = function(req, res) {
  igdb.find(req.params.id, function(err, data) {
    var g = data.game;
    if (err) return res.status(404).send('Not Found');
    return res.status(200).json({
      name: g.name,
      summary: g.summary,
      alternateName: g.alternative_names && g.alternative_names.length > 0 ? g.alternative_names[0].name : null,
      cover: g.cover,
      platforms: g.release_dates.map(function(x){return x.platform_name;})
    });  
  });
};

// Get list of games
exports.index = function(req, res) {
  getAllSuggestedGames(function(err, games) {
      if (err) return res.status(503).send();
      res.status(200).json(orderByRanking(games, req.user.rankings));
  });
  // User.find().lean().exec(function (err, users){
  //   if (err) return res.status(503).send();
  //   var plucked = _.pluck(users,'suggestions');
  //   var gameIds = _(plucked).flatten().uniq().value();
  //   igdb.findList(gameIds, function(err, games){
  //     if (err) return res.status(503).send();
  //     res.status(200).json(orderByRanking(games, req.user.rankings));
  //   });
  // });
};

var getAllSuggestedGames = function(next) {
  User.find().lean().exec(function (err, users){
    if (err) return next(err, null);
    var plucked = _.pluck(users,'suggestions');
    var gameIds = _(plucked).flatten().uniq().value();
    igdb.findList(gameIds, function(err, games){
      next(err, games)
    });
  });
};

var orderByRanking = function(games, userRankings) {
  var rankedGames = [];
    var unrankedGames = [];
    games.forEach(function(game){
      game.rank = userRankings.indexOf(game.igdb_id);
      game.ranked = game.rank >= 0;
      if(game.ranked) { 
        rankedGames.push(game);
      } else {
        unrankedGames.push(game);
      }
    });
    return _(rankedGames)
            .sortBy('rank')
            .concat(unrankedGames)
            .value();
};

var getGroupOrdering = function(next){
  User.find().lean().exec(function (err, users){
    if (err) return next(err, null);
    var userRankings = _.pluck(users,'rankings');
    console.log(userRankings);
    next(err,voting.LinearWeighting(userRankings));
  });
};

exports.getGroupRankings = function(req, res) {
  getAllSuggestedGames(function(err, games) {
    if (err) return res.status(503).send();
    getGroupOrdering(function(err,order){
      res.json({
        games : orderByRanking(games, order)
      });  
    });
  });
};

// User posts rankings
exports.rank = function(req, res) {
  req.user.rankings = req.body.order;
  req.user.save(function(err){
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