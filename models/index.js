const { sequelize, Sequelize } = require("../config/sequelize");
const logger = require("../config/logger");

const db = {
  sequelize,
  Sequelize,
};

// Only include Sequelize models (API key related)
db.ApiKey = require("./apiKey")(sequelize, Sequelize);
db.ApiUsage = require("./apiUsage")(sequelize, Sequelize);
db.ApiRequestLog = require("./apiRequestLog")(sequelize, Sequelize);

// Define associations
db.ApiKey.hasMany(db.ApiUsage, { foreignKey: "api_key_id" });
db.ApiUsage.belongsTo(db.ApiKey, { foreignKey: "api_key_id" });

db.ApiKey.hasMany(db.ApiRequestLog, { foreignKey: "api_key_id" });
db.ApiRequestLog.belongsTo(db.ApiKey, { foreignKey: "api_key_id" });

module.exports = db;
