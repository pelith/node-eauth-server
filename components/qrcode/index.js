module.exports = function(app, api, sequelizeStore, server){
  require('./qrcode')(app, api, sequelizeStore, server)
}