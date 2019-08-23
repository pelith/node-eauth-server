module.exports = function(app, eauthMiddleware, User, jwt) {
  app.get('/login', async (req, res) => {
    if (req.session.address) {
      res.redirect('/logout')
    } else {
      res.render('login')
    }
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
}
