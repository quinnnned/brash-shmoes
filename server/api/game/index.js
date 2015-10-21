'use strict';

var express = require('express');
var controller = require('./game.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();


// IGDB Routes //
router.get('/search', auth.isAuthenticated(), controller.search);
router.get('/search/:id', auth.isAuthenticated(), controller.detail);

// User Ranking //
router.post('/rank', auth.isAuthenticated(), controller.rank);

router.get('/group', auth.isAuthenticated(), controller.getGroupRankings);
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);

// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;