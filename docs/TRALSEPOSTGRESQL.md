[> Back](../README.md)

# `TralsePostgreSQL` Middleware

The TralsePostgreSQL Middleware initializes a PostgreSQL connection and attaches defined methods to the request object in an Express application. This guide will walk you through the setup and usage of the middleware.

**TABLE OF CONTENTS**

- [`TralsePostgreSQL` Middleware](#tralsepostgresql-middleware)
  - [Advantages of Use](#advantages-of-use)
  - [Prerequesites](#prerequesites)
  - [Setup](#setup)
    - [Imports](#imports)
    - [Pool](#pool)
    - [Express App Initialization](#express-app-initialization)
    - [Usage of Middleware](#usage-of-middleware)
  - [Usage](#usage)
    - [Method Retrieval](#method-retrieval)
    - [Method Explanation](#method-explanation)

## Advantages of Use

- **Redefined Modules**: This middleware provides redefined modules that mitigate common problems encountered when using plain `pg`.

## Prerequesites

- Ensure you have initialized your `imports`, `PostgreSQL connection pool`, `Express application`, and `session middleware.` Sessions are used to store the connection ID.

## Setup

### Imports

Start by importing the necessary modules for your application:

```javascript
import { TralsePostgreSQL, getPostgres } from "@tralse/postgres-middleware";
import { Pool } from "pg";
import express from "express";
```

### Pool

Initialize the PostgreSQL connection pool with your database connection details:

```javascript
const pool = new Pool({
  // Database connection details
  host: "localhost",
  user: "your_username",
  password: "your_password",
  database: "your_database",
  connectionLimit: 10,
});
```

### Express App Initialization

Create an instance of the Express application:

```javascript
const app = express();
```

### Usage of Middleware

Use the TralsePostgreSQL middleware to handle PostgreSQL connections and transactions. Set the transaction flag to `true` if you will perform transactions.

- **Params**
  - `pool`: Pool - The database connection pool.
  - `dbName`: string - The name of the database.
  - `enableTransactions`: (optional) - Whether to enable transaction support. Default value is true.
- **Returns**: The middleware function.

**NOTE:** If you need to handle transactions, ensure the transaction flag is set to true to enable transaction.

```javascript
app.use(TralsePostgreSQL(pool, "sample", true));
```

## Usage

### Method Retrieval

Here is how to use this middleware, assuming that you've set up everything as described in the setup guide.

To retrieve the methods from the request object, use the `getPostgres` method which is imported from our package.

`getPostgres` has two parameters: the first is the request object, and the second is the database name. Remember that you must use the database name you initialized.

```javascript
app.get("/test/simple", async (req, res) => {
  // Get the necessary PostgreSQL methods from the TralsePostgreSQL middleware

  // "sample" is used as db name, as we initialized it earlier.
  const { initializeConnection, query, transaction, releaseConnection } =
    getPostgres(req, "sample");

  // rest of the code
});
```

### Method Explanation

Let's dive into what these methods can do:

- **initializeConnection**: Initializes a PostgreSQL connection and serializes it into the request.

  - **Returns**: A promise that resolves when the connection is initialized.
  - **Throws**: `DatabaseError` - If there is an error initializing the database connection.

```javascript
app.get("/test/simple", async (req, res) => {
  const { initializeConnection, query, transaction, releaseConnection } = getPostgres(req, "sample");

  try {
    await initializeConnection();
    // rest of the code
  }
  // catch and finally logic here
});
```

- **releaseConnection**: Releases the current postgres connection.

  - **Returns:** A promise that resolves when the connection is released.
  - **Throws:** `DatabaseError` - If there is an error releasing the connection.

```javascript
app.get("/test/simple", async (req, res) => {
  const { initializeConnection, query, transaction, releaseConnection } =
    getPostgres(req, "sample");

  try {
    await initializeConnection();
    // rest of the code
  } catch (error) {
    // error catching code here
  } finally {
    // Release the connection back to the pool
    await releaseConnection();
  }
  // catch and finally logic here
});
```

**NOTE:** releaseConnection is suggested to be laced in finally block as always, and make sure that it is called at the end of the middleware to avoid connection cuts.

- **query** - Executes a database query.
  - **Params**
    - `sql`: string - The SQL query string to execute.
    - `params`: (optional) any[] - The parameters for the SQL query.
    - `options`: (optional) - `alpha` May change soon, just leave blank.

To explore more the capabilities of query, view the [full documentation of query.](./QUERY.md).

```javascript
app.get("/test/simple", async (req, res) => {
  const { initializeConnection, query, transaction, releaseConnection } =
    getPostgres(req, "sample");

  try {
    await initializeConnection();

    // Execute a simple SELECT query
    const { rows } = await query("SELECT 1");

    // Send the query result back to the client
    res.send(rows);
  } catch (error) {
    // Handle any errors that occurred during the request
    res.status(500).json({ error: error.message });
  } finally {
    // Release the connection back to the pool
    await releaseConnection();
  }
  // catch and finally logic here
});
```

- **transaction**: [Click here](./TRANSACTION.md) to see the full documentation for transaction.
