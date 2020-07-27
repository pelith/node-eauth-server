'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User',  {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    ens: DataTypes.STRING(255),
    scope: DataTypes.STRING
  }, {
    tableName: 'user',
    timestamps: false,
    underscored: true,
  });

  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
}

