const express = require('express');
const router = express.Router();
const { getCitizens, getCitizenById, createCitizen, updateCitizen, deleteCitizen } = require('../controllers/citizenController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getCitizens);
router.get('/:id', authenticate, getCitizenById);
router.post('/', authenticate, authorize('admin', 'clerk'), createCitizen);
router.put('/:id', authenticate, authorize('admin', 'clerk'), updateCitizen);
router.delete('/:id', authenticate, authorize('admin'), deleteCitizen);

module.exports = router;
