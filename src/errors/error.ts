/**
 * Custom error class for database-related errors.
 */
export class DatabaseError extends Error {
  code: string;
  constructor(message: string, code: string = "DB_ERR") {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
  }
}

/**
 * Custom error class for transaction-related errors.
 */
export class TransactionError extends Error {
  code: string;
  constructor(message: string, code: string = "TRANSACTION_ERR") {
    super(message);
    this.name = "TransactionError";
    this.code = code;
  }
}
