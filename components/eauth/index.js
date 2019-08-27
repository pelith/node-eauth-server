module.exports = function(config, app, api, User, jwt, Eauth, async, MobileDetect, ens){
    require('./eauth')(config, app, api, User, jwt, Eauth, async, MobileDetect, ens)
}