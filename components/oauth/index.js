const db = require('./models')

const { OAuthClient } = db

async function initalize() {
  await OAuthClient.sync()
  if (process.env.EAUTH_CLIENT_NAME && process.env.EAUTH_CLIENT_ID && process.env.EAUTH_CLIENT_SECRET && process.env.EAUTH_REDIRECT_URI) {
    await OAuthClient.findOrCreate({
      where: {
        name: process.env.EAUTH_CLIENT_NAME,
        client_id: process.env.EAUTH_CLIENT_ID,
        client_secret: process.env.EAUTH_CLIENT_SECRET,
        redirect_uri: process.env.EAUTH_REDIRECT_URI,
      },
    })
  }
}
initalize()

module.exports = function(app, api, User, ens){
  require('./express')(app, api, User, ens)
}