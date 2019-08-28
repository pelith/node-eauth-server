const oauthServer = require('oauth2-server')
const Request = oauthServer.Request
const Response = oauthServer.Response
const async = require('async')
const util = require('util')
const authenticate = require('./authenticate')

// initalize database
const db = require('./models')
const OAuthClient = db.OAuthClient

// initalize oauth2 server
const oauth = require('./oauth')

// ENS HOOK
const env = process.env.NODE_ENV || 'development'
const config = require('./config/config.json')[env]

module.exports = function(app, api, User, ens) {
  // only private can get
  app.get('/oauth/user', authenticate(), async function(req, res) {
    // ENS HOOK
    let ens_name = null
    if (config.components.ens) {
      try {
        const reverse_name = await ens.reverse(req.user.User.address).name()
        const name = await ens.resolver(reverse_name).addr()

       // Check to be sure the reverse record is correct.
        if (req.user.User.address.toLowerCase() == name.toLowerCase())
          ens_name = reverse_name
      } catch (e) {
        console.log(e)
      }
    }

    return ens_name ? res.json(Object.assign(req.user.User, {ens: ens_name})) : res.json(req.user.User)
  })

  app.all('/oauth/token', function(req,res,next) {
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
          address: req.session.address
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