'use strict';

module.exports = (sequelize, DataTypes) => {
  var Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING(32),
      primaryKey: true,
    },
    data: DataTypes.STRING(2000),
    expires: DataTypes.DATE
  }, {
    tableName: 'session', 
    timestamps: false,
    underscored: true,
  });

  Session.associate = function(models) {
    // associations can be defined here
  };
  return Session;
};
