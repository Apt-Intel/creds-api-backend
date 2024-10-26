module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define(
    "ApiKey",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      api_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSONB,
      },
      endpoints_allowed: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      rate_limit: {
        type: DataTypes.INTEGER,
      },
      daily_limit: {
        type: DataTypes.INTEGER,
      },
      monthly_limit: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      last_reset_date: {
        type: DataTypes.DATEONLY,
      },
    },
    {
      tableName: "api_keys",
      timestamps: false,
      underscored: true,
    }
  );

  ApiKey.associate = (models) => {
    ApiKey.hasOne(models.ApiUsage, {
      foreignKey: "api_key_id",
      as: "usage",
    });
    ApiKey.hasMany(models.ApiRequestLog, {
      foreignKey: "api_key_id",
      as: "requestLogs",
    });
  };

  return ApiKey;
};
