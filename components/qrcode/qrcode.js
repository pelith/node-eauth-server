const cookieParser = require('socket.io-cookie-parser')

module.exports = function(app, api, sequelizeStore, server) {
  const io = require('socket.io')(server)

  io.use(cookieParser())
  io.on('connection', (socket) => {
    socket.emit('init', { session_id: socket.request.cookies['connect.sid'].substr(2, 32) })
    setTimeout(() => { socket.emit('refresh'); socket.disconnect(true); console.log('socket disconnect') }, 180000)
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
