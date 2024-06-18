# @tralse/postgres-middleware

<span class="badge-npmversion"><a href="https://npmjs.org/package/@tralse/postgres-middleware" title="View this project on NPM"><img src="https://img.shields.io/npm/v/%40tralse%2Fpostgres-middleware" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/pg" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/%40tralse%2Fpostgres-middleware.svg" alt="NPM downloads" /></a></span>

This package provides a middleware and helpful methods for modularized and remodified modules on PostgreSQL database, providing a robust development.

## Key Features

- Deadlock management with exponential and controlled backoff
- Modular functions for database operations

## Installation

```bash
npm install @tralse/postgres-middleware express
```

## Usage

- [Usage on TralsePostgreSQL](./docs/TRALSEPOSTGRESQL.md)
- [Usage on getDbQuery](./docs/DBQUERY.md)

## Errors

- **DatabaseError**: Custom error class for external database-related errors. However, PostgreSQL errors is not caught by this error, for proper tracing for the outer logic.
  - Default Code: `DB_ERR`
- **TransactionError**: Custom error class for transaction-related errors. However, PostgreSQL errors is not caught by this error, for proper tracing for the outer logic.
  - Default Code: `TRANSACTION_ERR`
  - Code: (if connection is not initialized): `CONN_NOT_INIT`

## Changelogs

Stay updated of the changes of this package. [View Changelog](./CHANGELOG.md).

## License

This is licensed under MIT License. [View License](./LICENSE)

## Issues

Bugs found? Kindly inquire to the issues section.

## Contributor/s

- [@kntgio-z](https://github.com/kntgio-z)
