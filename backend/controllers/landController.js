const pool = require('../db');

const getLandRecords = async (req, res) => {
  const { search, ward, status, land_use, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(plot_number ILIKE $${params.length} OR owner_name ILIKE $${params.length} OR owner_nrc ILIKE $${params.length} OR location ILIKE $${params.length})`
    );
  }
  if (ward) { params.push(ward); conditions.push(`ward = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
  if (land_use) { params.push(land_use); conditions.push(`land_use = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM land_records ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT l.*, u.full_name AS created_by_name FROM land_records l
       LEFT JOIN users u ON l.created_by = u.id
       ${where} ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: result.rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getLandById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.full_name AS created_by_name FROM land_records l
       LEFT JOIN users u ON l.created_by = u.id WHERE l.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createLandRecord = async (req, res) => {
  const { plot_number, owner_nrc, owner_name, owner_phone, location, ward, area_sqm, land_use, status, registered_date, notes } = req.body;
  if (!plot_number || !owner_name || !location) {
    return res.status(400).json({ message: 'Plot number, owner name, and location are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO land_records (plot_number, owner_nrc, owner_name, owner_phone, location, ward, area_sqm, land_use, status, registered_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [plot_number, owner_nrc, owner_name, owner_phone, location, ward, area_sqm, land_use, status || 'Active', registered_date, notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Plot number already exists.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateLandRecord = async (req, res) => {
  const { plot_number, owner_nrc, owner_name, owner_phone, location, ward, area_sqm, land_use, status, registered_date, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE land_records SET plot_number=$1, owner_nrc=$2, owner_name=$3, owner_phone=$4, location=$5,
       ward=$6, area_sqm=$7, land_use=$8, status=$9, registered_date=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [plot_number, owner_nrc, owner_name, owner_phone, location, ward, area_sqm, land_use, status, registered_date, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteLandRecord = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM land_records WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Land record deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getLandRecords, getLandById, createLandRecord, updateLandRecord, deleteLandRecord };
