import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY = { nrc_number: '', first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: '', ward: '', status: 'Active', notes: '' };

const statusBadge = (s) => {
  const map = { Active: 'badge-green', Deceased: 'badge-gray', Relocated: 'badge-yellow' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const Citizens = () => {
  const { user } = useAuth();
  const canEdit = ['admin', 'clerk'].includes(user?.role);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    api.get('/citizens', { params: { search, status, page, limit: 20 } })
      .then(res => { setRecords(res.data.data); setTotal(res.data.total); setPages(res.data.pages); })
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, [search, status, page]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true); };
  const openEdit = (r) => { setForm({ ...r, date_of_birth: r.date_of_birth?.slice(0, 10) || '' }); setEditing(r.id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/citizens/${editing}`, form);
      else await api.post('/citizens', form);
      setModal(false); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this citizen record? This cannot be undone.')) return;
    await api.delete(`/citizens/${id}`); fetchData();
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16, color: '#1e3a5f' }}>👥 Citizens & Residents</h2>
      <div className="toolbar">
        <input className="search-box" placeholder="Search by name, NRC, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option>Active</option><option>Deceased</option><option>Relocated</option>
        </select>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Citizen</button>}
        <span style={{ marginLeft: 'auto', color: '#718096', fontSize: 13 }}>{total} records</span>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>NRC Number</th><th>Full Name</th><th>Gender</th><th>Phone</th><th>Ward</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><p>No citizens found.</p></div></td></tr>
              ) : records.map(r => (
<tr key={r.id}>
  <td data-label="NRC Number"><strong>{r.nrc_number}</strong></td>
  <td data-label="Full Name">{r.first_name} {r.last_name}</td>
  <td data-label="Gender">{r.gender || '—'}</td>
  <td data-label="Phone">{r.phone || '—'}</td>
  <td data-label="Ward">{r.ward || '—'}</td>
  <td data-label="Status">{statusBadge(r.status)}</td>
  <td data-label="Actions">
    {canEdit && <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(r)}>Edit</button>}
    {user?.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>}
  </td>
</tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Citizen Record' : 'Add New Citizen'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            {error && <div style={{ color: '#e53e3e', marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group"><label>NRC Number *</label><input required value={form.nrc_number} onChange={e => f('nrc_number', e.target.value)} placeholder="e.g. 123456/78/1" /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => f('status', e.target.value)}>
                    <option>Active</option><option>Deceased</option><option>Relocated</option>
                  </select>
                </div>
                <div className="form-group"><label>First Name *</label><input required value={form.first_name} onChange={e => f('first_name', e.target.value)} /></div>
                <div className="form-group"><label>Last Name *</label><input required value={form.last_name} onChange={e => f('last_name', e.target.value)} /></div>
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => f('date_of_birth', e.target.value)} /></div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender} onChange={e => f('gender', e.target.value)}>
                    <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="e.g. 0977123456" /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => f('email', e.target.value)} /></div>
                <div className="form-group"><label>Ward</label><input value={form.ward} onChange={e => f('ward', e.target.value)} placeholder="e.g. Central Ward" /></div>
                <div className="form-group full"><label>Address</label><textarea value={form.address} onChange={e => f('address', e.target.value)} placeholder="Full residential address" /></div>
                <div className="form-group full"><label>Notes</label><textarea value={form.notes} onChange={e => f('notes', e.target.value)} /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citizens;
