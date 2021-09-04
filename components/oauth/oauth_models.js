// initalize database
const _ = require('lodash');
const db = require('./models');
const User = db.User
const OAuthClient = db.OAuthClient;
const OAuthAuthorizationCode = db.OAuthAuthorizationCode;
const OAuthAccessToken = db.OAuthAccessToken;
const OAuthRefreshToken = db.OAuthRefreshToken;

async function initalize(){
  await OAuthClient.sync();
  await OAuthAuthorizationCode.sync({force: true});
  await OAuthAccessToken.sync({force: true});
  await OAuthRefreshToken.sync({force: true});
};
initalize();

function getAuthorizationCode(code) {
  return OAuthAuthorizationCode
    .findOne({
      attributes: ['client_id', 'expires', 'user_id', 'scope'],
      where: {authorization_code: code},
      include: [User, OAuthClient]
    })
    .then(function (authCodeModel) {
      if (!authCodeModel) return false;
      const client = authCodeModel.OAuthClient.toJSON()
      var user = authCodeModel.User.toJSON()
      
      return reCode = {
        code: code,
        client: client,
        expiresAt: authCodeModel.expires,
        redirectUri: client.redirect_uri,
        user: user,
        scope: authCodeModel.scope,
      };
    }).catch(function (err) {
      console.log("getAuthorizationCode - Err: ", err)
    });
};

function saveAuthorizationCode(code, client, user) {
  return OAuthAuthorizationCode
    .create({
      expires: code.expiresAt,
      client_id: client.id,
      authorization_code: code.authorizationCode,
      user_id: user.id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode
      return code
    }).catch(function (err) {
      console.log("saveAuthorizationCode - Err: ", err)
    });
};

function revokeAuthorizationCode(code) {
  return OAuthAuthorizationCode.findOne({
    where: {
      authorization_code: code.code
    }
  }).then(function (rCode) {
    // console.log(rCode)
    // if(rCode) rCode.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredCode = code
    expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredCode
  }).catch(function (err) {
    console.log("getUser - Err: ", err)
  });
}

function getClient(clientId, clientSecret) {
  const options = {
    where: {client_id: clientId},
    attributes: ['id', 'client_id', 'redirect_uri', 'scope'],
  };

  if (clientSecret) options.where.client_secret = clientSecret;

  return OAuthClient
    .findOne(options)
    .then(function (client) {
      if (!client) return new Error("client not found");
      var clientWithGrants = client.toJSON()
      clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials']
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
      delete clientWithGrants.redirect_uri
      //clientWithGrants.refreshTokenLifetime = integer optional
      //clientWithGrants.accessTokenLifetime  = integer optional
      return clientWithGrants
    }).catch(function (err) {
      console.log("getClient - Err: ", err)
    });
}

function getAccessToken(bearerToken) {
  return OAuthAccessToken
    .findOne({
      where: {access_token: bearerToken},
      attributes: [['access_token', 'accessToken'], ['expires', 'accessTokenExpiresAt'],'scope'],
      include: [
        {
          model: User,
          attributes: ['id', 'address'],
        }, OAuthClient
      ],
    })
    .then(function (accessToken) {
      if (!accessToken) return false;
      var token = accessToken.toJSON();
      token.accessTokenExpiresAt = new Date(token.accessTokenExpiresAt);
      token.user = token.User;
      token.client = token.OAuthClient;
      token.scope = token.scope
      return token;
    })
    .catch(function (err) {
      console.log("getAccessToken - Err: ")
    });
}

function saveToken(token, client, user) {
  return Promise.all([
      OAuthAccessToken.create({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        client_id: client.id,
        user_id: user.id,
        scope: token.scope
      }),
      token.refreshToken ? OAuthRefreshToken.create({ // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        client_id: client.id,
        user_id: user.id,
        scope: token.scope
      }) : [],

    ])
    .then(function (resultsArray) {
      return _.assign(  // expected to return client and user, but not returning
        {
          client: client,
          user: user,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken, // proxy
        },
        token
      )
    })
    .catch(function (err) {
      console.log("revokeToken - Err: ", err)
    });
}

module.exports = {
  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,
  getClient,
  getAccessToken,
  saveToken,
}
