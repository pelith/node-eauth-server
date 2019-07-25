'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('oauth_clients', [{
        client_id: 'your_client_id',
        client_secret: 'your_client_secret',
        redirect_uri: 'http://your.domain/oauth_callback',
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('oauth_clients', null, {});
  }
};