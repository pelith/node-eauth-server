const async = require('async')
const Eauth = require('express-eauth')
const jwt = require('jsonwebtoken')

const eauthTypedDataV4 = new Eauth({ method: 'eth_signTypedData_v4', banner: process.env.EAUTH_BANNER, prefix: process.env.EAUTH_MESSAGE_PREFIX })

module.exports = function(app, api, User, ens) {
  if (process.env.EAUTH_COMPONENTS_UI === 'true') {
    app.get('/', async (req, res) => {
      if (req.session.address) {
        const ens_name = ens ? await ens.reverse(req.session.address) : null

        res.render('logout', { address: req.session.address, ens: ens_name })
      } else if (process.env.EAUTH_COMPONENTS_CONTRACT !== 'true') {
        res.render('login', {
          isRoot: true,
          prefix: process.env.EAUTH_MESSAGE_PREFIX,
          useSocket: process.env.EAUTH_COMPONENTS_QRCODE === 'true',
          useFortmatic: process.env.EAUTH_COMPONENTS_FORTMATIC === 'true',
          useWalletConnect: process.env.EAUTH_COMPONENTS_WALLETCONNECT === 'true',
        })
      } else {
        res.render('index', { isRoot: true })
      }
    })

    app.get('/login', async (req, res) => {
      if (req.session.address) {
        res.redirect('/')
      } else {
        res.render('login', {
          prefix: process.env.EAUTH_MESSAGE_PREFIX,
          useSocket: process.env.EAUTH_COMPONENTS_QRCODE === 'true',
          useFortmatic: process.env.EAUTH_COMPONENTS_FORTMATIC === 'true',
          useWalletConnect: process.env.EAUTH_COMPONENTS_WALLETCONNECT === 'true',
        })
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
  app.get('/auth/:Address', eauthTypedDataV4, (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  // return Address or status 400
  app.post('/auth/:Message/:Signature', eauthTypedDataV4, (req, res) => {
    const address = req.eauth.recoveredAddress

    if (!address) res.status(400).send()
    else {
      User.findOrCreate({ where: { address: address } }).spread((eauth, created) => {
        const token = jwt.sign(eauth.get({ plain: true }), app.get('secret'), {
          expiresIn: parseInt(process.env.EAUTH_SESSION_TIMEOUT),
        })

        req.session.cookie.expires = parseInt(process.env.EAUTH_SESSION_TIMEOUT)
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
