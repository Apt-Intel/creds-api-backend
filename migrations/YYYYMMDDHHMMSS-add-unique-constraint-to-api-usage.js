"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("api_usage", {
      fields: ["api_key_id"],
      type: "unique",
      name: "unique_api_key_id",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("api_usage", "unique_api_key_id");
  },
};
