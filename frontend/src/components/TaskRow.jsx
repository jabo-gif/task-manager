function formatDate(value) {
  if (!value) return '';
  const d = new Date(value.replace(' ', 'T'));
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskRow({ task, onToggleStatus, onEdit, onDelete }) {
  const isCompleted = task.status === 'Completed';

  return (
    <div className={`task-row${isCompleted ? ' is-completed' : ''}`} data-priority={task.priority}>
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`tag tag-priority-${task.priority}`}>{task.priority}</span>
          <span>Created {formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="status-toggle"
          data-status={task.status}
          onClick={() => onToggleStatus(task)}
          title="Click to toggle status"
        >
          {task.status}
        </button>
        <div className="icon-actions">
          <button className="icon-btn" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(task)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
