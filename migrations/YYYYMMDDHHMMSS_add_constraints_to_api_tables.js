"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE api_keys
      ADD CONSTRAINT valid_status 
      CHECK (status IN ('active', 'suspended', 'revoked'));

      ALTER TABLE api_keys
      ADD CONSTRAINT valid_timezone 
      CHECK (timezone IS NOT NULL);

      ALTER TABLE api_usage
      ADD CONSTRAINT positive_requests 
      CHECK (
        daily_requests >= 0 AND 
        monthly_requests >= 0 AND 
        total_requests >= 0
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE api_keys
      DROP CONSTRAINT valid_status;

      ALTER TABLE api_keys
      DROP CONSTRAINT valid_timezone;

      ALTER TABLE api_usage
      DROP CONSTRAINT positive_requests;
    `);
  },
};
