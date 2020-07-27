const oauthServer = require('oauth2-server')
const Request = oauthServer.Request
const Response = oauthServer.Response
const async = require('async')
const util = require('util')
const authenticate = require('./authenticate')
const ENS = require('../ens')

// initalize database
const db = require('./models')
const OAuthClient = db.OAuthClient

// initalize oauth2 server
const oauth = require('./oauth')
const ens = new ENS()

module.exports = function(app, api, User) {
  // only private can get
  app.get('/oauth/user', authenticate(), async function(req, res) {
    const ens_name = req.user.User.ens
    const ens_address = await ens.reverseName(ens_name)
    return ens_name ? res.json(Object.assign(req.user.User, {ens: ens_name, address: ens_address})) : res.json(req.user.User)
  })

  app.all('/oauth/token', function(req, res, next) {
    const request = new Request(req)
    const response = new Response(res)

    oauth.token(request,response).then(function(token) {
      return res.json({
        access_token: token.access_token,
        token_type: 'bearer',
        expires_in: 7200,
        refresh_token: token.refresh_token
      })
    }).catch(function(err){
      return res.status(500).json(err)
    })
  })

  app.get('/oauth/authorize', api, function(req, res) {
    return OAuthClient.findOne({
        where: {
          client_id: req.query.client_id,
          redirect_uri: req.query.redirect_uri,
        },
        attributes: ['id', 'name'],
      }).then(function(model) {
        if (!model) return res.status(404).json({ error: 'Invalid Client' })
        
        return res.render('authorise', {
          client_id: req.query.client_id,
          redirect_uri: req.query.redirect_uri,
          address: req.session.address,
          ens: req.session.ens,
        })
      }).catch(function(err){
        return res.status(err.code || 500).json(err)
      })
  })

  app.post('/oauth/authorize', api, function(req, res) {
    const request = new Request(req)
    const response = new Response(res)
    const address_id = req.session.address_id
    req.session.destroy()

    const options = {
      authenticateHandler: {
        handle: (data) => {
          // Whatever you need to do to authorize / retrieve your user from post data here
          return {id: address_id}
        }
      }
    }

    return oauth.authorize(request, response, options).then(function(success) {
      return res.redirect(util.format('%s?code=%s&state=%s', request.query.redirect_uri, success.code, request.query.state))
    }).catch(function(err){
      res.status(err.code || 500).json(err)
    })
  })
}