module.exports = (sequelize, DataTypes) => {
  const ApiRequestLog = sequelize.define(
    "ApiRequestLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        defaultValue: DataTypes.NOW,
      },
      endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "api_requests_log",
      timestamps: false,
    }
  );

  ApiRequestLog.associate = (models) => {
    ApiRequestLog.belongsTo(models.ApiKey, { foreignKey: "api_key_id" });
  };

  return ApiRequestLog;
};
