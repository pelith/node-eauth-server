const async = require('async')
const Eauth = require('express-eauth')
const jwt = require('jsonwebtoken')
const MobileDetect = require('mobile-detect')
const ethers = require('ethers')
const ENS = require('../ens')

const httpProvider = new ethers.providers.JsonRpcProvider(process.env.EAUTH_RPC_URL)
const ens = new ENS()
const eauthTypedData = new Eauth({ banner: process.env.EAUTH_BANNER, prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX) })
const eauthPersonal = new Eauth({ method: 'personal_sign', prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX) })

async function eauthMiddleware(req, res, next) {
  let middleware = eauthTypedData
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile() || req.headers['user-target'] == 'WalletConnect') middleware = eauthPersonal

  async.series([middleware.bind(null, req, res)], (err) => {
    return err ? next(err) : next()
  })
}

module.exports = function(app, api, User) {
  if (process.env.EAUTH_COMPONENTS_UI === 'true') {
    app.get('/', async (req, res) => {
      if (req.session.address) {
        res.render('logout', { address: req.session.address, ens: req.session.ens })
      } else {
        res.render('index', { isRoot: true })
      }
    })

    app.get('/login', async (req, res) => {
      if (req.query.ens && /.*\.eth$/.test(req.query.ens)) {
        req.session.ens = req.query.ens
      }
    
      if (req.session.ens && !req.session.address) {
        const address = await ens.reverseName(req.session.ens)
        if (address)
          return res.render('login', {
            address: address,
            ens: req.session.ens,
            prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX),
            useSocket: process.env.EAUTH_COMPONENTS_QRCODE,
            useFortmatic: process.env.EAUTH_COMPONENTS_FORTMATIC,
            useWalletConnect: process.env.EAUTH_COMPONENTS_WALLETCONNECT,
          })
      }

      if (req.query.url === undefined) {
        return res.redirect('/')
      } else {
        return res.redirect('/?url=' + encodeURIComponent(req.query.url))
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

  app.post('/ens/:ENS_NAME', async (req, res) => {
    const ens_name = req.params['ENS_NAME']
    const address = await ens.reverseName(ens_name)
    if (!/.*\.eth$/.test(ens_name) || !address) {
      req.session.ens = null
      res.json({
        success: false,
        message: 'Not a valid ENS.',
      })
    }

    const code = await httpProvider.getCode(address)
    req.session.ens = ens_name
    res.json({
      success: true,
      isContract: !!code.slice(2),
    })
  })

  // return Address or Confirm Code or status 400
  app.get('/auth/:Address', eauthMiddleware, (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  // return Address or status 400
  app.post('/auth/:Message/:Signature', eauthMiddleware, async (req, res) => {
    const address = req.eauth.recoveredAddress

    if (!address) res.status(400).send()
    else {
      const ens_name = req.session.ens
      const ens_address = await ens.reverseName(ens_name)

      if (!!ens_address && address.toLowerCase() == ens_address.toLowerCase()) {
        User.findOrCreate({ where: { ens: ens_name } }).spread((eauth, created) => {
          const token = jwt.sign(eauth.get({ plain: true }), app.get('secret'), {
            expiresIn: parseInt(process.env.EAUTH_SESSION_TIMEOUT),
          })

          req.session.cookie.expires = parseInt(process.env.EAUTH_SESSION_TIMEOUT)
          req.session.address_id = eauth.dataValues.id // database id // oauth use
          req.session.address = address
          req.session.token = token

          res.json({
            success: true,
            token: token,
          })
        })
      }
      else {
        res.json({
          success: false,
        })
      }
    }
  })
}
