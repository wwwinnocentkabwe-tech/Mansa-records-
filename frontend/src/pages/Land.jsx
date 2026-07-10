import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY = { plot_number: '', owner_nrc: '', owner_name: '', owner_phone: '', location: '', ward: '', area_sqm: '', land_use: 'Residential', status: 'Active', registered_date: '', notes: '' };

const statusBadge = (s) => {
  const map = { Active: 'badge-green', Disputed: 'badge-red', Transferred: 'badge-blue', Revoked: 'badge-gray' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const Land = () => {
  const { user } = useAuth();
  const canEdit = ['admin', 'clerk'].includes(user?.role);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [landUse, setLandUse] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    api.get('/land', { params: { search, status, land_use: landUse, page, limit: 20 } })
      .then(res => { setRecords(res.data.data); setTotal(res.data.total); setPages(res.data.pages); })
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, [search, status, landUse, page]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true); };
  const openEdit = (r) => { setForm({ ...r, registered_date: r.registered_date?.slice(0, 10) || '' }); setEditing(r.id); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.put(`/land/${editing}`, form);
      else await api.post('/land', form);
      setModal(false); fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this land record?')) return;
    await api.delete(`/land/${id}`); fetchData();
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16, color: '#1e3a5f' }}>🗺️ Land & Property Records</h2>
      <div className="toolbar">
        <input className="search-box" placeholder="Search by plot, owner, location..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option>Active</option><option>Disputed</option><option>Transferred</option><option>Revoked</option>
        </select>
        <select className="filter-select" value={landUse} onChange={e => { setLandUse(e.target.value); setPage(1); }}>
          <option value="">All Land Uses</option>
          <option>Residential</option><option>Commercial</option><option>Industrial</option><option>Agricultural</option><option>Mixed</option>
        </select>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Record</button>}
        <span style={{ marginLeft: 'auto', color: '#718096', fontSize: 13 }}>{total} records</span>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Plot Number</th><th>Owner</th><th>Location</th><th>Ward</th><th>Area (m²)</th><th>Land Use</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><p>No land records found.</p></div></td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
            <td data-label="Plot Number"><strong>{r.plot_number}</strong></td>
<td data-label="Owner">{r.owner_name}<br /><small style={{ color: '#718096' }}>{r.owner_nrc}</small></td>
<td data-label="Location">{r.location}</td>
<td data-label="Ward">{r.ward || '—'}</td>
<td data-label="Area (m²)">{r.area_sqm ? Number(r.area_sqm).toLocaleString() : '—'}</td>
<td data-label="Land Use"><span className="badge badge-blue">{r.land_use}</span></td>
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
            {Array.from({ length: pages }, (_, i) => <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Land Record' : 'Add Land Record'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            {error && <div style={{ color: '#e53e3e', marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group"><label>Plot Number *</label><input required value={form.plot_number} onChange={e => f('plot_number', e.target.value)} placeholder="e.g. PLOT/MSA/001" /></div>
                <div className="form-group"><label>Registered Date</label><input type="date" value={form.registered_date} onChange={e => f('registered_date', e.target.value)} /></div>
                <div className="form-group"><label>Owner Name *</label><input required value={form.owner_name} onChange={e => f('owner_name', e.target.value)} /></div>
                <div className="form-group"><label>Owner NRC</label><input value={form.owner_nrc} onChange={e => f('owner_nrc', e.target.value)} /></div>
                <div className="form-group"><label>Owner Phone</label><input value={form.owner_phone} onChange={e => f('owner_phone', e.target.value)} /></div>
                <div className="form-group"><label>Ward</label><input value={form.ward} onChange={e => f('ward', e.target.value)} /></div>
                <div className="form-group full"><label>Location *</label><input required value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Mansa Township, Block A" /></div>
                <div className="form-group"><label>Area (m²)</label><input type="number" value={form.area_sqm} onChange={e => f('area_sqm', e.target.value)} /></div>
                <div className="form-group"><label>Land Use</label>
                  <select value={form.land_use} onChange={e => f('land_use', e.target.value)}>
                    <option>Residential</option><option>Commercial</option><option>Industrial</option><option>Agricultural</option><option>Mixed</option>
                  </select>
                </div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => f('status', e.target.value)}>
                    <option>Active</option><option>Disputed</option><option>Transferred</option><option>Revoked</option>
                  </select>
                </div>
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

export default Land;
