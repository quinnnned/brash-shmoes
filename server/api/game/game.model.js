'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
    name      : String
  , igdb_id   : Number
  , user      : {type: Schema.ObjectId, ref: 'User' }
  , cover     : String
});

module.exports = mongoose.model('Game', GameSchema);