'use strict';
module.exports = (sequelize, DataTypes) => {
  var Ethauth = sequelize.define('Ethauth', {
    address: DataTypes.STRING,
    refer: DataTypes.INTEGER
  }, {});
  Ethauth.associate = function(models) {
    // associations can be defined here
  };
  return Ethauth;
};