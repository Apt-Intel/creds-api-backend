module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define(
    "ApiKey",
    {
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
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true, // Assuming we're using email as user_id
        },
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
        defaultValue: 1000, // requests per minute
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return ApiKey;
};
