/* eslint-disable class-methods-use-this */
import { Pool } from 'pg';
import  config  from '../config';

const pool = new Pool({
  user: config.db.credentials.user,
  password: config.db.credentials.password,
  host: config.db.host,
  database: config.db.name,
  port: config.db.port,
});

class Database {
  async testConnection() {
    await pool.query('SELECT 1=1');
    return 'Db Pool Connected';
  }

  async withTransaction(callback) {
    const client = await pool.connect();
    let res;
    try {
      await client.query('BEGIN');
      res = await callback(client);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return res;
  }
}

export default Database;
