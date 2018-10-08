// load dependencies
const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const EthAuth = require('node-eth-auth');

// 
const ethAuth = new EthAuth({"banner": "Pelith"});

// 
const env = process.env.NODE_ENV || 'development';

const app = express();

// load config
const config = require(__dirname + '/config/config.json')[env];

// issue, dev
app.set('secret', config.secret)

// initalize database
const db = require('./models');

const Ethauth = db['Ethauth'];
const Session = db['Session'];

// creat if not exist
Ethauth.sync({force: true});
Session.sync({force: true});

// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store);

app.use(session({
  secret: app.get('secret'),
  store: new SequelizeStore({
    db: db.sequelize
  }),
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// LOG
app.use(morgan('dev'))

// return Address or Confirm Code or status 400
app.get('/api/auth/:Address', ethAuth, (req, res) => { 
    req.ethAuth.message ? res.send(req.ethAuth.message) : res.status(400).send();
});

// return Address or status 400
app.post('/api/auth/:Message/:Signature', ethAuth, (req, res) => { 
  const address = req.ethAuth.recoveredAddress;
    if (!address) 
    res.status(400).send();
  else {
    Ethauth.findOrCreate({ where: {"address": address} }).spread( (ethauth,created) => {
      var token = jwt.sign(ethauth.get({ plain: true }), app.get('secret'), {
        expiresIn: 60*60*24
      })

      req.session.cookie.expires = 60*60*24;
      req.session.address = address;
      req.session.token = token;

      res.json({
        success: true,
        message: 'EthAuth Success',
        token: token
      })
    });
  }
});

const api = express.Router();

app.use('/', express.static('./views/'));

// api middleware
api.use(function (req, res, next) {
  var token = req.session.token;
  if (token) {
    jwt.verify(token, app.get('secret'), function (err, decoded) {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token.'})
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    return res.send({
      success: false,
      message: 'No token provided.'
    })
  }
});

// api test 
app.use('/api/testapi', api, (req, res) => {
    res.send({
      success: true,
      message: 'hello, '+req.session.address
    })
});

// api reset
app.use('/api/reset', api, (req, res) => {
  req.session.destroy((err)=>{
    res.send({
      success: true,
      message: 'Reset!'
    })
  });
});

var listener = app.listen( process.env.PORT || 8080, () => {
  console.log('Listening on port ' + listener.address().port)
})