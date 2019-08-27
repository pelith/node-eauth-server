module.exports = function(config, app, api, User, jwt, Eauth, async, MobileDetect){
    require('./eauth')(config, app, api, User, jwt, Eauth, async, MobileDetect)
}