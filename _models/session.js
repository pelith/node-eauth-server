'use strict';
module.exports = (sequelize, DataTypes) => {
  var Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    expires: DataTypes.DATE,
    data: DataTypes.TEXT
  }, {});
  Session.associate = function(models) {
    // associations can be defined here
  };
  return Session;
};