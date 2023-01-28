const models = require('../models');
const Promise = require('bluebird');


module.exports.createSession = (req, res, next) => {




  if (req.cookies === undefined || Object.keys(req.cookies).length === 0) { //if no cookie on the request........

    console.log('-----req----->', res.co);


    models.Sessions.create() // WHY DO WE NEED RETURN HERE?????????
      .then((data) => {
        models.Sessions.get({'id': data.insertId})
          .then((sessionsRow) => {


            req.session = { //create a new session when there is no cookies on request.
              hash: sessionsRow.hash
            };


            res.cookies = { //create a new cookie EVERYTIME when a session is initialized.
              shortlyid: {
                value: sessionsRow.hash
              }
            };
            res.cookie('shortlyid', sessionsRow.hash);

            next();
          }).catch((err) => {
            next();
          });
      })
      .catch((err) => {
        next();
      });


  } else {

    console.log('----IM LOOKING FOR THIS--->', req);

    models.Sessions.get({hash: req.cookies.shortlyid})
      .then((currentSession) => {
        if (models.Sessions.isLoggedIn(currentSession)) {
          console.log(currentSession);
          req.session = currentSession;
          console.log(req.session);
        }
        next();
      })
      .catch((err) => {
        models.Sessions.create()
          .then((data) => {
            console.log(data);
            models.Sessions.get({id: data.insertId})
              .then((hash) => {
                console.log(hash.hash); // this is the hash
                req.session = {
                  hash: hash.hash
                };
                res.cookies = {
                  shortlyid: {
                    value: hash.hash
                  }
                };
                next(); // <----- this runs the first test
              })
              .catch((err) => {
                next();
              });
          })
          .catch((err) => {
            next();
          });
      });

  }

};







/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

