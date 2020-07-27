const async = require('async')
const Eauth = require('express-eauth')
const jwt = require('jsonwebtoken')
const MobileDetect = require('mobile-detect')
const ENS = require('../ens')

const ens = new ENS()
const eauthContractTypedData = new Eauth({ banner: process.env.EAUTH_BANNER, method: 'wallet_validation_typedData', prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX), rpc: process.env.EAUTH_RPC_URL })
const eauthContractPersonal = new Eauth({ method: 'wallet_validation_personal', prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX), rpc: process.env.EAUTH_RPC_URL })
const eauthContractCustomizedSign = new Eauth({ method: 'wallet_validation', prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX), rpc: process.env.EAUTH_RPC_URL })

async function contractMiddleware(req, res, next) {
  let middleware = eauthContractTypedData
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile() || req.headers['user-target'] == 'WalletConnect') middleware = eauthContractPersonal

  async.series([middleware.bind(null, req, res)], (err) => {
    return err ? next(err) : next()
  })
}

async function customizedSignMiddleware(req, res, next) {
  async.series([eauthContractCustomizedSign.bind(null, req, res)], (err) => {
    return err ? next(err) : next()
  })
}

function eauthWrapper(customizedsign = false) {
  if (customizedsign)
    return customizedSignMiddleware
  else
    return contractMiddleware
}

module.exports = function(app, User) {
  if (process.env.EAUTH_COMPONENTS_UI === 'true') {
    app.get('/contractLogin', async (req, res) => {
      if (req.query.ens && /.*\.eth$/.test(req.query.ens)) {
        req.session.ens = req.query.ens
      }

      if (req.session.ens && !req.session.address) {
        const address = await ens.reverseName(req.session.ens)
        if (address)
          return res.render('contractLogin', {
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

    app.get('/customizedsign', async (req, res) => {
      if (req.query.ens && /.*\.eth$/.test(req.query.ens)) {
        req.session.ens = req.query.ens
      }

      if (req.session.ens && !req.session.address) {
        const address = await ens.reverseName(req.session.ens)
        if (address)
          return res.render('customizedSign', { address: address, ens: req.session.ens, prefix: decodeURI(process.env.EAUTH_MESSAGE_PREFIX) })
      }

      if (req.query.url === undefined) {
        return res.redirect('/')
      } else {
        return res.redirect('/?url=' + encodeURIComponent(req.query.url))
      }
    })
  }

  app.get('/customizedsign/:Contract', eauthWrapper(true), async (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  app.post('/customizedsign/:Message/:Signature', eauthWrapper(true), async (req, res) => {
    const recoveredAddress = req.eauth.recoveredAddress
    Promise.resolve(recoveredAddress)
    .then((address) => {
      if (!address) res.status(400).send()
      else {
        User.findOrCreate({ where: { ens: req.session.ens } }).spread((eauth, created) => {
          const token = jwt.sign(eauth.get({ plain: true }), app.get('secret'), {
            expiresIn: process.env.EAUTH_SESSION_TIMEOUT,
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
  })

  // return Address or Confirm Code or status 400
  app.get('/auth/contract/:Contract', eauthWrapper(), (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  // return Address or status 400
  app.post('/auth/contract/:Message/:Signature', eauthWrapper(), (req, res) => {
    const recoveredAddress = req.eauth.recoveredAddress
    Promise.resolve(recoveredAddress)
    .then(async (address) => {
      if (!address) res.status(400).send()
      else {
        const ens_address = await ens.reverseName(req.session.ens)

        if (!!ens_address && address.toLowerCase() == ens_address.toLowerCase()) {
          User.findOrCreate({ where: { ens: req.session.ens } }).spread((eauth, created) => {
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
        } else {
            res.json({
              success: false,
              message: 'Eauth Failed',
            })
        }
      }
    })
  })
}
