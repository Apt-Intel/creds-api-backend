# Creating Indexes on MongoDB Atlas

For our large-scale application with 2 million entries and billions of usernames, it's crucial to create an index on the Username field in the credentials collection. Here's how to do it using MongoDB Atlas:

1. Log in to your MongoDB Atlas account.

2. Navigate to your cluster and click on the "Collections" tab.

3. Find the database and the "credentials" collection.

4. Click on the "Indexes" tab for the credentials collection.

5. Click the "Create Index" button.

6. In the index creation form:

   - For "Field", enter "Username"
   - For "Type", select "Ascending (1)"
   - For "Index Name", you can leave it as default or name it "Username_1"

7. Advanced options (recommended for large datasets):

   - Check "Build index in background" to minimize impact on database performance
   - Consider setting "Partial Filter Expression" if not all documents need to be indexed

8. Review your index configuration and click "Create".

9. Monitor the index creation progress. For large collections, this may take some time.

Important Notes:

- Creating an index on a large collection can be resource-intensive. Plan to do this during off-peak hours.
- Ensure you have sufficient free storage space, as indexes increase the overall database size.
- After creating the index, monitor query performance to ensure it's being used effectively.
- Regularly review and maintain your indexes, removing any that are no longer necessary.

Remember: Proper indexing is crucial for query performance, especially with large datasets. However, each index also increases the storage requirements and can impact write performance. Always balance these factors when designing your database schema and index strategy.
