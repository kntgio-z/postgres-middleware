[> Back](./TRALSEPOSTGRESQL.md)


# `query` Method

The `query` method allows you to execute a database query. There are different ways to implement the `query` method.

**TABLE OF CONTENTS**

- [`query` Method](#query-method)
  - [Plain Query](#plain-query)
  - [Parameterized Query](#parameterized-query)
  - [Array of Parameterized Queries](#array-of-parameterized-queries)
  - [`extractRows` Method](#extractrows-method)


## Plain Query

You can execute a simple query using the `query` method.

```javascript
app.get("/test", async (req, res) => {
  const { initializeConnection, query, releaseConnection } = getPostgres(
    req,
    "sample"
  );

  try {
    // Acquire a connection from the pool
    await initializeConnection();

    // Execute a simple SELECT query
    const { rows } = await query("SELECT * FROM Users");

    // Send the query result back to the client
    res.send(rows);
  } catch (error) {
    // Handle any errors that occurred during the request
    res.status(500).json({ error: error.message });
  } finally {
    // Release the connection back to the pool
    await releaseConnection();
  }
});
```

## Parameterized Query

You can also execute parameterized queries to prevent SQL injection and handle dynamic data.

```javascript
app.get("/test/param", async (req, res) => {
  const { initializeConnection, query, releaseConnection } = getPostgres(
    req,
    "sample"
  );

  try {
    const { id } = req.query;

    // Acquire a connection from the pool
    await initializeConnection();

    // Execute a parametized SELECT query
    const { rows } = await query("SELECT * FROM Users WHERE id=$1", [id]);

    // Send the query result back to the client
    res.send(rows);
  } catch (error) {
    // Handle any errors that occurred during the request
    res.status(500).json({ error: error.message });
  } finally {
    // Release the connection back to the pool
    await releaseConnection();
  }
});
```

## Array of Parameterized Queries

You can execute an array of parameterized queries for batch operations.

```javascript
app.get("/test/param/arr", async (req, res) => {
  const { initializeConnection, query, releaseConnection } = getPostgres(
    req,
    "sample"
  );

  try {
    const { id } = req.query;

    // Acquire a connection from the pool
    await initializeConnection();

    // Execute an array of parameterized SELECT query

    const [_, { rows }] = await query(
      [
        "INSERT INTO Users (name, id) VALUES (`John`, 1)",
        "SELECT name FROM Users WHERE id=$1",
      ],
      [null, [id]]
    );

    // Send the query result back to the client
    res.send(rows);
  } catch (error) {
    // Handle any errors that occurred during the request
    res.status(500).json({ error: error.message });
  } finally {
    // Release the connection back to the pool
    await releaseConnection();
  }
});
```

## `extractRows` Method

This method extracts rows from a PostgreSQL query result or an array of query results.

- **Param** `result`: The result object or array of result objects from a PostgreSQL query.
- **Returns**: An array of rows extracted from the query results. If `result` is an array,it returns an array where each element corresponds to the rows of each query result.

```javascript
import { extractRows } from "@tralse/postgres-middleware";

// rest of code

app.get("/test/extract", async (req, res) => {
  const { initializeConnection, query, releaseConnection } = getPostgres(
    req,
    "sample"
  );

  try {
    const { id } = req.query;

    // Acquire a connection from the pool
    await initializeConnection();

    // Execute an array of parameterized SELECT query

    const result = await query(
      [
        "SELECT * FROM Details WHERE id=$1",
        "SELECT name FROM Users WHERE id=$1",
      ],
      [[id], [id]]
    );

    const rows = extractRows(result);

    // Send the query result back to the client
    res.send(rows);
  } catch (error) {
    // Handle any errors that occurred during the request
    res.status(500).json({ error: error.message });
  } finally {
    // Release the connection back to the pool
    await releaseConnection();
  }
});
```
