const parseCookies = (req, res, next) => {




  if (req.headers.cookie === undefined) {
    return;
  }


  req.headers.cookie.split('; ').map((string) => {
    return string.split('=');
  }).reduce((accumulator, key) => {
    accumulator[key[0]] = key[1];
    return accumulator;
  }, req.cookies);


  next();
};

module.exports = parseCookies;