/**
 * Seeds the database with a demo user and sample tasks.
 * Usage: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seed() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', ['demo@example.com']);
  let userId;

  if (existing.length) {
    userId = existing[0].id;
    console.log('Demo user already exists, reusing it.');
  } else {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      ['Demo User', 'demo@example.com', passwordHash]
    );
    userId = result.insertId;
    console.log('Created demo user: demo@example.com / Password123!');
  }

  const sampleTasks = [
    ['Set up project repository', 'Initialize git, add README and license', 'Completed', 'Medium'],
    ['Design database schema', 'Model tasks and users tables', 'Completed', 'High'],
    ['Build REST API', 'Implement CRUD endpoints for tasks', 'Pending', 'High'],
    ['Write unit tests', 'Cover controllers and validation', 'Pending', 'Medium'],
    ['Deploy to staging', 'Set up Docker Compose deployment', 'Pending', 'Low'],
  ];

  for (const [title, description, status, priority] of sampleTasks) {
    await pool.query(
      'INSERT INTO tasks (user_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description, status, priority]
    );
  }

  console.log(`Seeded ${sampleTasks.length} tasks for user ${userId}.`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
