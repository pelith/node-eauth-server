const async = require('async')
const OAuthDB = require('./models')

const { User, OAuthClient } = OAuthDB

async function initialize() {
  try {
    await User.sync()
    await OAuthClient.sync()
    if (process.env.EAUTH_CLIENT_NAME && process.env.EAUTH_CLIENT_ID && process.env.EAUTH_CLIENT_SECRET && process.env.EAUTH_REDIRECT_URI) {
      await OAuthClient.findOrCreate({
        where: {
          name: process.env.EAUTH_CLIENT_NAME,
          client_id: process.env.EAUTH_CLIENT_ID,
          client_secret: process.env.EAUTH_CLIENT_SECRET,
          redirect_uri: process.env.EAUTH_REDIRECT_URI,
        },
        defaults: {
          grant_types: null,
          scope: null,
        },
      })
    }
  } catch (e) {
    console.error(e)

    setTimeout(() => {
      initialize()
    }, 5000)
  }
}
initialize()

module.exports = function(app, api, User, ens){
  require('./express')(app, api, User, ens)
}