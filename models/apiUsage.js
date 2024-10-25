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
        allowNull: false,
        defaultValue: 0,
      },
      requests_last_hour: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return ApiUsage;
};
