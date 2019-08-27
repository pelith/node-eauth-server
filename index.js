const express = require('express')
const path = require('path')
const util = require('util')
const session = require('express-session')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const async = require('async')
// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const env = process.env.NODE_ENV || 'development'

const app = express()
const server = require('http').Server(app)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// LOG
if (app.get('env') === 'development') app.use(morgan('dev'))

const config = require('./config/config.json')[env]
let ens = null
try {
  const ENS = require('ethereum-ens')
  const Web3 = require('web3')
  const provider = new Web3.providers.HttpProvider(config.rpcURL)
  ens = new ENS(provider)
} catch (err) {
  console.log('ens disabled')
}

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

app.use(express.static(path.join(__dirname, 'public')))

function apiMiddleware(req, res, next) {
  const { token } = req.session

  // auth destroy
  
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

const api = express.Router()
// api middleware
api.use(apiMiddleware)

require('./components/eauth')(app, api, User, jwt, ens)

if (config.components.contract)
  require('./components/contract')(app, User, jwt, ens)

if (config.components.oauth)
  require('./components/oauth')(app, apiMiddleware, User, ens)

if (config.components.qrcode)
  require('./components/qrcode')(app, api, sequelizeStore, server)

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
