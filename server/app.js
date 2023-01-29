const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');

const cookieParser = require('./middleware/cookieParser.js');
const session = require('./middleware/auth.js');

const models = require('./models');
const db = require('./db');
const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.use(cookieParser); //this works

app.use(Auth.createSession);



app.get('/',
  (req, res) => {
    if (req.headers.cookie === undefined) {
      res.redirect('login');
    }
    res.render('index');
  });


app.get('/create',
  (req, res) => {
    if (req.headers.cookie === undefined) {
      res.redirect('login');
    }
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    if (req.headers.cookie === undefined) {
      res.redirect('login');
    }
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/


app.get('/signup', (req, res, next) => {
  res.render('signup');
});

app.get('/login', (req, res, next) => {
  res.render('login');
});


app.get('/logout', (req, res, next) => {

  console.log('--------logout---------->', req.headers);

  // get the id number from req.headers. which we did

  // check if present on the sessions table.

  // if present? then.. delete

  // reorganize cookies?


  models.Sessions.get({hash: req.headers.cookie.split('=')[1]})
    .then((sessionRow) => {
      // console.log('-------------session row------>', sessionRow);

      if (!sessionRow) {
        throw sessionRow;
      } else {
        return sessionRow;
      }
    })
    .then((deletingSession) => {
      return models.Sessions.delete({hash: deletingSession.hash});
    })
    .then(() => {
      res.redirect('/signup');
    })
    .catch();


  next();
});


app.post('/signup', (req, res, next) => {

  var username = req.body.username; // recieved as input from the page
  var password = req.body.password; // recieved as input from the page

  models.Users.get({username})
    .then((user) => {
      if (user) { // that means user already exist so we should send them back and make them signup again
        throw user;
      } else {
        return models.Users.create({username, password});
      }
    })
    .then((newUser) => { // associating a session location down below with a specific userID!!!
      return models.Sessions.update({hash: req.session.hash}, {userId: newUser.insertId});
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(() => {
      res.redirect('/signup');
    });
  // models.Users.create(req.body)
  //   .then((data) => {
  //     res.redirect('/');
  //   })
  //   .catch((err) => {
  //     res.redirect('/signup');
  //   });

});


app.post('/login', (req, res, next) => {

  console.log(req.body.username); //comment

  models.Users.get({username: req.body.username}) //retrieving the row where username: username
    .then((data) => {
      //Sucessfull or fail, it will end up here.
      //Success: show row of data in object form
      //Fail: undefined
      // console.log('------->', data);

      if (data === undefined) { //if the username is not in signup.
        res.redirect('/login');
      } else {


        if (models.Users.compare(req.body.password, data.password, data.salt)) { // this returns boolean
          res.redirect('/');
        } else {
          res.redirect('/login');
        }

      }
    }).catch((err) => {
      throw err;
    });
});





/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
