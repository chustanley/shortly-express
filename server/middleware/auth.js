const models = require('../models');
const Promise = require('bluebird');


module.exports.createSession = (req, res, next) => {

  //promise.resolve takes in anything really and starts off a .then chain!
  Promise.resolve(req.cookies.shortlyid)
    .then((hash) => {
      if (!hash) { // if the req.cookies.shortlyid is empty.
        throw hash;
      }
      return models.Sessions.get({hash: hash}); //if not empty, find the hash in sessions.
    })
    .then((session) => {

      if (!session) { //if checking session table and throws error
        throw session;
      }

      return session;
    })
    .catch(() => { // create a new session if any error occurs.

      return models.Sessions.create() // this will show the information with insertId
        .then((data) => {
          return models.Sessions.get({id: data.insertId});
        })
        .then((sessionInfo) => {
          // this .then is necessary because res.cookie needs it to happen inorder to get the shortlyid value from .then
          // another reason why res.cookie is here specifically is because when we create a session, we would have to also create the cookie but only when the session is created

          // check above, we are checking to see if cookies has a shortly id hash.
          // since it DOESNT. we will create one

          // but if it does WE SHOULDNT create one thats why this step is only in here because it should only happen when you are creating a new session.. which is because you HAVE NO COOKIES!

          // we should create a session everytime someone visits our page not only when someone signs in.
          res.cookie('shortlyid', sessionInfo.hash);
          return sessionInfo;
        });
    })
    .then((assignment) => {
      req.session = assignment;
      next();
    });

  // What is .tap ? its like .then but it doesnt pass anything on??
  // maybe its to only manippulate ones.. .then data and then move on.
  // tap can be replaced in line 29 and line 15.
  //32:00
};







/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

