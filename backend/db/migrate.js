/**
 * Applies schema.sql against the database named in .env (DB_NAME).
 * Usage: npm run migrate
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const dbName = process.env.NODE_ENV === 'test' ? process.env.DB_TEST_NAME : process.env.DB_NAME;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  const sql = fs
    .readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    .replace(/task_manager(?!_test)/g, dbName);

  await connection.query(sql);
  console.log(`Schema applied to database "${dbName}".`);
  await connection.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
