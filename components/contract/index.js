module.exports = function(config, app, User, jwt, Eauth, async, MobileDetect){
    require('./contract')(config, app, User, jwt, Eauth, async, MobileDetect)
}