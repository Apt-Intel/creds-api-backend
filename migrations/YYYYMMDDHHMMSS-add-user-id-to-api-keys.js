"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, add the column as nullable
    await queryInterface.addColumn("api_keys", "user_id", {
      type: Sequelize.STRING,
      allowNull: true, // temporarily allow null
    });

    // Update existing rows with a default value
    await queryInterface.sequelize.query(`
      UPDATE api_keys
      SET user_id = 'legacy@example.com'
      WHERE user_id IS NULL
    `);

    // Now alter the column to set it as non-nullable
    await queryInterface.changeColumn("api_keys", "user_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Add the email validation constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE api_keys
      ADD CONSTRAINT check_user_id_email
      CHECK (user_id ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the check constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE api_keys
      DROP CONSTRAINT IF EXISTS check_user_id_email
    `);

    // Remove the column
    await queryInterface.removeColumn("api_keys", "user_id");
  },
};
