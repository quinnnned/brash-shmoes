'use strict';

var User = require('./user.model');
var igdb = require('../../components/igdb/')
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');



var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

exports.setMySuggestions = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({ _id: userId }, function(err, user) {
    if (err) return next(err);
    user.suggestions = req.body.suggestionIds;
    user.save(function(err) {
      if (err) return res.status(503).send('Internal Server Error');
      return res.status(200).send('OK');
    });
  });
};

exports.getMySuggestions = function(req, res) {
  igdb.findList(req.user.suggestions, function(err,suggestions){
    if (err) return res.status(503).send(JSON.stringify(err));
    res.json({
      suggestions: suggestions
    });  
  });
};


exports.getShames = function(req, res) {
  User.find({}, function(err, users) {
    
    var userSuggestions = _.pluck(users,'suggestions');
    var suggestions = _(userSuggestions).flatten().uniq().value();
    
    var shames = [];
    
    users.forEach(function(user){
      user.hasNotSuggestedGames = !user.suggestions.length;
      
      user.hasUnrankedGames = _.intersection(user.rankings, suggestions).length 
                            < suggestions.length;                          
      
      if (user.hasNotSuggestedGames) {
        shames.push({
          name: user.name,
          action: 'has not suggested any games.'
        });  
      }
      if (user.hasUnrankedGames) {
        shames.push({
          name: user.name,
          action: 'has not ranked all game suggestions.'
        });  
      }
    });
    res.json({shames:shames});
  });
};


/**
 * Authentication callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};
