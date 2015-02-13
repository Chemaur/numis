'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	User = require('mongoose').model('User'),
	path = require('path'),
	config = require('./config'),
	userProfileHandler = require('../app/controllers/users/users.profile.server.controller.js');

/**
 * Module init function.
 */
module.exports = function() {
	// Serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
		User.findOne({
			_id: id
		}, '-salt -password', function(err, user) {
			done(err, user);
		});
	});

	// Initialize strategies
	// config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
	// 	   require(path.resolve(strategy))();
	// });
	require(path.resolve('./config/strategies/local.js'))();
};