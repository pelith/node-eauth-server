'use strict';

module.exports = (sequelize, DataTypes) => {
  const OAuthAccessToken = sequelize.define('OAuthAccessToken', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    access_token: DataTypes.STRING(256),
    expires: DataTypes.DATE,
    scope: DataTypes.STRING
  }, {
    tableName: 'oauth_access_tokens',
    timestamps: false,
    underscored: true,
  });
  
  OAuthAccessToken.associate = function(models) {
    // associations can be defined here
    OAuthAccessToken.belongsTo(models.OAuthClient, {
      foreignKey: 'client_id',
    });

    OAuthAccessToken.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return OAuthAccessToken;
};
