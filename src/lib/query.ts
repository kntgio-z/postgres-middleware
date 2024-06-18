import { manageDeadlocks } from "./deadlock";
import { DatabaseError } from "../errors/error";
import { PoolClient, QueryResult } from "pg";
import { ExecuteDbQueryOptions } from "../types";
import { log, LogState } from "@tralse/developer-logs";
/**
 * Executes a database query with deadlock management.
 *
 * @remarks
 * This function allows executing database queries with deadlock management. It supports both individual and parallel asynchronous execution.
 *
 * @param client - The PostgreSQL client.
 * @param sql - The SQL query or queries to execute.
 * @param params - The parameters for the SQL query or queries.
 * @param options - Optional settings for configuring query execution behavior.
 * @returns The result of the query or queries.
 * @throws DatabaseError - If query execution fails.
 *
 * @example
 * ```javascript
 * import { Pool } from "pg";
 * import { executeDbQuery } from "@tralse/postgres-middleware";
 *
 * const pool = new Pool({
 *    // Database connection details
 *    host: "host",
 *    user: "username",
 *    password: "password",
 *    database: "db",
 *    connectionLimit: 10,
 *    port: 3306,
 *    waitForConnections: true,
 * });
 *
 *
 * // For individual execution
 * const getUser = async () => {
 *    const client = await pool.connect();
 *    const sql = `SELECT * FROM schema."users" WHERE id = $1`;
 *    const params = [userId];
 *
 *    try{
 *        const { rows } = await executeDbQuery(client, sql, params);
 *        return rows;
 *    } catch(error){
 *        res.status(500).send(error.message);
 *    } finally {
 *      await connection.release();
 *    }
 * }
 *
 * // For parallel execution
 * const getUserParallel = async () => {
 *    const client = await pool.connect();
 *    const sql = [`SELECT * FROM schema."user_books" WHERE id = $1`, `SELECT * FROM schema."users" WHERE id = $1`];
 *    const params = [[userId], [userId]];
 *    const options = { parallel: true };
 *
 *    try{
 *        // Executes all query using Promise.all, running them simultaneously.
 *        // Remember when using this, no query must be dependent to each other.
 *        const result = await executeDbQuery(client, sql, params, options);
 *
 *        // Extract rows
 *        const rows = result.map((res) => res.rows);
 *
 *        res.send(rows);
 *    } catch(error){
 *        res.status(500).send(error.message);
 *    } finally {
 *      await connection.release();
 *    }
 * }
 *
 * ```
 */
export const executeDbQuery = async (
  client: PoolClient,
  sql: string | string[],
  params: any[] | any[][] = [],
  options?: ExecuteDbQueryOptions
): Promise<QueryResult | QueryResult[]> => {
  return await manageDeadlocks(3, async () => {
    try {
      log.magenta(`Attempting query...`, "executeDbQuery", LogState.DEBUGMODE);

      if (!client || !('query' in client))
        throw new DatabaseError(
          "Could'nt find a client connection. Make sure that you have initialized the client connection before proceeding to this method."
        );

      let queryResult: QueryResult | QueryResult[] = [];

      if (Array.isArray(sql)) {
        if (!Array.isArray(params) || sql.length !== params.length) {
          throw new DatabaseError("Mismatched SQL queries and parameters.");
        }

        if (options?.parallel) {
          // Execute all queries in parallel
          const promises = sql.map((query, index) =>
            client.query(query, params[index])
          );
          queryResult = await Promise.all(promises);
        } else {
          // Execute queries sequentially
          for (let i = 0; i < sql.length; i++) {
            const result = await client.query(sql[i], params[i]);
            queryResult.push(result);
          }
        }
      } else {
        const result = await client.query(sql, params);
        queryResult = result;
      }

      log.green(
        "Success. Query executed",
        "executeDbQuery",
        LogState.DEBUGMODE
      );
      return queryResult;
    } catch (error: any) {
      log.red("Force exit.", "executeDbQuery", LogState.DEBUGMODE);
      throw error;
    }
  });
};
