'use strict';

const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  const OAuthClient = sequelize.define('OAuthClient', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    client_id: {
      type: DataTypes.STRING(80),
      unique: true,
    },
    client_secret: DataTypes.STRING(80),
    redirect_uri: DataTypes.STRING(2000),
    grant_types: DataTypes.STRING(80),
    scope: DataTypes.STRING
  },{
    tableName: 'oauth_clients',
    timestamps: false,
    underscored: true,
  });

  OAuthClient.associate = function(models) {
    // associations can be defined here
    OAuthClient.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return OAuthClient;
};
