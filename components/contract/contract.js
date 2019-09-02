const async = require('async')
const Eauth = require('express-eauth')
const jwt = require('jsonwebtoken')
const MobileDetect = require('mobile-detect')
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config.json')[env]

const eauthContractTypedData = new Eauth({ banner: config.banner, method: 'wallet_validation_typedData', prefix: config.messagePrefix, rpc: config.rpcURL })
const eauthContractPersonal = new Eauth({ method: 'wallet_validation_personal', prefix: config.messagePrefix, rpc: config.rpcURL })
const eauthContractCustomizedSign = new Eauth({ method: 'wallet_validation', prefix: config.messagePrefix, rpc: config.rpcURL })

async function contractMiddleware(req, res, next) {
  let middleware = eauthContractTypedData
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile()) middleware = eauthContractPersonal

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

module.exports = function(app, User, ens) {
  if (config.components.ui) {
    app.get('/contractLogin', async (req, res) => {
      if (req.session.address) {
        res.redirect('/')
      } else if (req.query.wallet) {
        let address = req.query.wallet
        if (/.*\.eth$/.test(req.query.wallet)) {
          if (config.components.ens && ens) {
            address = await ens.resolver(req.query.wallet).addr().catch((err) => {
              console.log(err)
              return false
            })
          }
          else
            address = null
        }

        if (address)
          res.render('contractLogin', { address: address, prefix: config.messagePrefix, useSocket: config.components.qrcode, useFortmatic: config.components.fortmatic })
        else {
          res.render('contractInput', { error: `'${req.query.wallet}' is not valid` })
        }
      } else {
        res.render('contractInput')
      }
    })

    app.get('/customizedsign', async (req, res) => {
      if (req.session.address) {
        res.redirect('/')
      } else {
        res.render('customizedSign', { address: req.query.wallet, prefix: config.messagePrefix })
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
  })

  // return Address or Confirm Code or status 400
  app.get('/auth/contract/:Contract', eauthWrapper(), (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  // return Address or status 400
  app.post('/auth/contract/:Message/:Signature', eauthWrapper(), (req, res) => {
    const recoveredAddress = req.eauth.recoveredAddress
    Promise.resolve(recoveredAddress)
    .then((address) => {
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
  })
}
