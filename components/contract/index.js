module.exports = function(app, User, jwt, ens){
    require('./contract')(app, User, jwt, ens)
}