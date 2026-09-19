export interface IDatabaseConnectionConfig {
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
  /** Database name for PostgreSQL/MySQL, or absolute file path for SQLite. */
  databaseName: string | null;
}
