module.exports = function(app, eauthContractMiddleware, User, jwt) {
  app.get('/contractLogin', async (req, res) => {
    if (req.session.address) {
      res.redirect('/logout')
    } else if (req.query.wallet) {
      res.render('contractLogin', { address: req.query.wallet })
    } else {
      res.render('contractInput')
    }
  })

  app.get('/customizedsign', async (req, res) => {
    if (req.session.address) {
      res.redirect('/logout')
    } else {
      res.render('customizedSign', { address: req.query.wallet })
    }
  })

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
            expiresIn: 60 * 15 * 1000, // session expire time deafault hardcode 15 min // SHOULD CONFIG
          })

          req.session.cookie.expires = 60 * 15 * 1000 // session expire time deafault hardcode 15 min // SHOULD CONFIG
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
            expiresIn: 60 * 15 * 1000, // session expire time deafault hardcode 15 min // SHOULD CONFIG
          })

          req.session.cookie.expires = 60 * 15 * 1000 // session expire time deafault hardcode 15 min // SHOULD CONFIG
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
