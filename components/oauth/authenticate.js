const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
var oauth = require('./oauth')

module.exports = function(options){
  var options = options || {};
  return function(req, res, next) {
    var request = new Request({
      headers: {authorization: req.headers.authorization},
      method: req.method,
      query: req.query,
      body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response, options)
      .then(function (token) {
        // Request is authorized.
        req.user = token
        next()
      })
      .catch(function (err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err)
      });
  }
}