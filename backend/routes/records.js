const express = require('express');
const landRouter = express.Router();
const bizRouter = express.Router();
const { getLandRecords, getLandById, createLandRecord, updateLandRecord, deleteLandRecord } = require('../controllers/landController');
const { getBusinessLicences, getBusinessById, createBusinessLicence, updateBusinessLicence, deleteBusinessLicence, getStats } = require('../controllers/businessController');
const { authenticate, authorize } = require('../middleware/auth');

// Land routes
landRouter.get('/', authenticate, getLandRecords);
landRouter.get('/:id', authenticate, getLandById);
landRouter.post('/', authenticate, authorize('admin', 'clerk'), createLandRecord);
landRouter.put('/:id', authenticate, authorize('admin', 'clerk'), updateLandRecord);
landRouter.delete('/:id', authenticate, authorize('admin'), deleteLandRecord);

// Business routes
bizRouter.get('/stats', authenticate, getStats);
bizRouter.get('/', authenticate, getBusinessLicences);
bizRouter.get('/:id', authenticate, getBusinessById);
bizRouter.post('/', authenticate, authorize('admin', 'clerk'), createBusinessLicence);
bizRouter.put('/:id', authenticate, authorize('admin', 'clerk'), updateBusinessLicence);
bizRouter.delete('/:id', authenticate, authorize('admin'), deleteBusinessLicence);

module.exports = { landRouter, bizRouter };
