module.exports = (sequelize, DataTypes) => {
  const ApiUsage = sequelize.define(
    "ApiUsage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      api_key_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
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
    },
    {
      tableName: "api_usage",
      timestamps: true,
      underscored: true,
    }
  );

  ApiUsage.associate = (models) => {
    ApiUsage.belongsTo(models.ApiKey, { foreignKey: "api_key_id" });
  };

  return ApiUsage;
};
