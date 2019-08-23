const express = require('express')
const path = require('path')
const util = require('util')
const session = require('express-session')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const Eauth = require('express-eauth')
const async = require('async')
const MobileDetect = require('mobile-detect')
const cookieParser = require('socket.io-cookie-parser')
// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const env = process.env.NODE_ENV || 'development'

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// LOG
if (app.get('env') === 'development') app.use(morgan('dev'))

const config = require('./config/config.json')[env]

// issue, dev // maybe add salt with secret
app.set('secret', config.secret)

// initalize database
const db = require('./models')

const { User, Session } = db

// creat database if not exist // if force == true : drop table
async function initalize() {
  await User.sync()
  await Session.sync({ force: true })
}
initalize()

const sequelizeStore = new SequelizeStore({
  db: db.sequelize,
  table: 'Session',
})

app.use(session({
  secret: app.get('secret'),
  store: sequelizeStore,
  resave: false,
  saveUninitialized: true,
}))

// Add body parser.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// eauth
const eauthTypedData = new Eauth({ banner: config.banner, prefix: config.message_prefix })
const eauthPersonal = new Eauth({ method: 'personal_sign', prefix: config.message_prefix })
const eauthContractTypedData = new Eauth({ banner: config.banner, method: 'wallet_validation_typedData', prefix: config.message_prefix, rpc: config.rpcURL })
const eauthContractPersonal = new Eauth({ method: 'wallet_validation_personal', prefix: config.message_prefix, rpc: config.rpcURL })
const eauthContract = new Eauth({ method: 'wallet_validation', prefix: config.message_prefix, rpc: config.rpcURL })

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  if (req.session.address) {
    res.redirect('/logout')
  } else {
    res.render('index')
  }
})

app.get('/logout', (req, res) => {
  res.render('logout', { address: req.session.address })
})

// for development
app.get('/authorize', (req, res) => {
  res.render('authorise', { address: req.session.address })
})

io.use(cookieParser())
io.on('connection', (socket) => {
  socket.emit('init', { session_id: socket.request.cookies['connect.sid'].substr(2, 32) })
  setTimeout(() => { socket.emit('refresh'); socket.disconnect(true); console.log('socket disconnect') }, 180000)
})

async function eauthMiddleware(req, res, next) {
  let middleware = eauthTypedData
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile()) middleware = eauthPersonal

  async.series([middleware.bind(null, req, res)], (err) => {
    return err ? next(err) : next()
  })
}

require('./routes/eauth')(app, eauthMiddleware, User, jwt)

async function eauthContractMiddleware(req, res, next) {
  let middleware = eauthContractTypedData
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile()) middleware = eauthContractPersonal
  if (req.path.includes('customizedsign')) middleware = eauthContract

  async.series([middleware.bind(null, req, res)], (err) => {
    return err ? next(err) : next()
  })
}

require('./routes/contract')(app, eauthContractMiddleware, User, jwt)

function apiMiddleware(req, res, next) {
  const { token } = req.session

  if (token) {
    // issue case: after server restart will pass verify cond,but token is expire, maybe should check database
    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' })
      }

      req.decoded = decoded
      return next()
    })
  } else {
    const url = req.url ? util.format('/?url=%s', encodeURIComponent(req.url)) : '/'
    res.redirect(url)
  }
}

// oauth server # todo: make it optional
require('./components/oauth')(app, apiMiddleware)

const api = express.Router()
// api middleware
api.use(apiMiddleware)
require('./routes/api')(app, api, sequelizeStore, io)

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  })
})

const listener = server.listen(process.env.PORT || 8080, () => {
  console.log('Listening on port ' + listener.address().port)
})
