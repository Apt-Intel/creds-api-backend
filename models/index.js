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

// Call associate methods to set up associations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
