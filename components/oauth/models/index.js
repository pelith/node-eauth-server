'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = {
  dialect: process.env.EAUTH_OAUTH_DB_DIALECT,
  host: process.env.EAUTH_OAUTH_DB_HOST,
  port: process.env.EAUTH_OAUTH_DB_PORT,
  username: process.env.EAUTH_OAUTH_DB_USER,
  password: process.env.EAUTH_OAUTH_DB_PASSWORD,
  database: process.env.EAUTH_OAUTH_DB_NAME,
  logging: process.env.EAUTH_DB_LOG !== 'false',
};
const sequelize = (process.env.EAUTH_OAUTH_DB_DIALECT === 'sqlite') ?
  new Sequelize({dialect: 'sqlite', storage: 'eauth.sqlite'}) :
  new Sequelize(config.database, config.username, config.password, config);
const db = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
