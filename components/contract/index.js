module.exports = function(config, app, User, jwt, Eauth, async, MobileDetect, ens){
    require('./contract')(config, app, User, jwt, Eauth, async, MobileDetect, ens)
}