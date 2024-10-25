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
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return ApiRequestLog;
};
