import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import TaskRow from '../components/TaskRow';
import TaskForm from '../components/TaskForm';
import Pagination from '../components/Pagination';

const LIMIT = 10;

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formTask, setFormTask] = useState(undefined); // undefined = closed, null = new, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listTasks({ status, priority, search, page, limit: LIMIT });
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, priority, search, page]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Debounce search input.
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  async function handleCreate(values) {
    await api.createTask(values);
    setFormTask(undefined);
    loadTasks();
  }

  async function handleUpdate(values) {
    await api.updateTask(formTask.id, values);
    setFormTask(undefined);
    loadTasks();
  }

  async function handleToggleStatus(task) {
    const nextStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    try {
      await api.updateTask(task.id, { status: nextStatus });
    } catch (err) {
      setError(err.message);
      loadTasks();
    }
  }

  async function confirmDelete() {
    try {
      await api.deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <h2>Your tasks</h2>
          <p>{pagination.total} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormTask(null)}>
          + New task
        </button>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search title or description…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-note">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="task-list">
          <div className="empty-state">
            <h3>Nothing here yet</h3>
            <p>Create a task or adjust your filters.</p>
          </div>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onEdit={setFormTask}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      {formTask !== undefined && (
        <TaskForm
          initialTask={formTask}
          onCancel={() => setFormTask(undefined)}
          onSubmit={formTask ? handleUpdate : handleCreate}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onMouseDown={() => setDeleteTarget(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Delete this task?</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
              "{deleteTarget.title}" will be permanently removed. This can't be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: 'var(--brick)' }} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
