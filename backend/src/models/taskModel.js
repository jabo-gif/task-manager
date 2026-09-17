const pool = require('../config/db');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TaskModel = {
  /**
   * Returns a page of tasks for a user, with optional status filter and
   * free-text search across title/description.
   */
  async findAll(userId, { status, priority, search, page = 1, limit = 10 }) {
    const conditions = ['user_id = ?'];
    const params = [userId];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM tasks ${where}`, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return {
      data: rows.map(mapRow),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async findById(id, userId) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return mapRow(rows[0]);
  },

  async create(userId, { title, description, status, priority }) {
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description || null, status || 'Pending', priority || 'Medium']
    );
    return this.findById(result.insertId, userId);
  },

  async update(id, userId, fields) {
    const allowed = ['title', 'description', 'status', 'priority'];
    const sets = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }
    if (!sets.length) return this.findById(id, userId);

    params.push(id, userId);
    const [result] = await pool.query(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );
    if (result.affectedRows === 0) return null;
    return this.findById(id, userId);
  },

  async remove(id, userId) {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },
};

module.exports = TaskModel;
