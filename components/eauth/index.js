module.exports = function(app, api, User, ens){
  require('./eauth')(app, api, User, ens)
}