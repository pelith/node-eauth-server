const async = require('async')
const Eauth = require('express-eauth')
const MobileDetect = require('mobile-detect')
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config.json')[env]

module.exports = function(app, api, User, jwt, ens) {
  const eauthTypedData = new Eauth({ banner: config.banner, prefix: config.messagePrefix })
  const eauthPersonal = new Eauth({ method: 'personal_sign', prefix: config.messagePrefix })

  async function eauthMiddleware(req, res, next) {
    let middleware = eauthTypedData
    const md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) middleware = eauthPersonal

    async.series([middleware.bind(null, req, res)], (err) => {
      return err ? next(err) : next()
    })
  }

  if (config.components.ui) {
    app.get('/', async (req, res) => {
      if (req.session.address) {
        res.redirect('/logout')
      } else if (!config.components.contract) {
        res.redirect('/login')
      } else {
        res.render('index')
      }
    })

    app.get('/login', async (req, res) => {
      if (req.session.address) {
        res.redirect('/logout')
      } else {
        res.render('login', { prefix: config.messagePrefix, useSocket: config.components.qrcode, useFortmatic: config.components.fortmatic })
      }
    })

    app.get('/logout', (req, res) => {
      if (req.session.address) {
        res.render('logout', { address: req.session.address })
      } else {
        res.redirect('/')
      }
    })
  }

  app.all('/api/logout', api, (req, res) => {
    req.session.destroy((err) => {
      let location = '/'
      if (req.body.url) location = req.body.url
      res.redirect(location)
    })
  })

  app.get('/api/user', api, (req, res) => {
    res.json({
      success: true,
      message: req.session.address,
    })
  })

  // return Address or Confirm Code or status 400
  app.get('/auth/:Address', eauthMiddleware, (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  // return Address or status 400
  app.post('/auth/:Message/:Signature', eauthMiddleware, (req, res) => {
    const address = req.eauth.recoveredAddress

    if (!address) res.status(400).send()
    else {
      User.findOrCreate({ where: { address: address } }).spread((eauth, created) => {
        const token = jwt.sign(eauth.get({ plain: true }), app.get('secret'), {
          expiresIn: config.sessionMinutes * 60 * 1000,
        })

        req.session.cookie.expires = config.sessionMinutes * 60 * 1000
        req.session.address_id = eauth.dataValues.id // database id // oauth use
        req.session.address = address
        req.session.token = token

        res.json({
          success: true,
          message: 'Eauth Success',
          token: token,
        })
      })
    }
  })
}
