const pool = require('../db');

const getBusinessLicences = async (req, res) => {
  const { search, ward, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(business_name ILIKE $${params.length} OR licence_number ILIKE $${params.length} OR owner_name ILIKE $${params.length} OR owner_nrc ILIKE $${params.length})`
    );
  }
  if (ward) { params.push(ward); conditions.push(`ward = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM business_licences ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT b.*, u.full_name AS created_by_name FROM business_licences b
       LEFT JOIN users u ON b.created_by = u.id
       ${where} ORDER BY b.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: result.rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.full_name AS created_by_name FROM business_licences b
       LEFT JOIN users u ON b.created_by = u.id WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Licence not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createBusinessLicence = async (req, res) => {
  const { licence_number, business_name, owner_nrc, owner_name, business_type, address, ward, phone, email, status, issue_date, expiry_date, notes } = req.body;
  if (!licence_number || !business_name || !owner_name) {
    return res.status(400).json({ message: 'Licence number, business name, and owner name are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO business_licences (licence_number, business_name, owner_nrc, owner_name, business_type, address, ward, phone, email, status, issue_date, expiry_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [licence_number, business_name, owner_nrc, owner_name, business_type, address, ward, phone, email, status || 'Active', issue_date, expiry_date, notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Licence number already exists.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateBusinessLicence = async (req, res) => {
  const { licence_number, business_name, owner_nrc, owner_name, business_type, address, ward, phone, email, status, issue_date, expiry_date, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE business_licences SET licence_number=$1, business_name=$2, owner_nrc=$3, owner_name=$4,
       business_type=$5, address=$6, ward=$7, phone=$8, email=$9, status=$10, issue_date=$11, expiry_date=$12,
       notes=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [licence_number, business_name, owner_nrc, owner_name, business_type, address, ward, phone, email, status, issue_date, expiry_date, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Licence not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteBusinessLicence = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM business_licences WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Licence not found.' });
    res.json({ message: 'Business licence deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/business/stats - expiry alerts
const getStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Active') AS active,
        COUNT(*) FILTER (WHERE status = 'Expired') AS expired,
        COUNT(*) FILTER (WHERE status = 'Suspended') AS suspended,
        COUNT(*) FILTER (WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' AND status = 'Active') AS expiring_soon
      FROM business_licences
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getBusinessLicences, getBusinessById, createBusinessLicence, updateBusinessLicence, deleteBusinessLicence, getStats };
