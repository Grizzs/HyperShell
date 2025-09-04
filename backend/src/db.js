import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'terminal',
  password: 'INFO341983',
  port: 5432,
});