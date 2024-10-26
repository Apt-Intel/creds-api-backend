module.exports = (sequelize, DataTypes) => {
  const ApiUsage = sequelize.define(
    "ApiUsage",
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
      total_requests: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      daily_requests: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      monthly_requests: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      last_request_date: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "api_usage",
      timestamps: false,
      underscored: true,
    }
  );

  ApiUsage.associate = (models) => {
    ApiUsage.belongsTo(models.ApiKey, {
      foreignKey: "api_key_id",
      as: "apiKey", // Use singular alias
    });
  };

  return ApiUsage;
};
