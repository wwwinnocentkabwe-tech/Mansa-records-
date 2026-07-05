import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY = { licence_number: '', business_name: '', owner_nrc: '', owner_name: '', business_type: '', address: '', ward: '', phone: '', email: '', status: 'Active', issue_date: '', expiry_date: '', notes: '' };

const statusBadge = (s) => {
  const map = { Active: 'badge-green', Expired: 'badge-red', Suspended: 'badge-yellow', Revoked: 'badge-gray' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const isExpiringSoon = (expiry_date, status) => {
  if (status !== 'Active' || !expiry_date) return false;
  const days = (new Date(expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
  return days <= 30 && days > 0;
};

const Business = () => {
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
    api.get('/business', { params: { search, status, page, limit: 20 } })
      .then(res => { setRecords(res.data.data); setTotal(res.data.total); setPages(res.data.pages); })
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, [search, status, page]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true); };
  const openEdit = (r) => {
    setForm({ ...r, issue_date: r.issue_date?.slice(0, 10) || '', expiry_date: r.expiry_date?.slice(0, 10) || '' });
    setEditing(r.id); setError(''); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/business/${editing}`, form);
      else await api.post('/business', form);
      setModal(false); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this business licence?')) return;
    await api.delete(`/business/${id}`); fetchData();
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16, color: '#1e3a5f' }}>🏪 Business Licences</h2>
      <div className="toolbar">
        <input className="search-box" placeholder="Search by business, licence, owner..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option>Active</option><option>Expired</option><option>Suspended</option><option>Revoked</option>
        </select>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Licence</button>}
        <span style={{ marginLeft: 'auto', color: '#718096', fontSize: 13 }}>{total} records</span>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Licence No.</th><th>Business Name</th><th>Owner</th><th>Type</th><th>Ward</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><p>No business licences found.</p></div></td></tr>
              ) : records.map(r => (
                <tr key={r.id} style={isExpiringSoon(r.expiry_date, r.status) ? { background: '#fffbeb' } : {}}>
                  <td><strong>{r.licence_number}</strong></td>
                  <td>{r.business_name}</td>
                  <td>{r.owner_name}<br /><small style={{ color: '#718096' }}>{r.phone}</small></td>
                  <td>{r.business_type || '—'}</td>
                  <td>{r.ward || '—'}</td>
                  <td>
                    {r.expiry_date ? new Date(r.expiry_date).toLocaleDateString('en-ZM') : '—'}
                    {isExpiringSoon(r.expiry_date, r.status) && <span className="badge badge-yellow" style={{ marginLeft: 6 }}>Soon</span>}
                  </td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
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
            {Array.from({ length: pages }, (_, i) => <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Licence' : 'Add Business Licence'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            {error && <div style={{ color: '#e53e3e', marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group"><label>Licence Number *</label><input required value={form.licence_number} onChange={e => f('licence_number', e.target.value)} placeholder="e.g. BL/MSA/2026/001" /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => f('status', e.target.value)}>
                    <option>Active</option><option>Expired</option><option>Suspended</option><option>Revoked</option>
                  </select>
                </div>
                <div className="form-group full"><label>Business Name *</label><input required value={form.business_name} onChange={e => f('business_name', e.target.value)} /></div>
                <div className="form-group"><label>Owner Name *</label><input required value={form.owner_name} onChange={e => f('owner_name', e.target.value)} /></div>
                <div className="form-group"><label>Owner NRC</label><input value={form.owner_nrc} onChange={e => f('owner_nrc', e.target.value)} /></div>
                <div className="form-group"><label>Business Type</label><input value={form.business_type} onChange={e => f('business_type', e.target.value)} placeholder="e.g. Retail Shop, Salon" /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => f('phone', e.target.value)} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => f('email', e.target.value)} /></div>
                <div className="form-group"><label>Ward</label><input value={form.ward} onChange={e => f('ward', e.target.value)} /></div>
                <div className="form-group full"><label>Address</label><textarea value={form.address} onChange={e => f('address', e.target.value)} /></div>
                <div className="form-group"><label>Issue Date</label><input type="date" value={form.issue_date} onChange={e => f('issue_date', e.target.value)} /></div>
                <div className="form-group"><label>Expiry Date</label><input type="date" value={form.expiry_date} onChange={e => f('expiry_date', e.target.value)} /></div>
                <div className="form-group full"><label>Notes</label><textarea value={form.notes} onChange={e => f('notes', e.target.value)} /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Licence'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Business;
