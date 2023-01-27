const models = require('../models');
const Promise = require('bluebird');
const db = require('../db');

module.exports.createSession = (req, res, next) => { // is going to be ran as app.use in the app.js

};

/*

1. accesses the parsed cookies on the request

2. looks up the user data related to that session

3. assigns an object to a session property on the request that contains relevant user information.

*/

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

