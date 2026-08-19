const express = require('express');
const router = express.Router();
const {
  postPlaytest,
  getPlaytests,
  postGrant,
  getGrants,
} = require('../../controllers/hub');

router.get('/playtests', getPlaytests);
router.post('/playtests', postPlaytest);
router.get('/grants', getGrants);
router.post('/grants', postGrant);

module.exports = router;
