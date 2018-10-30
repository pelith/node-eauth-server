'use strict';

module.exports = (sequelize, DataTypes) => {
  const OAuthRefreshToken = sequelize.define('OAuthRefreshToken', {
    id: {
      type: DataTypes.INTEGER(14),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    refresh_token: DataTypes.STRING(256),
    expires: DataTypes.DATE,
    scope: DataTypes.STRING
  }, {
    tableName: 'oauth_refresh_tokens',
    timestamps: false,
    underscored: true,
  });

  OAuthRefreshToken.associate = function(models) {
    // associations can be defined here
    OAuthRefreshToken.belongsTo(models.OAuthClient, {
      foreignKey: 'client_id',
    });

    OAuthRefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
    });    
  };
  return OAuthRefreshToken;
};
