const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("api_keys", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      api_key: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("active", "suspended", "revoked"),
        allowNull: false,
        defaultValue: "active",
      },
      endpoints_allowed: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      rate_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("api_usages", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      api_key_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "api_keys",
          key: "id",
        },
      },
      total_requests: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      requests_last_hour: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("api_request_logs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      api_key_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "api_keys",
          key: "id",
        },
      },
      endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      method: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status_code: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      response_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("api_request_logs");
    await queryInterface.dropTable("api_usages");
    await queryInterface.dropTable("api_keys");
  },
};
