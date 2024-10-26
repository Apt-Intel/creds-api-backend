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
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "revoked"),
        defaultValue: "active",
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      endpoints_allowed: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue("endpoints_allowed");
          return rawValue ? rawValue : [];
        },
        set(value) {
          this.setDataValue(
            "endpoints_allowed",
            Array.isArray(value) ? value.map(String) : [String(value)]
          );
        },
      },
      rate_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
      },
      daily_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      monthly_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "api_keys",
      timestamps: true,
      underscored: true,
    }
  );

  return ApiKey;
};
