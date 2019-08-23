module.exports = function(app, api, sequelizeStore, io) {
  // api logout
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

  app.get('/api/qrcode', api, async (req, res) => {
    // set session to logined
    if (req.query.session_id && req.query.socket_id) {
      if (await sequelizeStore.get(req.query.session_id)) {
        await sequelizeStore.set(req.query.session_id, req.session)
      }
      // emit loggin message
      const socket = io.clients().sockets[req.query.socket_id]
      if (socket) await socket.emit('refresh')
    }

    // clean client session
    res.redirect('/api/logout')
  })
}
