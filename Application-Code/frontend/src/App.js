import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

function TaskCard({ task, onUpdate, onDelete }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
            {task.title}
          </h3>
          {task.description && (
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
              {task.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#0f172a', border: '1px solid #334155',
              borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#94a3b8'
            }}>
              {STATUS_LABELS[task.status]}
            </span>
            <span style={{
              background: '#0f172a', border: `1px solid ${PRIORITY_COLORS[task.priority]}`,
              borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
              color: PRIORITY_COLORS[task.priority]
            }}>
              {task.priority}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
          <select
            value={task.status}
            onChange={(e) => onUpdate(task._id, { status: e.target.value })}
            style={{
              background: '#0f172a', border: '1px solid #475569', borderRadius: '4px',
              color: '#94a3b8', padding: '4px 6px', fontSize: '12px', cursor: 'pointer'
            }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button
            onClick={() => onDelete(task._id)}
            style={{
              background: '#450a0a', border: '1px solid #ef4444', borderRadius: '4px',
              color: '#ef4444', padding: '4px 10px', cursor: 'pointer', fontSize: '12px'
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTaskForm({ onAdd }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    await onAdd(form);
    setForm({ title: '', description: '', priority: 'medium' });
    setLoading(false);
  };

  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: '10px', padding: '20px', marginBottom: '24px'
    }}>
      <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Add New Task
      </h2>
      <input
        placeholder="Task title *"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        style={{
          width: '100%', background: '#0f172a', border: '1px solid #334155',
          borderRadius: '6px', padding: '10px 12px', color: '#e2e8f0',
          fontSize: '14px', marginBottom: '10px', outline: 'none'
        }}
      />
      <input
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        style={{
          width: '100%', background: '#0f172a', border: '1px solid #334155',
          borderRadius: '6px', padding: '10px 12px', color: '#e2e8f0',
          fontSize: '14px', marginBottom: '10px', outline: 'none'
        }}
      />
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          style={{
            background: '#0f172a', border: '1px solid #334155', borderRadius: '6px',
            color: '#e2e8f0', padding: '10px 12px', fontSize: '14px', cursor: 'pointer', flex: 1
          }}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={loading || !form.title.trim()}
          style={{
            background: loading ? '#1e3a5f' : '#2563eb',
            border: 'none', borderRadius: '6px', color: 'white',
            padding: '10px 20px', fontSize: '14px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', flex: 1
          }}
        >
          {loading ? 'Adding...' : '+ Add Task'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`${API}/tasks`);
      setTasks(data);
      setError('');
    } catch {
      setError('⚠️ Could not connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const { data } = await axios.post(`${API}/tasks`, taskData);
      setTasks([data, ...tasks]);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const { data } = await axios.put(`${API}/tasks/${id}`, updates);
      setTasks(tasks.map((t) => (t._id === id ? data : t)));
    } catch {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch {
      setError('Failed to delete task');
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        background: '#1e293b', borderBottom: '1px solid #334155',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>
            ⚡ TaskFlow
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Three-Tier App · React + Node.js + MongoDB · Deployed on AWS EKS
          </p>
        </div>
        <div style={{
          background: '#0f172a', border: '1px solid #22c55e',
          borderRadius: '6px', padding: '6px 14px', fontSize: '12px', color: '#22c55e'
        }}>
          🟢 Live on EKS
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>
        {error && (
          <div style={{
            background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <AddTaskForm onAdd={addTask} />

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'todo', 'in-progress', 'done'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#2563eb' : '#1e293b',
                border: `1px solid ${filter === f ? '#2563eb' : '#334155'}`,
                borderRadius: '6px', color: filter === f ? 'white' : '#94a3b8',
                padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: 500
              }}
            >
              {f === 'all' ? 'All' : STATUS_LABELS[f]} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading tasks...</p>
        ) : filtered.length === 0 ? (
          <div style={{
            background: '#1e293b', border: '1px dashed #334155', borderRadius: '10px',
            padding: '40px', textAlign: 'center', color: '#475569'
          }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
            <p style={{ fontSize: '15px' }}>No tasks here yet. Add one above!</p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskCard key={task._id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
          ))
        )}
      </div>
    </div>
  );
}
