import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = { full_name: '', username: '', email: '', password: '', role: 'clerk' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = () => api.get('/auth/users').then(res => setUsers(res.data)).catch(console.error);
  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/auth/users', form);
      setModal(false); setForm(EMPTY); fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user.');
    } finally { setSaving(false); }
  };

  const roleBadge = (r) => {
    const map = { admin: 'badge-red', clerk: 'badge-blue', viewer: 'badge-gray' };
    return <span className={`badge ${map[r]}`}>{r}</span>;
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16, color: '#1e3a5f' }}>🔐 Manage Staff Users</h2>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(''); setModal(true); }}>+ Add User</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Full Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                 <td data-label="Full Name"><strong>{u.full_name}</strong></td>
<td data-label="Username">{u.username}</td>
<td data-label="Email">{u.email}</td>
<td data-label="Role">{roleBadge(u.role)}</td>
<td data-label="Status"><span className={`badge ${u.is_active ? 'badge-green' : 'badge-gray'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
<td data-label="Created">{new Date(u.created_at).toLocaleDateString('en-ZM')}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Create Staff Account</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            {error && <div style={{ color: '#e53e3e', marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full"><label>Full Name *</label><input required value={form.full_name} onChange={e => f('full_name', e.target.value)} /></div>
                <div className="form-group"><label>Username *</label><input required value={form.username} onChange={e => f('username', e.target.value)} /></div>
                <div className="form-group"><label>Role *</label>
                  <select value={form.role} onChange={e => f('role', e.target.value)}>
                    <option value="clerk">Clerk</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group full"><label>Email *</label><input required type="email" value={form.email} onChange={e => f('email', e.target.value)} /></div>
                <div className="form-group full"><label>Password *</label><input required type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Minimum 6 characters" /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
