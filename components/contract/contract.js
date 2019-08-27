const async = require('async')
const Eauth = require('express-eauth')
const MobileDetect = require('mobile-detect')
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config.json')[env]

module.exports = function(app, User, jwt, ens) {
  const eauthContractTypedData = new Eauth({ banner: config.banner, method: 'wallet_validation_typedData', prefix: config.messagePrefix, rpc: config.rpcURL })
  const eauthContractPersonal = new Eauth({ method: 'wallet_validation_personal', prefix: config.messagePrefix, rpc: config.rpcURL })
  const eauthContract = new Eauth({ method: 'wallet_validation', prefix: config.messagePrefix, rpc: config.rpcURL })

  async function eauthContractMiddleware(req, res, next) {
    let middleware = eauthContractTypedData
    const md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) middleware = eauthContractPersonal
    if (req.path.includes('customizedsign')) middleware = eauthContract

    async.series([middleware.bind(null, req, res)], (err) => {
      return err ? next(err) : next()
    })
  }

  if (config.components.ui) {
    app.get('/contractLogin', async (req, res) => {
      if (req.session.address) {
        res.redirect('/logout')
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
        res.redirect('/logout')
      } else {
        res.render('customizedSign', { address: req.query.wallet, prefix: config.messagePrefix })
      }
    })
  }

  app.get('/customizedsign/:Contract', eauthContractMiddleware, async (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  app.post('/customizedsign/:Message/:Signature', eauthContractMiddleware, async (req, res) => {
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
  app.get('/auth/contract/:Contract', eauthContractMiddleware, (req, res) => {
    return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
  })

  // return Address or status 400
  app.post('/auth/contract/:Message/:Signature', eauthContractMiddleware, (req, res) => {
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
