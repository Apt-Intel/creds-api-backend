# Modifying the API Management Database Schema and Handling JSON Data

## 1. Changing the Schema of the API Management Database

### How Hard Is It to Change the Schema?

Changing the schema of the API management database involves modifying the structure of your database tables, such as adding new columns or tables. The difficulty of this task depends on several factors:

- **Database Technology:** Since your API Key Management system uses **PostgreSQL** (via **Supabase**), schema changes can be managed relatively smoothly using SQL scripts and migration tools.
- **Existing Data:** If your database contains significant data, you need to ensure that schema changes do not disrupt or corrupt existing data.
- **Application Impact:** Schema changes may require updates in your application code, especially if you use Object-Relational Mapping (ORM) tools like **Sequelize**. Models, queries, and services interacting with the database might need adjustments.
- **Deployment Workflow:** You'll need a solid migration strategy to apply changes across different environments (development, staging, production) without causing downtime.

### How to Change the Schema When Needed

Here are the steps to change your database schema safely and effectively:

#### Step 1: Plan the Schema Change

- **Define the Requirements:**
  - Determine what new data you need to store.
  - Decide whether to add a new column to an existing table or create a new table.
- **Assess the Impact:**
  - Identify which parts of your application will be affected.
  - Evaluate the need for backward compatibility.

#### Step 2: Write a Migration Script

Using a migration tool helps manage schema changes systematically. If you're using **Sequelize**, you can use its migration feature.

**Example:** Adding a new column `additional_info` of type JSONB to the `api_keys` table.

- **Create a New Migration File:**

  ````bash
  npx sequelize-cli migration:generate --name add-additional-info-to-api-keys  ```

  ````

- **Edit the Migration Script:**

```
  javascript
  // migrations/YYYYMMDDHHMMSS-add-additional-info-to-api-keys.js
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('api_keys', 'additional_info', {
        type: Sequelize.JSONB,
        defaultValue: {},
      });
    },

    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('api_keys', 'additional_info');
    },
  };
```

#### Step 3: Apply the Migration

- **Run the Migration:**

  ````bash
  npx sequelize-cli db:migrate  ```

  ````

- **Verify the Schema Change:**
  - Check your database to confirm that the new column has been added.

#### Step 4: Update the Codebase

- **Update the Model:**

```javascript
// models/apiKey.js
module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define("ApiKey", {
    // Existing columns...
    additional_info: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  });

  return ApiKey;
};
```

- **Update Services and Controllers:**
  - Modify any relevant services or controllers to handle the new column.
  - Ensure that data validation and serialization include the new field.

#### Step 5: Test Thoroughly

- **Unit Tests:**

  - Write tests covering the new functionality.
  - Ensure existing tests pass.

- **Integration Tests:**

  - Test the application end-to-end to verify that the new schema works with all components.

- **Data Integrity:**
  - Check that existing data remains intact and accessible.

#### Step 6: Deploy the Changes

- **Prepare a Deployment Plan:**

  - Coordinate schema migration and code deployment to prevent discrepancies.

- **Apply Migrations in Production:**

  - Run the migration scripts on the production database during a maintenance window if necessary.

- **Monitor the Application:**
  - Keep an eye on logs and performance metrics to catch any issues early.

## 2. Reading JSON Data in the `metadata` Column

### Storing and Accessing JSON Data

The `metadata` column in your `api_keys` table is of type `JSONB`, which allows you to store JSON data efficiently. Here's how you can interact with this data.

### Reading JSON Data

#### Using SQL Queries

You can query JSON data using PostgreSQL's JSON operators.

**Example:** Retrieve API keys where the `metadata` contains a specific key-value pair.

```sql
SELECT *
FROM api_keys
WHERE metadata ->> 'plan' = 'premium';
```

- `->>` operator extracts a text value from JSON.
- You can use `->` to get JSON objects.

#### Using Sequelize ORM

If you are using Sequelize, you can query JSON data as follows:

```javascript
const apiKeys = await ApiKey.findAll({
  where: {
    "metadata.plan": "premium",
  },
});
```

### Updating JSON Data

#### In Application Code

**Reading the Metadata:**

```javascript
const apiKey = await ApiKey.findByPk(apiKeyId);
const metadata = apiKey.metadata;

console.log(metadata); // Outputs the JSON object
```

**Updating the Metadata:**

```javascript
// Modify the metadata object
apiKey.metadata.lastAccessed = new Date().toISOString();

// Save the changes
await apiKey.save();
```

#### Using SQL Commands

You can update specific keys in the JSONB column using the `jsonb_set` function.

**Example:**

```sql
UPDATE api_keys
SET metadata = jsonb_set(metadata, '{lastAccessed}', to_jsonb(NOW())::text, true)
WHERE id = 'your-api-key-id';
```

### Considerations When Handling JSON Data

- **Schema-less Flexibility:**

  - JSONB allows you to store arbitrary data without altering the database schema.
  - Useful for storing additional information that doesn't fit into fixed columns.

- **Indexing:**

  - For better performance on queries, consider creating indexes on specific JSON fields.
  - **Example:**

  ```sql
    CREATE INDEX idx_api_keys_metadata_plan ON api_keys ((metadata ->> 'plan'));
  ```

- **Validation:**
  - Ensure that the application code validates the JSON data before saving it to the database.
  - This prevents corrupt or invalid JSON from being stored.

## 3. Planning for Future Schema Changes

### Best Practices

- **Use Migrations:**

  - Always use migration scripts to manage schema changes.
  - Tools like Sequelize CLI help maintain version control over database changes.

- **Backward Compatibility:**

  - Design changes to be backward compatible to avoid breaking existing functionality.
  - Consider rolling out changes in phases if necessary.

- **Version Control:**

  - Keep migration scripts under version control with your codebase.

- **Continuous Integration:**

  - Integrate migrations into your CI/CD pipeline to automate testing and deployment.

- **Communication:**
  - Document schema changes and inform the development team.
  - Update any API documentation if the changes affect external interfaces.

### Steps for Future Schema Changes

1. **Define the Change:**

   - Clearly specify what needs to be added or modified.

2. **Impact Analysis:**

   - Determine how the change affects existing data and code.

3. **Write Migration Scripts:**

   - Use your ORM's migration tool to create scripts for applying and reverting changes.

4. **Update Models and Code:**

   - Reflect the schema changes in your models and any code that interacts with the database.

5. **Testing:**

   - Thoroughly test the changes locally.
   - Run automated tests to catch regressions.

6. **Staging Deployment:**

   - Apply migrations and deploy code to a staging environment.
   - Conduct integration and performance testing.

7. **Production Deployment:**
   - Schedule the deployment during a low-traffic period.
   - Monitor the application closely after deployment.

## 4. Example: Adding a New Column and Reading JSON Data

### Scenario

Suppose you want to add a new column `usage_limits` to the `api_keys` table to store usage limit configurations as JSON.

### Steps

#### 1. Write a Migration Script

**Migration File:**

```javascript
// migrations/YYYYMMDDHHMMSS-add-usage-limits-to-api-keys.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("api_keys", "usage_limits", {
      type: Sequelize.JSONB,
      defaultValue: {},
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("api_keys", "usage_limits");
  },
};
```

#### 2. Update the Model

```javascript
// models/apiKey.js
module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define("ApiKey", {
    // Existing columns...
    usage_limits: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  });

  return ApiKey;
};
```

#### 3. Reading the `usage_limits` Data

```javascript
const apiKey = await ApiKey.findByPk("your-api-key-id");
const usageLimits = apiKey.usage_limits;

console.log(usageLimits); // Outputs the usage limits configuration
```

#### 4. Updating the `usage_limits` Data

```javascript
apiKey.usage_limits = {
  daily: 10000,
  monthly: 300000,
};

await apiKey.save();
```

#### 5. Querying Based on `usage_limits`

**Example:** Find API keys with daily limit greater than 5000.

```javascript
const apiKeys = await ApiKey.findAll({
  where: {
    "usage_limits.daily": {
      [Sequelize.Op.gt]: 5000,
    },
  },
});
```

**Note:** Querying nested JSON fields may require raw queries or custom functions.

## 5. Conclusion

Changing the database schema and working with JSON data in PostgreSQL is manageable with the right approach and tools. By using migration scripts and following best practices, you can safely modify your database schema without adversely affecting your application.

Reading and updating JSON data stored in `JSONB` columns allows you to maintain flexibility in your data models. ORM tools like Sequelize provide methods to interact with these fields seamlessly.

If you have future requirements to store additional data or adjust your schema, planning and executing changes carefully will help maintain the integrity and performance of your system.
