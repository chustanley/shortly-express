const parseCookies = (req, res, next) => {


  console.log('------- check this out--->', req.get('Cookie'));

  // The reason why we have a cookie parser is because when the client (browser) recieves a res.cookies, it will be given an object. However, the browser will encode it in a weird way which javascript will not be able to read. Cookie parser just turns it back into readable data


  // one request made with no cookie
  // 1st res.cookie will tell browser to set this cookie
  // second request made with a cookie (the previous res.cookie)
  // 2nd res cookie will tell browser to set this cookie

  // now the third request res.cookie will have 2 key value properties.

  if (req.headers.cookie === undefined) {
    req.cookies = {};
    next();

  } else {


    var result = req.headers.cookie.split('; ').map((string) => {
      return string.split('=');
    }).reduce((accumulator, key) => {
      accumulator[key[0]] = key[1];
      return accumulator;
    }, {});


    req.cookies = result;
    next();


  }








};

module.exports = parseCookies;