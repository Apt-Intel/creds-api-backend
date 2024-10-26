module.exports = (sequelize, DataTypes) => {
  const ApiRequestLog = sequelize.define(
    "ApiRequestLog",
    {
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
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      endpoint: {
        type: DataTypes.TEXT,
      },
      method: {
        type: DataTypes.TEXT,
      },
      status_code: {
        type: DataTypes.INTEGER,
      },
      response_time_ms: {
        type: DataTypes.INTEGER,
      },
      ip_address: {
        type: DataTypes.TEXT,
      },
      user_agent: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "api_requests_log",
      timestamps: false,
      underscored: true,
    }
  );

  ApiRequestLog.associate = (models) => {
    ApiRequestLog.belongsTo(models.ApiKey, {
      foreignKey: "api_key_id",
      as: "apiKey",
    });
  };

  return ApiRequestLog;
};
