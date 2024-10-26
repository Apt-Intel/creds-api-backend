"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("api_keys", "endpoints_allowed", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("api_keys", "endpoints_allowed", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    });
  },
};
