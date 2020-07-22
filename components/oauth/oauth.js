const oauthServer = require('oauth2-server');

var oauth = new oauthServer({
  model: require('./oauth_models.js'),
  debug: true
})

module.exports = oauth;